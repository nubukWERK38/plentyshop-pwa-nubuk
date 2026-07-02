export const validateApiUrl = (url: string | undefined): string | undefined => {
  return url?.replace(/[/\\]+$/, '');
};

export const isPageOfType = (type: string): boolean => {
  return useRouter().currentRoute.value.meta.type === type;
};

export const getSearchPath = (suggestion: string) => {
  const localePath = useLocalePath();
  const { getSetting: defaultSortingSearch } = useSiteSettings('defaultSortingSearch');
  const params = new URLSearchParams({ term: suggestion });
  const sort = defaultSortingSearch();

  if (sort) params.set('sort', sort);

  return `${localePath(paths.search)}?${params.toString()}`;
};
