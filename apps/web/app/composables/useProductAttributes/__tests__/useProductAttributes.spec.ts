import ProductFixture from '../../../utils/__tests__/__fixtures__/Product';
import type { Product } from '@plentymarkets/shop-api';

describe('useProductAttributes', () => {
  it('should initialize state correctly', () => {
    const { attributes, attributeValues, combinations, itemId, variationId } = useProductAttributes();

    expect(attributes.value).toEqual([]);
    expect(attributeValues.value).toEqual({});
    expect(combinations.value).toEqual([]);
    expect(itemId.value).toBe(0);
    expect(variationId.value).toBe(0);
  });

  it('should update attribute values', () => {
    const { setAttribute, updateValue, attributeValues } = useProductAttributes();
    setAttribute(ProductFixture, true);
    updateValue(1, 1);

    expect(attributeValues.value).toEqual({ 1: 1 });
  });

  it('should should return empty object if value is not found during update', () => {
    const { setAttribute, updateValue, attributeValues } = useProductAttributes();
    setAttribute(ProductFixture, true);
    updateValue(1, 2);

    expect(attributeValues.value).toEqual({});
  });

  it('should get the correct combination of attributes', () => {
    const { setAttribute, getCombination } = useProductAttributes();

    setAttribute(ProductFixture, true);
    const combination = getCombination();

    expect(combination).toEqual({
      attributes: [],
      isSalable: true,
      unitCombinationId: 9,
      unitId: 5,
      unitName: '2 liter',
      variationId: 1100,
    });
  });

  it('should get the correct attribute value', () => {
    const { setAttribute, updateValue, getValue } = useProductAttributes();
    setAttribute(ProductFixture, true);
    updateValue(1, 1);

    const value = getValue(1);

    expect(value).toBe(1);
  });

  it('should only keep attribute values from salable variation combinations', () => {
    const product = {
      ...ProductFixture,
      attributes: [{ attributeId: 1, value: { id: 1 } }],
      variationAttributeMap: {
        variations: [
          {
            variationId: 1100,
            isSalable: true,
            unitCombinationId: 9,
            unitId: 5,
            unitName: '2 liter',
            attributes: [{ attributeId: 1, attributeValueId: 1 }],
          },
          {
            variationId: 1101,
            isSalable: false,
            unitCombinationId: 9,
            unitId: 5,
            unitName: '2 liter',
            attributes: [{ attributeId: 1, attributeValueId: 2 }],
          },
        ],
        attributes: [
          {
            attributeId: 1,
            position: 1,
            name: 'Size',
            type: 'dropdown',
            values: [
              { attributeValueId: 1, position: 1, name: 'In stock', imageUrl: '' },
              { attributeValueId: 2, position: 2, name: 'Out of stock', imageUrl: '' },
            ],
          },
        ],
      },
    } as Product;

    const { setAttribute, attributes, combinations, attributeValues } = useProductAttributes();
    setAttribute(product, true);

    expect(attributes.value[0]?.values.map((value) => value.attributeValueId)).toEqual([1]);
    expect(combinations.value.map((combination) => combination.variationId)).toEqual([1100]);
    expect(attributeValues.value).toEqual({ 1: 1 });
  });

  it('should not preselect an unsalable attribute value', () => {
    const product = {
      ...ProductFixture,
      attributes: [{ attributeId: 1, value: { id: 2 } }],
      variationAttributeMap: {
        variations: [
          {
            variationId: 1100,
            isSalable: true,
            unitCombinationId: 9,
            unitId: 5,
            unitName: '2 liter',
            attributes: [{ attributeId: 1, attributeValueId: 1 }],
          },
          {
            variationId: 1101,
            isSalable: false,
            unitCombinationId: 9,
            unitId: 5,
            unitName: '2 liter',
            attributes: [{ attributeId: 1, attributeValueId: 2 }],
          },
        ],
        attributes: [
          {
            attributeId: 1,
            position: 1,
            name: 'Size',
            type: 'dropdown',
            values: [
              { attributeValueId: 1, position: 1, name: 'In stock', imageUrl: '' },
              { attributeValueId: 2, position: 2, name: 'Out of stock', imageUrl: '' },
            ],
          },
        ],
      },
    } as Product;

    const { setAttribute, attributeValues } = useProductAttributes();
    setAttribute(product, true);

    expect(attributeValues.value).toEqual({});
  });
});
