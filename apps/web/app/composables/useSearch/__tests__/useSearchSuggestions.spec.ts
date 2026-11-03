import type { ItemSearchAutocompleteResult } from '@plentymarkets/shop-api';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ProductFixture } from '~/utils/__tests__/__fixtures__/Product';
import { useSearchSuggestions } from '../useSearchSuggestions';

const { getItemSearchAutocomplete, getSearch, useHandleError } = vi.hoisted(() => ({
  getItemSearchAutocomplete: vi.fn(),
  getSearch: vi.fn(),
  useHandleError: vi.fn(),
}));

mockNuxtImport('useSdk', () => () => ({
  plentysystems: { getItemSearchAutocomplete, getSearch },
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
      url: '/product/a-1',
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
    vi.resetAllMocks();
    getSearch.mockResolvedValue({
      data: { products: [{ ...ProductFixture, item: { ...ProductFixture.item, id: 1 } }] },
    });
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

    // Enter must not wait for the optional, slower phrase suggestions.
    await request;
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
    const duplicateRequest = searchSuggestions('duplicate');

    expect(getItemSearchAutocomplete).toHaveBeenCalledTimes(2);

    category.resolve({ data: createResult('product') });
    suggestions.resolve({ data: createResult('product') });
    await Promise.all([firstRequest, duplicateRequest]);
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

describe('search preview safety', () => {
  beforeEach(() => {
    clearNuxtState();
    vi.resetAllMocks();
  });

  it('does not load fallback products for a zero-hit query', async () => {
    getItemSearchAutocomplete.mockResolvedValue({ data: createResult('', { items: [], total: 0 }) });
    const { results, searchSuggestions } = useSearchSuggestions();
    await searchSuggestions('sp conect s26');
    expect(results.value?.items).toEqual([]);
    expect(results.value?.total).toBe(0);
    expect(getSearch).not.toHaveBeenCalled();
  });

  it('does not trust product hits in the faster suggestion-only response', async () => {
    const primary = deferred<{ data: ItemSearchAutocompleteResult }>();
    getItemSearchAutocomplete.mockImplementation(({ types }: { types: string[] }) =>
      types.includes('category') ? primary.promise : Promise.resolve({ data: createResult('incorrect') }),
    );
    const { results, loading, searchSuggestions } = useSearchSuggestions();
    const request = searchSuggestions('sp connect s26');
    await vi.waitFor(() => expect(results.value).not.toBeNull());
    expect(results.value?.items).toEqual([]);
    expect(results.value?.total).toBe(0);
    expect(loading.value).toBe(true);
    primary.resolve({ data: createResult('', { items: [], total: 0 }) });
    await request;
    expect(loading.value).toBe(false);
  });

  it('reports availability lookup failures instead of displaying unverified products', async () => {
    getItemSearchAutocomplete.mockResolvedValue({ data: createResult('product') });
    getSearch.mockRejectedValue(new Error('offline'));
    const { results, error, loading, searchSuggestions } = useSearchSuggestions();
    await searchSuggestions('sp connect s25');
    expect(results.value).toBeNull();
    expect(error.value).toBe(true);
    expect(loading.value).toBe(false);
  });

  it('waits for a pending primary lookup when Enter is pressed immediately', async () => {
    const primary = deferred<{ data: ItemSearchAutocompleteResult }>();
    getItemSearchAutocomplete.mockReturnValue(primary.promise);
    const { searchSuggestions } = useSearchSuggestions();
    const first = searchSuggestions('sp connect s26');
    let finished = false;
    const submit = searchSuggestions('sp connect s26').then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    primary.resolve({ data: createResult('', { items: [], total: 0 }) });
    await Promise.all([first, submit]);
    expect(finished).toBe(true);
  });
});
