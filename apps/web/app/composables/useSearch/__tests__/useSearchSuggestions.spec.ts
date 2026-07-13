import type { ItemSearchAutocompleteResult } from '@plentymarkets/shop-api';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useSearchSuggestions } from '../useSearchSuggestions';

const { getItemSearchAutocomplete, useHandleError } = vi.hoisted(() => ({
  getItemSearchAutocomplete: vi.fn(),
  useHandleError: vi.fn(),
}));

mockNuxtImport('useSdk', () => () => ({
  plentysystems: { getItemSearchAutocomplete },
}));
mockNuxtImport('useHandleError', () => useHandleError);

const createResult = (
  label: string,
  overrides: Partial<ItemSearchAutocompleteResult> = {},
): ItemSearchAutocompleteResult => ({
  categories: [],
  suggestions: [],
  items: [
    {
      label,
      image: '',
      url: `/${label}`,
      beforeLabel: '',
      afterLabel: '',
      count: 1,
      imageAlt: '',
      price: null,
      crossedPrice: null,
    },
  ],
  total: 1,
  ...overrides,
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('useSearchSuggestions', () => {
  beforeEach(() => {
    clearNuxtState();
    vi.clearAllMocks();
  });

  it('renders category and product results before slower search term suggestions finish', async () => {
    const categoryResult = createResult('product', {
      categories: [
        {
          label: 'category',
          image: '',
          url: '/category',
          beforeLabel: '',
          afterLabel: '',
          count: 1,
          imageAlt: '',
        },
      ],
      total: 12,
    });
    const suggestionResult = createResult('unused-product', {
      suggestions: [
        {
          label: 'search phrase',
          image: '',
          url: '/search',
          beforeLabel: '',
          afterLabel: '',
          count: 8,
          imageAlt: '',
        },
      ],
    });
    const suggestions = deferred<{ data: ItemSearchAutocompleteResult }>();

    getItemSearchAutocomplete.mockImplementation(({ types }: { types: string[] }) =>
      types.includes('category') ? Promise.resolve({ data: categoryResult }) : suggestions.promise,
    );

    const { loading, results, searchSuggestions, searchTerm } = useSearchSuggestions();
    const request = searchSuggestions('test query');

    await vi.waitFor(() => expect(results.value?.categories[0]?.label).toBe('category'));
    expect(results.value?.items[0]?.label).toBe('product');
    expect(results.value?.suggestions).toEqual([]);
    expect(searchTerm.value).toBe('test query');
    expect(loading.value).toBe(false);

    suggestions.resolve({ data: suggestionResult });
    await request;

    expect(results.value?.categories[0]?.label).toBe('category');
    expect(results.value?.items[0]?.label).toBe('product');
    expect(results.value?.suggestions[0]?.label).toBe('search phrase');
    expect(results.value?.total).toBe(12);
  });

  it('deduplicates an identical query while its requests are pending', async () => {
    const category = deferred<{ data: ItemSearchAutocompleteResult }>();
    const suggestions = deferred<{ data: ItemSearchAutocompleteResult }>();

    getItemSearchAutocomplete.mockImplementation(({ types }: { types: string[] }) =>
      types.includes('category') ? category.promise : suggestions.promise,
    );

    const { searchSuggestions } = useSearchSuggestions();
    const firstRequest = searchSuggestions('duplicate');
    await searchSuggestions('duplicate');

    expect(getItemSearchAutocomplete).toHaveBeenCalledTimes(2);

    category.resolve({ data: createResult('product') });
    suggestions.resolve({ data: createResult('product') });
    await firstRequest;
  });

  it('ignores responses from an outdated query', async () => {
    const requests = new Map<string, ReturnType<typeof deferred<{ data: ItemSearchAutocompleteResult }>>[]>();

    getItemSearchAutocomplete.mockImplementation(({ query }: { query: string }) => {
      const request = deferred<{ data: ItemSearchAutocompleteResult }>();
      requests.set(query, [...(requests.get(query) ?? []), request]);
      return request.promise;
    });

    const { results, searchSuggestions } = useSearchSuggestions();
    const outdatedRequest = searchSuggestions('outdated');
    const currentRequest = searchSuggestions('current');

    requests.get('outdated')?.forEach((request) => request.resolve({ data: createResult('outdated') }));
    await outdatedRequest;
    expect(results.value).toBeNull();

    requests.get('current')?.forEach((request) => request.resolve({ data: createResult('current') }));
    await currentRequest;
    expect(results.value?.items[0]?.label).toBe('current');
  });
});
