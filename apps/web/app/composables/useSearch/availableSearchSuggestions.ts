import type { ItemSearchAutocompleteItem, Product } from '@plentymarkets/shop-api';
import { sortAutocompleteItemsBySearchTerm } from './searchSuggestionRanking';

// Only enrich actual autocomplete hits: the full search can return unrelated fallback products.
export const getAvailableSearchSuggestions = (
  items: ItemSearchAutocompleteItem[],
  products: Product[],
  term: string,
) => {
  const availableProducts = new Map(
    products
      .filter((product) => product.filter?.isSalable && product.filter?.isSalableAndActive)
      .map((product) => [String(product.item.id), product]),
  );
  const rankedItems = sortAutocompleteItemsBySearchTerm(items, term);

  return rankedItems
    .map((item) => ({ item, product: availableProducts.get(item.url.match(/\/a-(\d+)(?:[/?#]|$)/)?.[1] ?? '') }))
    .filter(({ product }) => product && Number.isFinite(product.variation?.availability?.averageDays))
    .sort(
      (left, right) =>
        left.product!.variation.availability.averageDays - right.product!.variation.availability.averageDays,
    )
    .map(({ item }) => item);
};
