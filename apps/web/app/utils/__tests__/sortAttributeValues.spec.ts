import type { VariationMapProductAttributeValue } from '@plentymarkets/shop-api';
import { sortAttributeValues } from '../sortAttributeValues';

const makeValue = (name: string, position: number): VariationMapProductAttributeValue => ({
  attributeValueId: position,
  imageUrl: '',
  name,
  position,
});

const sortNames = (attributeName: string, names: string[]) =>
  sortAttributeValues(
    names.map((name, index) => makeValue(name, index + 1)),
    attributeName,
  ).map((value) => value.name);

describe('sortAttributeValues', () => {
  it('sorts frame heights numerically', () => {
    expect(sortNames('Rahmenhöhe', ['RH 44cm', 'RH 46cm', 'RH 41cm', 'RH 40cm'])).toEqual([
      'RH 40cm',
      'RH 41cm',
      'RH 44cm',
      'RH 46cm',
    ]);
  });

  it('sorts decimal wheel sizes numerically', () => {
    expect(sortNames('Laufradgröße', ['29 Zoll', '27,5 Zoll', '20 Zoll'])).toEqual(['20 Zoll', '27,5 Zoll', '29 Zoll']);
  });

  it('sorts clothing sizes by semantic size order', () => {
    expect(sortNames('Größe', ['XL', 'S', 'M', 'XXL', 'XS', 'L'])).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  });

  it('sorts alphanumeric values naturally', () => {
    expect(sortNames('Modell', ['Serie 10', 'Serie 2', 'Serie 1'])).toEqual(['Serie 1', 'Serie 2', 'Serie 10']);
  });

  it('sorts text values alphabetically', () => {
    expect(sortNames('Farbe', ['Rot', 'Anthrazit', 'Blau'])).toEqual(['Anthrazit', 'Blau', 'Rot']);
  });

  it('does not mutate the original values', () => {
    const values = ['RH 44cm', 'RH 40cm'].map((name, index) => makeValue(name, index + 1));

    sortAttributeValues(values, 'Rahmenhöhe');

    expect(values.map((value) => value.name)).toEqual(['RH 44cm', 'RH 40cm']);
  });
});
