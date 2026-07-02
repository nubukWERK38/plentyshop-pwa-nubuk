import { getMappedOptions } from '../sortingOptionsHelper';

describe('sortingOptionsHelper', () => {
  it('maps dotted sorting keys without passing them through vue-i18n paths', () => {
    expect(() => getMappedOptions(['item.id_asc', 'sorting.price.avg_asc'])).not.toThrow();

    expect(getMappedOptions(['item.id_asc', 'sorting.price.avg_asc'])).toEqual([
      { label: expect.stringContaining('Item ID'), value: 'item.id_asc' },
      { label: expect.stringContaining('Price'), value: 'sorting.price.avg_asc' },
    ]);
  });
});
