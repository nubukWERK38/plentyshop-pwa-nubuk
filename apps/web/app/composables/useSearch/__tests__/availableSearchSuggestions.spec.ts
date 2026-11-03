import type { ItemSearchAutocompleteItem, Product } from '@plentymarkets/shop-api';
import { ProductFixture } from '~/utils/__tests__/__fixtures__/Product';
import { getAvailableSearchSuggestions } from '../availableSearchSuggestions';

const item = (id: number, label = 'SP Connect S25') =>
  ({ label, url: '/product/a-' + id }) as ItemSearchAutocompleteItem;
const product = (id: number, days: number, salable = true) =>
  ({
    ...ProductFixture,
    item: { ...ProductFixture.item, id },
    filter: { ...ProductFixture.filter, isSalable: salable, isSalableAndActive: salable },
    variation: {
      ...ProductFixture.variation,
      availability: { ...ProductFixture.variation.availability, averageDays: days },
    },
  }) as Product;

describe('getAvailableSearchSuggestions', () => {
  it('removes unavailable and unverified hits and sorts remaining hits by delivery time', () => {
    const items = [item(1), item(2), item(3), item(4)];
    const products = [product(1, 10), product(2, 45, false), product(3, 2), product(99, 1)];
    expect(getAvailableSearchSuggestions(items, products, 'sp connect s25')).toEqual([items[2], items[0]]);
  });
  it('preserves relevance within equal delivery times', () => {
    const items = [item(1, 'SP Connect S24'), item(2)];
    expect(getAvailableSearchSuggestions(items, [product(1, 2), product(2, 2)], 'sp connect s25')).toEqual([
      items[1],
      items[0],
    ]);
  });
  it('does not mutate autocomplete hits or product responses', () => {
    const items = [item(1), item(2)];
    const products = [product(1, 10), product(2, 2)];
    const before = JSON.stringify({ items, products });
    getAvailableSearchSuggestions(items, products, 'sp connect');
    expect(JSON.stringify({ items, products })).toBe(before);
  });
});
