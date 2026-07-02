import type { ItemSearchAutocompleteItem } from '@plentymarkets/shop-api';
import { sortAutocompleteItemsBySearchTerm } from '../searchSuggestionRanking';

const createItem = (label: string, overrides: Partial<ItemSearchAutocompleteItem> = {}) =>
  ({
    label,
    image: '',
    url: label.toLowerCase().replace(/\s+/g, '-'),
    beforeLabel: '',
    afterLabel: '',
    count: 0,
    imageAlt: '',
    price: null,
    crossedPrice: null,
    ...overrides,
  }) as ItemSearchAutocompleteItem;

describe('sortAutocompleteItemsBySearchTerm', () => {
  it('prioritizes products matching all search words over partial matches', () => {
    const items = [
      createItem('Specialized STC 34.9MM SEATPOST CLAMP'),
      createItem('Specialized Schaltauge MTB Sandwich Steckachse'),
      createItem('2012 Epic Carbon 29" Cs Protector'),
      createItem('Specialized Carbon Epic 29" CS Protector 2011'),
    ];

    const sorted = sortAutocompleteItemsBySearchTerm(items, 'specialized epic');

    expect(sorted.map((item) => item.label)).toEqual([
      'Specialized Carbon Epic 29" CS Protector 2011',
      'Specialized STC 34.9MM SEATPOST CLAMP',
      'Specialized Schaltauge MTB Sandwich Steckachse',
      '2012 Epic Carbon 29" Cs Protector',
    ]);
  });

  it('keeps the backend order for single word searches', () => {
    const items = [createItem('Specialized Epic'), createItem('Specialized Stumpjumper')];

    expect(sortAutocompleteItemsBySearchTerm(items, 'specialized')).toEqual(items);
  });

  it('keeps stable order when scores are equal', () => {
    const items = [createItem('Specialized Epic Comp'), createItem('Specialized Epic Expert')];

    expect(sortAutocompleteItemsBySearchTerm(items, 'specialized epic')).toEqual(items);
  });
});
