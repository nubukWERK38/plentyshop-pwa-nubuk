import type { ItemSearchAutocompleteItem } from '@plentymarkets/shop-api';

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getSearchTokens = (term: string) =>
  normalizeSearchText(term)
    .split(/[\s,;:|/\\+_-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

const getItemSearchText = (item: ItemSearchAutocompleteItem) =>
  normalizeSearchText([item.label, item.beforeLabel, item.afterLabel, item.imageAlt, item.url].filter(Boolean).join(' '));

const getItemPrice = (item: ItemSearchAutocompleteItem) => item.price?.unitPrice?.value ?? 0;

const getItemRanking = (item: ItemSearchAutocompleteItem, term: string, tokens: string[]) => {
  const label = normalizeSearchText(item.label ?? '');
  const itemText = getItemSearchText(item);
  const normalizedTerm = normalizeSearchText(term);

  return {
    matchedTokenCount: tokens.filter((token) => itemText.includes(token)).length,
    labelTokenCount: tokens.filter((token) => label.includes(token)).length,
    hasExactLabelMatch: normalizedTerm && label.includes(normalizedTerm) ? 1 : 0,
  };
};

export const sortAutocompleteItemsBySearchTerm = (items: ItemSearchAutocompleteItem[] = [], term: string) => {
  const tokens = getSearchTokens(term);

  if (tokens.length < 2) return [...items];

  return items
    .map((item, index) => ({
      item,
      index,
      ...getItemRanking(item, term, tokens),
      price: getItemPrice(item),
    }))
    .sort(
      (left, right) =>
        right.matchedTokenCount - left.matchedTokenCount ||
        right.price - left.price ||
        right.labelTokenCount - left.labelTokenCount ||
        right.hasExactLabelMatch - left.hasExactLabelMatch ||
        left.index - right.index,
    )
    .map(({ item }) => item);
};
