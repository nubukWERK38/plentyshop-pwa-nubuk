import type { ItemSearchAutocompleteItem } from '@plentymarkets/shop-api';
import { sortAutocompleteItemsBySearchTerm } from '../searchSuggestionRanking';

const createPrice = (value: number) =>
  ({
    unitPrice: { value },
  }) as ItemSearchAutocompleteItem['price'];

const createItem = (label: string, price = 0, overrides: Partial<ItemSearchAutocompleteItem> = {}) =>
  ({
    label,
    image: '',
    url: label.toLowerCase().replace(/\s+/g, '-'),
    beforeLabel: '',
    afterLabel: '',
    count: 0,
    imageAlt: '',
    price: createPrice(price),
    crossedPrice: null,
    ...overrides,
  }) as ItemSearchAutocompleteItem;

describe('sortAutocompleteItemsBySearchTerm', () => {
  it('prioritizes products matching all search words over partial matches', () => {
    const items = [
      createItem('Specialized STC 34.9MM SEATPOST CLAMP', 99),
      createItem('Specialized Schaltauge MTB Sandwich Steckachse', 199),
      createItem('2012 Epic Carbon 29" Cs Protector', 999),
      createItem('Specialized Carbon Epic 29" CS Protector 2011', 10),
    ];

    const sorted = sortAutocompleteItemsBySearchTerm(items, 'specialized epic');

    expect(sorted.map((item) => item.label)).toEqual([
      'Specialized Carbon Epic 29" CS Protector 2011',
      '2012 Epic Carbon 29" Cs Protector',
      'Specialized Schaltauge MTB Sandwich Steckachse',
      'Specialized STC 34.9MM SEATPOST CLAMP',
    ]);
  });

  it('sorts equally relevant products by price descending', () => {
    const items = [
      createItem('Specialized Epic Alloy Protector', 16.79),
      createItem('Specialized Epic Carbon Protector', 31.9),
      createItem('Specialized Epic CS Protector', 16.12),
    ];

    const sorted = sortAutocompleteItemsBySearchTerm(items, 'specialized epic');

    expect(sorted.map((item) => item.label)).toEqual([
      'Specialized Epic Carbon Protector',
      'Specialized Epic Alloy Protector',
      'Specialized Epic CS Protector',
    ]);
  });

  it('sorts all-word matches by price before exact phrase matches', () => {
    const items = [
      createItem('Specialized EPIC ERA ALLOY 2008-09 Schutzblech', 16.79),
      createItem('Specialized CHS MY24 EPIC 8 SW Rear Stay Assembly', 1099),
      createItem('Specialized CHS MY18 EPIC Carbon Frame Rear Stay Assembly', 1000),
    ];

    const sorted = sortAutocompleteItemsBySearchTerm(items, 'specialized epic');

    expect(sorted.map((item) => item.label)).toEqual([
      'Specialized CHS MY24 EPIC 8 SW Rear Stay Assembly',
      'Specialized CHS MY18 EPIC Carbon Frame Rear Stay Assembly',
      'Specialized EPIC ERA ALLOY 2008-09 Schutzblech',
    ]);
  });

  it('keeps the backend order for single word searches', () => {
    const items = [createItem('Specialized Epic'), createItem('Specialized Stumpjumper')];

    expect(sortAutocompleteItemsBySearchTerm(items, 'specialized')).toEqual(items);
  });

  it('keeps stable order when score and price are equal', () => {
    const items = [createItem('Specialized Epic Comp'), createItem('Specialized Epic Expert')];

    expect(sortAutocompleteItemsBySearchTerm(items, 'specialized epic')).toEqual(items);
  });
});
