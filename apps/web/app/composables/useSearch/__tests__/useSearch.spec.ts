import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSearch } from '../useSearch';
const { getSearch, getItemSearchAutocomplete, useHandleError } = vi.hoisted(() => ({
  getSearch: vi.fn(),
  getItemSearchAutocomplete: vi.fn(),
  useHandleError: vi.fn(),
}));
mockNuxtImport('useSdk', () => () => ({ plentysystems: { getSearch, getItemSearchAutocomplete } }));
mockNuxtImport('useHandleError', () => useHandleError);

describe('search result fallback protection', () => {
  beforeEach(() => {
    clearNuxtState();
    vi.resetAllMocks();
  });
  it.each(['sp connect s26', 'sp conect s26'])(
    'returns no products instead of backend fallback results for %s',
    async (term) => {
      getItemSearchAutocomplete.mockResolvedValue({ data: { total: 0 } });
      const search = useSearch();
      const result = await search.getSearch({ term });
      expect(result.products).toEqual([]);
      expect(result.pagination.totals).toBe(0);
      expect(getSearch).not.toHaveBeenCalled();
      expect(search.loading.value).toBe(false);
    },
  );
  it('passes explicit sorting and filters through for real matches', async () => {
    getItemSearchAutocomplete.mockResolvedValue({ data: { total: 10 } });
    getSearch.mockResolvedValue({ data: { products: [], facets: [], pagination: { totals: 10 } } });
    await useSearch().getSearch({
      term: 'sp connect s25',
      sort: 'default.recommended_sorting',
      facets: '491',
      page: 2,
    });
    expect(getSearch).toHaveBeenCalledWith(
      expect.objectContaining({ term: 'sp connect s25', sort: 'default.recommended_sorting', facets: '491', page: 2 }),
    );
  });
  it('keeps tag searches independent of the text search guard', async () => {
    getSearch.mockResolvedValue({ data: { products: [], facets: [], pagination: { totals: 0 } } });
    await useSearch().searchByTag('4');
    expect(getItemSearchAutocomplete).not.toHaveBeenCalled();
    expect(getSearch).toHaveBeenCalledWith(expect.objectContaining({ type: 'tag', tagId: '4' }));
  });
});
