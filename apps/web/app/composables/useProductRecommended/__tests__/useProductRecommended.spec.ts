import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { Product } from '@plentymarkets/shop-api';
import { useProductRecommended } from '~/composables/useProductRecommended/useProductRecommended';

const { useSdk, useAsyncData, useHandleError } = vi.hoisted(() => ({
  useSdk: vi.fn(),
  useAsyncData: vi.fn(),
  useHandleError: vi.fn(),
}));

mockNuxtImport('useSdk', () => useSdk);
mockNuxtImport('useAsyncData', () => useAsyncData);
mockNuxtImport('useHandleError', () => useHandleError);

const createProduct = (variationId: number, price: number, rrp?: number): Product =>
  ({
    variation: { id: variationId },
    prices: {
      default: {
        unitPrice: { value: price },
      },
      rrp: rrp
        ? {
            unitPrice: { value: rrp },
          }
        : null,
    },
  }) as Product;

describe('useProductRecommended', () => {
  const getFacet = vi.fn();
  const getProduct = vi.fn();
  const getProductsByIds = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAsyncData.mockImplementation(async (_key: string, handler: () => Promise<Product[]>) => ({
      data: ref(await handler()),
      error: ref(null),
    }));

    useSdk.mockReturnValue({
      plentysystems: {
        getFacet,
        getProduct,
        getProductsByIds,
      },
    });
  });

  it('should return enriched product recommended', async () => {
    const facetProduct = createProduct(1145, 0);
    const enrichedProduct = createProduct(1145, 9.95, 19.95);

    getFacet.mockResolvedValue({ data: { products: [facetProduct] } });
    getProductsByIds.mockResolvedValue({ data: { products: [enrichedProduct], total: 1 } });

    const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended('recommended-products');

    await fetchProductRecommended({ type: 'category', categoryId: '16' });

    expect(getFacet).toHaveBeenCalledWith(
      expect.objectContaining({
        itemsPerPage: 12,
        sort: 'item.score',
      }),
    );
    expect(getProductsByIds).toHaveBeenCalledWith({ variationIds: [1145], itemsPerPage: 1 });
    expect(recommendedProducts.value[0]!.prices?.default?.unitPrice.value).toBe(9.95);
    expect(recommendedProducts.value[0]!.prices?.rrp?.unitPrice.value).toBe(19.95);
  });

  it('should filter products without displayable prices after enrichment', async () => {
    const firstZeroProduct = createProduct(1145, 0);
    const secondZeroProduct = createProduct(1146, 0);
    const enrichedZeroProduct = createProduct(1145, 0);
    const enrichedProductWithPrice = createProduct(1146, 9.95, 19.95);

    getFacet.mockResolvedValue({ data: { products: [firstZeroProduct, secondZeroProduct] } });
    getProductsByIds.mockResolvedValue({
      data: { products: [enrichedZeroProduct, enrichedProductWithPrice], total: 2 },
    });

    const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended('priced-products');

    await fetchProductRecommended({ type: 'category', categoryId: '16' });

    expect(recommendedProducts.value).toEqual([enrichedProductWithPrice]);
  });

  it('should keep facet products when enrichment fails', async () => {
    const facetProduct = createProduct(1145, 0);

    getFacet.mockResolvedValue({ data: { products: [facetProduct] } });
    getProductsByIds.mockRejectedValue(new Error('Enrichment failed'));

    const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended('fallback-products');

    await fetchProductRecommended({ type: 'category', categoryId: '16' });

    expect(recommendedProducts.value).toEqual([facetProduct]);
  });

  it('should fetch products by variation ids in configured order', async () => {
    const firstProduct = createProduct(1145, 19.95);
    const secondProduct = createProduct(1146, 29.95);

    getProductsByIds.mockResolvedValue({ data: { products: [secondProduct, firstProduct], total: 2 } });

    const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended('manual-products');

    await fetchProductRecommended({ type: 'variation_ids', variationIds: '1145, 1146' });

    expect(getFacet).not.toHaveBeenCalled();
    expect(getProductsByIds).toHaveBeenCalledWith({ variationIds: [1145, 1146], itemsPerPage: 2 });
    expect(recommendedProducts.value).toEqual([firstProduct, secondProduct]);
  });

  it('should fetch products by item ids in configured order', async () => {
    const firstProduct = createProduct(1145, 19.95);
    const secondProduct = createProduct(1146, 29.95);

    getProduct.mockResolvedValueOnce({ data: firstProduct }).mockResolvedValueOnce({ data: secondProduct });

    const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended('manual-item-products');

    await fetchProductRecommended({ type: 'item_ids', itemIds: '21440484, 21456890' });

    expect(getFacet).not.toHaveBeenCalled();
    expect(getProductsByIds).not.toHaveBeenCalled();
    expect(getProduct).toHaveBeenNthCalledWith(1, { id: 21440484 });
    expect(getProduct).toHaveBeenNthCalledWith(2, { id: 21456890 });
    expect(recommendedProducts.value).toEqual([firstProduct, secondProduct]);
  });
});
