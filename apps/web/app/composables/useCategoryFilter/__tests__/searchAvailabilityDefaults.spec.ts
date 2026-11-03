import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useCategoryFilter } from '../useCategoryFilter';
import { getSearchPath, SEARCH_DEFAULT_AVAILABILITY_FACETS } from '~/utils/pathHelper';

const { route, navigateTo } = vi.hoisted(() => ({
  route: { fullPath: '/search', query: {} as Record<string, string>, meta: { type: 'search' } },
  navigateTo: vi.fn(),
}));
mockNuxtImport('useRouter', () => () => ({ currentRoute: { value: route } }));
mockNuxtImport('useLocalization', () => () => ({ getCategoryUrlFromRoute: (path: string) => path.split('?')[0] }));
mockNuxtImport('useSiteSettings', () => () => ({ getSetting: () => 'texts.name1_asc' }));
mockNuxtImport('useRuntimeConfig', () => () => ({ public: { defaultItemsPerPage: 10 } }));
mockNuxtImport('useLocalePath', () => () => (path: string) => path);
mockNuxtImport('navigateTo', () => navigateTo);

describe('search availability defaults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.fullPath = '/search';
    route.meta.type = 'search';
    route.query = { term: 'sp connect s25' };
  });

  it('uses relevance and available products for search URLs without explicit choices', () => {
    const filters = useCategoryFilter();
    expect(filters.getFacetsFromURL()).toMatchObject({ sort: 'item.score', facets: '491,612,495' });
  });

  it('includes the same defaults in new search links', () => {
    const url = new URL(getSearchPath('sp connect s25'), 'https://example.test');
    expect(url.searchParams.get('term')).toBe('sp connect s25');
    expect(url.searchParams.get('sort')).toBe('item.score');
    expect(url.searchParams.get('facets')).toBe(SEARCH_DEFAULT_AVAILABILITY_FACETS);
  });

  it('preserves an explicit availability and sorting choice', () => {
    route.query = { term: 'bosch', facets: '491', sort: 'sorting.price.avg_asc', page: '2' };
    expect(useCategoryFilter().getFacetsFromURL()).toMatchObject({
      facets: '491',
      sort: 'sorting.price.avg_asc',
      page: 2,
    });
  });

  it('allows customers to explicitly clear all search filters', () => {
    useCategoryFilter().updateFilters({ '491': false, '612': false, '495': false });
    expect(navigateTo).toHaveBeenCalledWith({ query: { term: 'sp connect s25', facets: '' } });
    route.query.facets = '';
    expect(useCategoryFilter().getFacetsFromURL().facets).toBe('');
  });

  it('keeps category sorting and availability unchanged', () => {
    route.fullPath = '/markenwelt';
    route.meta.type = 'category';
    route.query = {};
    expect(useCategoryFilter().getFacetsFromURL()).toMatchObject({ sort: 'texts.name1_asc', facets: undefined });
  });
});
