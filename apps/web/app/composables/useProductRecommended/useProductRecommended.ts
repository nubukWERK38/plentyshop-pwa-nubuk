import type {
  UseProductRecommendedReturn,
  UseProductRecommendedState,
  FetchProductRecommended,
} from '~/composables/useProductRecommended/types';
import { productGetters, type FacetSearchCriteria, type Product } from '@plentymarkets/shop-api';

const RECOMMENDED_PRODUCTS_LIMIT = 20;
const RECOMMENDED_PRODUCTS_FETCH_LIMIT = 250;

const enrichProductsByVariationIds = async (products: Product[]): Promise<Product[]> => {
  const variationIds = [
    ...new Set(products.map((product) => productGetters.getVariationId(product)).filter((id) => id > 0)),
  ];

  if (!variationIds.length) return products;

  try {
    const { data } = await useSdk().plentysystems.getProductsByIds({
      variationIds,
      itemsPerPage: products.length,
    });
    const enrichedProducts = data?.products ?? [];
    const enrichedProductsByVariationId = new Map(
      enrichedProducts.map((product) => [productGetters.getVariationId(product), product]),
    );

    return products.map(
      (product) => enrichedProductsByVariationId.get(productGetters.getVariationId(product)) ?? product,
    );
  } catch {
    return products;
  }
};

const hasDisplayablePrice = (product: Product) => (productGetters.getPrice(product) ?? 0) > 0;

const getDisplayableProducts = (products: Product[]) => {
  const productsWithPrices = products.filter(hasDisplayablePrice);

  return (productsWithPrices.length ? productsWithPrices : products).slice(0, RECOMMENDED_PRODUCTS_LIMIT);
};

/**
 * Composable for managing recommended products data
 * @param categoryId Product slug
 * @return UseProductRecommendedReturn
 * @example
 * ``` ts
 * const { data, loading, fetchProductRecommended } = useProductRecommended('1');
 * ```
 */
export const useProductRecommended: UseProductRecommendedReturn = (categoryId: string) => {
  const state = useState<UseProductRecommendedState>(`useProductRecommended-${categoryId}`, () => ({
    data: [],
    loading: false,
  }));

  /** Function for fetching product recommended data
   * @return FetchProductRecommended
   * @example
   * ``` ts
   * fetchProductRecommended('1');
   * ```
   * @param params
   */
  const fetchProductRecommended: FetchProductRecommended = async (params: FacetSearchCriteria) => {
    state.value.loading = true;

    const common = {
      itemsPerPage: RECOMMENDED_PRODUCTS_FETCH_LIMIT,
      sort: 'item.score',
      type: params.type,
    };

    const payload = {
      ...common,
      itemId: params.itemId,
      crossSellingRelation: params.crossSellingRelation,
      categoryId: params.categoryId,
    };

    const idForKey = params.type === 'cross_selling' ? params.itemId : params.categoryId;

    const { data, error } = await useAsyncData(
      `useProductRecommended-${params.type}-${idForKey}-${params.crossSellingRelation}`,
      async () => {
        const response = await useSdk().plentysystems.getFacet(payload);
        const products = await enrichProductsByVariationIds(response?.data?.products ?? []);

        return getDisplayableProducts(products);
      },
    );

    useHandleError(error.value ?? null);
    state.value.data = data?.value ?? state.value.data;
    state.value.loading = false;
    return state.value.data;
  };

  return {
    fetchProductRecommended,
    ...toRefs(state.value),
  };
};
