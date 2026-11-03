export const validateApiUrl = (url: string | undefined): string | undefined => {
  return url?.replace(/[/\\]+$/, '');
};

export const isPageOfType = (type: string): boolean => {
  return useRouter().currentRoute.value.meta.type === type;
};

export const SEARCH_RELEVANCE_SORT = 'item.score';
export const SEARCH_DEFAULT_SORT = SEARCH_RELEVANCE_SORT;
// Nubuk availability facets: in stock, available in 2–10 days, available in 5–14 days.
export const SEARCH_DEFAULT_AVAILABILITY_FACETS = '491,612,495';

export const getSearchPath = (suggestion: string) => {
  const localePath = useLocalePath();
  const params = new URLSearchParams({ term: suggestion });
  params.set('sort', SEARCH_DEFAULT_SORT);
  params.set('facets', SEARCH_DEFAULT_AVAILABILITY_FACETS);

  return `${localePath(paths.search)}?${params.toString()}`;
};
