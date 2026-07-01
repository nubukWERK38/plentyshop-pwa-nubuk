import type {
  GetCombination,
  GetValue,
  SetAttribute,
  UpdateValue,
  UseProductAttributesReturn,
  UseProductAttributesState,
} from './types';
import type { Product, VariationMapProductAttribute, VariationMapProductVariation } from '@plentymarkets/shop-api';
import { sortProductAttributes } from '~/utils/sortAttributeValues';

/**
 * @description Composable for handling product attributes.
 * @returns UseProductAttributesReturn
 * @example
 * ``` ts
 * const {
 *  setAttribute, updateValue, attributes, getCombination, itemId, variationId, attributesValues, combinations
 * } = useProductAttributes();
 * ```
 */
export const useProductAttributes = (): UseProductAttributesReturn => {
  const state = useState<UseProductAttributesState>(`useProductAttributes`, () => ({
    attributes: [],
    attributeValues: {},
    combinations: [],
    itemId: 0,
    variationId: 0,
  }));

  /**
   * @description Function for redirecting to the product variation.
   * @example
   * ``` ts
   * changeVariationId(1072);
   * ```
   */
  const changeVariationId = (variationId: number): void => {
    if (state.value.variationId === variationId) return;

    const route = useRoute();

    if (!useCallisto().isEnabled) {
      const path = updateProductURLPathForVariation(route.path, state.value.itemId, variationId);
      navigateTo(path);
    }

    state.value.variationId = variationId;
  };

  /**
   * @description Function for getting a valid combination from selected attributes.
   * @returns VariationMapProductVariation | null
   * @example
   * ``` ts
   * getCombination();
   * ```
   */
  const getCombination: GetCombination = (): VariationMapProductVariation | null => {
    return (
      state.value.combinations.find((combination) => {
        if (combination?.attributes?.length === Object.values(state.value.attributeValues).length) {
          return combination.attributes?.every((attribute) => {
            return state.value.attributeValues[attribute.attributeId] === attribute.attributeValueId;
          });
        }
        return false;
      }) ?? null
    );
  };

  /**
   * @description Helper function to check if a combination matches the given attribute values.
   */
  const isSalableCombination = (combination: VariationMapProductVariation): boolean => combination.isSalable === true;

  const hasAttributeCombinationData = (combinations: VariationMapProductVariation[]): boolean =>
    combinations.some((combination) => (combination.attributes?.length ?? 0) > 0);

  const filterAttributesBySalableCombinations = (
    attributes: VariationMapProductAttribute[],
    combinations: VariationMapProductVariation[],
    salableCombinations: VariationMapProductVariation[],
  ) => {
    if (!hasAttributeCombinationData(combinations)) return attributes;

    return attributes.map((attribute) => {
      const salableValueIds = new Set(
        salableCombinations.flatMap(
          (combination) =>
            combination.attributes
              ?.filter((combinationAttribute) => combinationAttribute.attributeId === attribute.attributeId)
              .map((combinationAttribute) => combinationAttribute.attributeValueId) ?? [],
        ),
      );

      return {
        ...attribute,
        values: attribute.values.filter((value) => salableValueIds.has(value.attributeValueId)),
      };
    });
  };

  const combinationMatchesAttributes = (
    combination: VariationMapProductVariation,
    attributeValues: Record<number, number>,
  ): boolean => {
    return Object.entries(attributeValues).every(([attributeId, valueId]) => {
      return combination.attributes?.some((attribute) => {
        return attribute.attributeId === Number(attributeId) && attribute.attributeValueId === valueId;
      });
    });
  };

  /**
   * @description Helper function to check if a value is available in any combination.
   */
  const isValueAvailableInCombinations = (attributeValues: Record<number, number>): boolean => {
    return (
      state.value.combinations?.some((combination) => combinationMatchesAttributes(combination, attributeValues)) ??
      false
    );
  };

  /**
   * @description Function disabling attributes based on possible combinations.
   * @example
   * ``` ts
   * disableAttributes();
   * ```
   */
  const disableAttributes = () => {
    state.value.attributes.forEach((attribute) => {
      attribute.values.forEach((value) => {
        const attributeValues = { ...state.value.attributeValues, [attribute.attributeId]: value.attributeValueId };
        value.disabled = !isValueAvailableInCombinations(attributeValues);
      });
    });

    const combination = getCombination();

    if (combination) {
      const id = Number(combination.variationId);
      changeVariationId(id);
    }
  };

  /**
   * @description Function for set up the product attributes and preselect them if needed.
   * @example
   * ``` ts
   * setAttribute(product, true);
   * ```
   */
  const setAttribute: SetAttribute = (product: Product, preSelectAttributes = false) => {
    const combinations = product.variationAttributeMap?.variations || [];
    const salableCombinations = combinations.filter(isSalableCombination);

    state.value.itemId = product.item.id;
    state.value.variationId = product.variation.id;
    state.value.attributes = sortProductAttributes(
      filterAttributesBySalableCombinations(
        product.variationAttributeMap?.attributes || [],
        combinations,
        salableCombinations,
      ),
    );
    state.value.combinations = salableCombinations;
    state.value.attributeValues = {};

    if (preSelectAttributes) {
      product.attributes?.forEach((attribute) => {
        const hasAvailableValue = state.value.attributes
          .find((availableAttribute) => availableAttribute.attributeId === attribute.attributeId)
          ?.values.some((value) => value.attributeValueId === attribute.value.id);

        if (hasAvailableValue) state.value.attributeValues[attribute.attributeId] = attribute.value.id;
      });
    }

    disableAttributes();
  };

  /**
   * @description Function for updating the value of an attribute.
   * @example
   * ``` ts
   * updateValue(1, 3);
   * ```
   */
  const updateValue: UpdateValue = (attributeId: number, valueId: number | undefined) => {
    const item = state.value.attributes.find((attribute) => attribute.attributeId === attributeId);
    const value = item?.values.find((value) => value.attributeValueId === valueId) || undefined;

    if (!value || !valueId) {
      const { [attributeId]: _, ...rest } = state.value.attributeValues;
      state.value.attributeValues = rest;
      disableAttributes();
      return;
    }

    if (value.disabled) {
      const oldValues = { ...state.value.attributeValues };
      state.value.attributeValues = { [attributeId]: valueId };
      disableAttributes();

      Object.entries(oldValues).forEach(([oldAttributeId, oldValueId]) => {
        if (Number(oldAttributeId) === attributeId) return;

        const oldValue = state.value.attributes
          .find((attribute) => attribute.attributeId === Number(oldAttributeId))
          ?.values.find((value) => value.attributeValueId === oldValueId);

        if (oldValue && !oldValue.disabled) {
          state.value.attributeValues[Number(oldAttributeId)] = oldValueId;
          disableAttributes();
        }
      });
      return;
    }

    if (state.value.attributeValues[attributeId] !== valueId) {
      state.value.attributeValues[attributeId] = valueId;
    }

    disableAttributes();
  };

  /**
   * @description Function for getting the value of an attribute.
   * @returns number | undefined
   * @example
   * ``` ts
   * getValue(1);
   * ```
   */
  const getValue: GetValue = (attributeId: number): number | undefined => {
    return state.value.attributeValues[attributeId] || undefined;
  };

  return {
    ...toRefs(state.value),
    setAttribute,
    updateValue,
    getValue,
    getCombination,
  };
};
