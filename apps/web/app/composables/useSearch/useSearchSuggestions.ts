import type { ApiError, ItemSearchAutocompleteResult } from '@plentymarkets/shop-api';
import { sortAutocompleteItemsBySearchTerm } from './searchSuggestionRanking';
import type { UseSearchSuggestionsReturn, UseSearchSuggestionsState } from './types';

const CATEGORY_LIMIT = 5;
const SUGGESTIONS_LIMIT = 5;
const ITEMS_LIMIT = 4;

export const useSearchSuggestions: UseSearchSuggestionsReturn = () => {
  const state = useState<UseSearchSuggestionsState>('useSearchSuggestions', () => ({
    results: null as ItemSearchAutocompleteResult | null,
    searchTerm: '',
    pendingSearchTerm: '',
    loading: false,
    currentRequestId: 0,
  }));

  const searchSuggestions = async (text: string) => {
    const term = text.trim().slice(0, 80);

    if (term.length < 2) {
      state.value.currentRequestId++;
      state.value.results = null;
      state.value.pendingSearchTerm = '';
      state.value.loading = false;
      return;
    }

    if (state.value.searchTerm === term || state.value.pendingSearchTerm === term) return;

    const requestId = ++state.value.currentRequestId;
    state.value.pendingSearchTerm = term;
    state.value.loading = true;

    const updateResults = (data: ItemSearchAutocompleteResult, type: 'primary' | 'suggestions') => {
      if (requestId !== state.value.currentRequestId) return;

      const currentResults = state.value.searchTerm === term ? state.value.results : null;
      state.value.results = {
        ...data,
        categories:
          type === 'primary' ? (data.categories?.slice(0, CATEGORY_LIMIT) ?? []) : (currentResults?.categories ?? []),
        suggestions:
          type === 'suggestions'
            ? (data.suggestions?.slice(0, SUGGESTIONS_LIMIT) ?? [])
            : (currentResults?.suggestions ?? []),
        items:
          type === 'primary' || !currentResults
            ? sortAutocompleteItemsBySearchTerm(data.items, term).slice(0, ITEMS_LIMIT)
            : currentResults.items,
        total: type === 'primary' || !currentResults ? data.total : currentResults.total,
      };
      state.value.searchTerm = term;
      state.value.loading = false;
    };

    const sdk = useSdk().plentysystems;
    const requests = [
      sdk
        .getItemSearchAutocomplete({ query: term, types: ['category'] })
        .then(({ data }) => data && updateResults(data as ItemSearchAutocompleteResult, 'primary')),
      sdk
        .getItemSearchAutocomplete({ query: term, types: ['suggestion'] })
        .then(({ data }) => data && updateResults(data as ItemSearchAutocompleteResult, 'suggestions')),
    ];
    const outcomes = await Promise.allSettled(requests);

    if (requestId === state.value.currentRequestId) {
      state.value.pendingSearchTerm = '';
      state.value.loading = false;
      outcomes.forEach((outcome) => {
        if (outcome.status === 'rejected') useHandleError(outcome.reason as ApiError);
      });
    }
  };

  const resetSuggestions = () => {
    state.value.currentRequestId++;
    state.value.results = null;
    state.value.searchTerm = '';
    state.value.pendingSearchTerm = '';
    state.value.loading = false;
  };

  return {
    results: toRef(state.value, 'results'),
    searchTerm: toRef(state.value, 'searchTerm'),
    loading: toRef(state.value, 'loading'),
    searchSuggestions,
    resetSuggestions,
  };
};
