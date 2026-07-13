export const validateApiUrl = (url: string | undefined): string | undefined => {
  return url?.replace(/[/\\]+$/, '');
};

export const isPageOfType = (type: string): boolean => {
  return useRouter().currentRoute.value.meta.type === type;
};

export const SEARCH_RELEVANCE_SORT = 'item.score';

export const getSearchPath = (suggestion: string) => {
  const localePath = useLocalePath();
  const params = new URLSearchParams({ term: suggestion });
  params.set('sort', SEARCH_RELEVANCE_SORT);

  return `${localePath(paths.search)}?${params.toString()}`;
};
