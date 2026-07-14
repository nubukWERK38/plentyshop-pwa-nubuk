import type { Product, VariationMapProductAttribute } from '@plentymarkets/shop-api';

export type ProductAttributesProps = {
  product: Product;
};

export type AttributeSelectProps = {
  attribute: VariationMapProductAttribute;
  variationAvailabilityNames?: Record<number, string>;
};

export interface ComponentsMapper {
  [key: string]: object;
}
