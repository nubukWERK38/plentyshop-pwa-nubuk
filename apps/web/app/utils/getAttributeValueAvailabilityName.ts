import type { VariationMapProductVariation } from '@plentymarkets/shop-api';

type AttributeValueAvailabilityNameParams = {
  combinations: VariationMapProductVariation[];
  selectedAttributeValues: Record<string, number>;
  attributeId: number;
  attributeValueId: number;
  variationAvailabilityNames: Record<number, string>;
};

export const getAttributeValueAvailabilityName = ({
  combinations,
  selectedAttributeValues,
  attributeId,
  attributeValueId,
  variationAvailabilityNames,
}: AttributeValueAvailabilityNameParams): string => {
  const prospectiveAttributeValues = {
    ...selectedAttributeValues,
    [attributeId]: attributeValueId,
  };
  const availabilityNames = combinations
    .filter((combination) =>
      Object.entries(prospectiveAttributeValues).every(([selectedAttributeId, selectedAttributeValueId]) =>
        combination.attributes?.some(
          (attribute) =>
            attribute.attributeId === Number(selectedAttributeId) &&
            attribute.attributeValueId === selectedAttributeValueId,
        ),
      ),
    )
    .map((combination) => variationAvailabilityNames[combination.variationId]?.trim())
    .filter((name): name is string => Boolean(name));
  const uniqueAvailabilityNames = [...new Set(availabilityNames)];

  return uniqueAvailabilityNames.length === 1 ? (uniqueAvailabilityNames[0] ?? '') : '';
};
