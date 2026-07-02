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

const scoreItemForTerm = (item: ItemSearchAutocompleteItem, term: string, tokens: string[]) => {
  const label = normalizeSearchText(item.label ?? '');
  const itemText = getItemSearchText(item);
  const normalizedTerm = normalizeSearchText(term);
  const matchedTokens = tokens.filter((token) => itemText.includes(token));
  const labelMatches = tokens.filter((token) => label.includes(token));
  let score = 0;

  if (normalizedTerm && label.includes(normalizedTerm)) score += 120;
  if (tokens.length > 1 && matchedTokens.length === tokens.length) score += 100;
  if (tokens.length > 1 && labelMatches.length === tokens.length) score += 80;

  score += matchedTokens.length * 20;
  score += labelMatches.length * 15;

  return score;
};

export const sortAutocompleteItemsBySearchTerm = (items: ItemSearchAutocompleteItem[] = [], term: string) => {
  const tokens = getSearchTokens(term);

  if (tokens.length < 2) return [...items];

  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreItemForTerm(item, term, tokens),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item);
};
