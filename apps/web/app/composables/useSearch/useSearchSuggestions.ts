import type { ApiError, ItemSearchAutocompleteResult } from '@plentymarkets/shop-api';
import { getAvailableSearchSuggestions } from './availableSearchSuggestions';
import { SEARCH_RELEVANCE_SORT } from '~/utils/pathHelper';
import type { UseSearchSuggestionsReturn, UseSearchSuggestionsState } from './types';

const CATEGORY_LIMIT = 5;
const SUGGESTIONS_LIMIT = 5;
const ITEMS_LIMIT = 4;
const emptyResults = (): ItemSearchAutocompleteResult => ({ categories: [], suggestions: [], items: [], total: 0 });

export const useSearchSuggestions: UseSearchSuggestionsReturn = () => {
  const state = useState<UseSearchSuggestionsState>('useSearchSuggestions', () => ({
    results: null,
    searchTerm: '',
    pendingSearchTerm: '',
    loading: false,
    error: false,
    currentRequestId: 0,
  }));

  const resetSuggestions = () => {
    state.value.currentRequestId++;
    state.value.results = null;
    state.value.searchTerm = '';
    state.value.pendingSearchTerm = '';
    state.value.loading = false;
    state.value.error = false;
  };

  const searchSuggestions = async (text: string) => {
    const term = text.trim().slice(0, 80);
    if (term.length < 2) {
      resetSuggestions();
      return;
    }
    if (state.value.searchTerm === term && state.value.results && !state.value.loading && !state.value.error) return;
    if (state.value.pendingSearchTerm === term && state.value.loading) {
      const requestId = state.value.currentRequestId;
      await new Promise<void>((resolve) => {
        const stop = watch(
          () => [state.value.loading, state.value.currentRequestId],
          () => {
            if (!state.value.loading || state.value.currentRequestId !== requestId) {
              stop();
              resolve();
            }
          },
          { flush: 'sync' },
        );
      });
      return;
    }

    const requestId = ++state.value.currentRequestId;
    state.value.searchTerm = term;
    state.value.pendingSearchTerm = term;
    state.value.results = null;
    state.value.error = false;
    state.value.loading = true;
    const isCurrentRequest = () => requestId === state.value.currentRequestId;
    const sdk = useSdk().plentysystems;
    const primary = async () => {
      try {
        const { data } = await sdk.getItemSearchAutocomplete({ query: term, types: ['category'] });
        if (!isCurrentRequest()) return;
        if (!data) throw new Error('Missing search preview response');
        let items: ItemSearchAutocompleteResult['items'] = [];
        if (data.items?.length && data.total > 0) {
          // Relevance keeps these candidates aligned with autocomplete; delivery time sorts the verified hits below.
          const { data: products } = await sdk.getSearch({
            term,
            type: 'search',
            sort: SEARCH_RELEVANCE_SORT,
            itemsPerPage: 20,
          });
          if (!isCurrentRequest()) return;
          if (!products?.products) throw new Error('Missing product availability response');
          items = getAvailableSearchSuggestions(data.items, products.products, term).slice(0, ITEMS_LIMIT);
        }
        state.value.results = {
          ...data,
          categories: data.categories?.slice(0, CATEGORY_LIMIT) ?? [],
          suggestions: state.value.results?.suggestions ?? [],
          items,
        };
      } catch (error) {
        if (!isCurrentRequest()) return;
        state.value.error = true;
        state.value.results = null;
        useHandleError(error as ApiError);
      } finally {
        if (isCurrentRequest()) state.value.loading = false;
      }
    };
    const suggestions = async () => {
      try {
        const { data } = await sdk.getItemSearchAutocomplete({ query: term, types: ['suggestion'] });
        if (!isCurrentRequest() || !data || state.value.error) return;
        state.value.results = {
          ...(state.value.results ?? emptyResults()),
          suggestions: data.suggestions?.slice(0, SUGGESTIONS_LIMIT) ?? [],
        };
      } catch (error) {
        if (isCurrentRequest()) useHandleError(error as ApiError);
      }
    };
    const primaryRequest = primary();
    void Promise.allSettled([primaryRequest, suggestions()]).then(() => {
      if (isCurrentRequest()) state.value.pendingSearchTerm = '';
    });
    await primaryRequest;
  };

  return {
    results: toRef(state.value, 'results'),
    searchTerm: toRef(state.value, 'searchTerm'),
    loading: toRef(state.value, 'loading'),
    error: toRef(state.value, 'error'),
    searchSuggestions,
    resetSuggestions,
  };
};
