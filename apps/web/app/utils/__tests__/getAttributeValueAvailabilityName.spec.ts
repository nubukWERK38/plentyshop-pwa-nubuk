import { getAttributeValueAvailabilityName } from '../getAttributeValueAvailabilityName';
import type { VariationMapProductVariation } from '@plentymarkets/shop-api';

const combinations: VariationMapProductVariation[] = [
  {
    variationId: 101,
    isSalable: true,
    unitCombinationId: 1,
    unitId: 1,
    unitName: 'Piece',
    attributes: [
      { attributeId: 1, attributeValueId: 11 },
      { attributeId: 2, attributeValueId: 21 },
    ],
  },
  {
    variationId: 102,
    isSalable: true,
    unitCombinationId: 1,
    unitId: 1,
    unitName: 'Piece',
    attributes: [
      { attributeId: 1, attributeValueId: 11 },
      { attributeId: 2, attributeValueId: 22 },
    ],
  },
  {
    variationId: 103,
    isSalable: true,
    unitCombinationId: 1,
    unitId: 1,
    unitName: 'Piece',
    attributes: [
      { attributeId: 1, attributeValueId: 12 },
      { attributeId: 2, attributeValueId: 21 },
    ],
  },
];

describe('getAttributeValueAvailabilityName', () => {
  it('returns the availability for a unique variation', () => {
    expect(
      getAttributeValueAvailabilityName({
        combinations,
        selectedAttributeValues: { 2: 21 },
        attributeId: 1,
        attributeValueId: 11,
        variationAvailabilityNames: { 101: 'In stock', 102: 'Ships later', 103: 'In stock' },
      }),
    ).toBe('In stock');
  });

  it('returns a shared availability for multiple matching variations', () => {
    expect(
      getAttributeValueAvailabilityName({
        combinations,
        selectedAttributeValues: {},
        attributeId: 1,
        attributeValueId: 11,
        variationAvailabilityNames: { 101: 'In stock', 102: 'In stock', 103: 'Ships later' },
      }),
    ).toBe('In stock');
  });

  it('omits ambiguous availability names', () => {
    expect(
      getAttributeValueAvailabilityName({
        combinations,
        selectedAttributeValues: {},
        attributeId: 1,
        attributeValueId: 11,
        variationAvailabilityNames: { 101: 'In stock', 102: 'Ships later', 103: 'In stock' },
      }),
    ).toBe('');
  });
});
