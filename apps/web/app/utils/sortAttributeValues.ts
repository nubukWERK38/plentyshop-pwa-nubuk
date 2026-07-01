import type { VariationMapProductAttribute, VariationMapProductAttributeValue } from '@plentymarkets/shop-api';

type SortMode = 'alphabetic' | 'numeric' | 'size';

const collator = new Intl.Collator('de', {
  numeric: true,
  sensitivity: 'base',
});

const numericAttributeNameParts = [
  'anzahl',
  'breite',
  'durchmesser',
  'gang',
  'gaenge',
  'gange',
  'grosse',
  'groesse',
  'height',
  'hoehe',
  'inch',
  'laufra',
  'length',
  'rahmen',
  'radgroesse',
  'radgrosse',
  'size',
  'wheel',
  'zoll',
];

const sizeRanks = new Map<string, number>([
  ['xxxxs', 0],
  ['xxxs', 1],
  ['xxs', 2],
  ['xs', 3],
  ['s', 4],
  ['m', 5],
  ['l', 6],
  ['xl', 7],
  ['xxl', 8],
  ['2xl', 8],
  ['xxxl', 9],
  ['3xl', 9],
  ['xxxxl', 10],
  ['4xl', 10],
  ['5xl', 11],
  ['6xl', 12],
]);

const normalizeText = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');

const getValueName = (value: VariationMapProductAttributeValue) => value.name ?? '';

const getNumbers = (value: string): number[] =>
  [...value.matchAll(/\d+(?:[.,]\d+)?/g)].map((match) => Number(match[0].replace(',', '.')));

const cleanSizeLabel = (value: string) =>
  normalizeText(value)
    .replace(/\b(groesse|größe|size|gr)\b/g, '')
    .replace(/[^a-z0-9/+-]/g, '');

const getSizeRank = (value: string): number | undefined => {
  const label = cleanSizeLabel(value);
  if (sizeRanks.has(label)) return sizeRanks.get(label);

  const rangeParts = label.split(/[\/+-]/).filter(Boolean);
  if (rangeParts.length > 1 && rangeParts.every((part) => sizeRanks.has(part))) {
    const total = rangeParts.reduce((sum, part) => sum + Number(sizeRanks.get(part)), 0);
    return total / rangeParts.length;
  }

  return undefined;
};

const getSortMode = (attributeName: string, values: VariationMapProductAttributeValue[]): SortMode => {
  const labels = values.map(getValueName).filter(Boolean);
  const labelsWithSize = labels.filter((label) => getSizeRank(label) !== undefined).length;

  if (labels.length > 1 && labelsWithSize === labels.length) return 'size';

  const normalizedAttributeName = normalizeText(attributeName);
  const prefersNumeric = numericAttributeNameParts.some((part) => normalizedAttributeName.includes(part));
  const labelsWithNumbers = labels.filter((label) => getNumbers(label).length > 0).length;

  if (labels.length > 1 && labelsWithNumbers > 1 && (prefersNumeric || labelsWithNumbers === labels.length)) {
    return 'numeric';
  }

  return 'alphabetic';
};

const compareByPosition = (a: VariationMapProductAttributeValue, b: VariationMapProductAttributeValue) =>
  (a.position ?? 0) - (b.position ?? 0);

const compareAlphabetically = (a: VariationMapProductAttributeValue, b: VariationMapProductAttributeValue) => {
  const result = collator.compare(getValueName(a), getValueName(b));
  return result || compareByPosition(a, b);
};

const compareNumerically = (a: VariationMapProductAttributeValue, b: VariationMapProductAttributeValue) => {
  const aNumbers = getNumbers(getValueName(a));
  const bNumbers = getNumbers(getValueName(b));

  if (aNumbers.length === 0 && bNumbers.length === 0) return compareAlphabetically(a, b);
  if (aNumbers.length === 0) return 1;
  if (bNumbers.length === 0) return -1;

  const maxLength = Math.max(aNumbers.length, bNumbers.length);
  for (let index = 0; index < maxLength; index += 1) {
    const aNumber = aNumbers[index] ?? 0;
    const bNumber = bNumbers[index] ?? 0;
    if (aNumber !== bNumber) return aNumber - bNumber;
  }

  return compareAlphabetically(a, b);
};

const compareBySize = (a: VariationMapProductAttributeValue, b: VariationMapProductAttributeValue) => {
  const aRank = getSizeRank(getValueName(a));
  const bRank = getSizeRank(getValueName(b));

  if (aRank === undefined && bRank === undefined) return compareAlphabetically(a, b);
  if (aRank === undefined) return 1;
  if (bRank === undefined) return -1;

  return aRank - bRank || compareAlphabetically(a, b);
};

export const sortAttributeValues = (
  values: VariationMapProductAttributeValue[],
  attributeName = '',
): VariationMapProductAttributeValue[] => {
  const mode = getSortMode(attributeName, values);
  const compare = mode === 'size' ? compareBySize : mode === 'numeric' ? compareNumerically : compareAlphabetically;

  return [...values].sort(compare);
};

export const sortProductAttributes = (attributes: VariationMapProductAttribute[]): VariationMapProductAttribute[] =>
  attributes.map((attribute) => ({
    ...attribute,
    values: sortAttributeValues(
      attribute.values.map((value) => ({ ...value })),
      attribute.name,
    ),
  }));
