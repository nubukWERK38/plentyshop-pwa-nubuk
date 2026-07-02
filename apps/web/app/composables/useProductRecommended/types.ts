import type { Product, FacetSearchCriteria } from '@plentymarkets/shop-api';

export type ProductRecommendedSearchCriteria = Omit<FacetSearchCriteria, 'type'> & {
  type?: FacetSearchCriteria['type'] | 'variation_ids';
  variationIds?: string;
};

export interface UseProductRecommendedState {
  data: Product[];
  loading: boolean;
}

export type FetchProductRecommended = (params: ProductRecommendedSearchCriteria) => Promise<Product[]>;

export interface useProductRecommended {
  data: Readonly<Ref<UseProductRecommendedState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchProductRecommended: FetchProductRecommended;
}

export type UseProductRecommendedReturn = (categoryId: string) => useProductRecommended;
