import { handlePreviewProducts } from '../handle-preview-products';
import type { UseProductsState } from '~/composables/useProducts/types';

const useEditorStateMock = vi.hoisted(() => vi.fn());

mockNuxtImport('useEditorState', () => useEditorStateMock);

describe('handlePreviewProducts', () => {
  beforeEach(() => {
    useEditorStateMock.mockReturnValue({
      isInEditor: ref(true),
    });
  });

  it('preserves the real category when adding editor example products', () => {
    const category = {
      id: 3353,
      type: 'item',
      details: [{ name: 'radhose-kurz', nameUrl: 'radhose-kurz' }],
    };
    const state = ref({
      data: {
        category,
        products: [],
        facets: [],
        languageUrls: { de: '/produkte/bekleidung/radhosen/radhose-kurz/' },
        pagination: { totals: 0 },
      },
      loading: false,
      productsPerPage: 24,
      currentProduct: {},
    } as unknown as UseProductsState);

    handlePreviewProducts(state, 'de');

    expect(state.value.data.category).toEqual(category);
    expect(state.value.data.category.details?.[0]?.name).toBe('radhose-kurz');
    expect(state.value.data.products).toHaveLength(8);
    expect(state.value.data.languageUrls).toEqual({ de: '/produkte/bekleidung/radhosen/radhose-kurz/' });
  });
});
