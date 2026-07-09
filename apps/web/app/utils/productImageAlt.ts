import { productImageGetters } from '@plentymarkets/shop-api';
import type { ImagesData } from '@plentymarkets/shop-api';

export const getProductImageFallbackAlt = (productName?: string | null, imageIndex = 0) => {
  const normalizedProductName = productName?.trim();
  const normalizedIndex = Math.max(0, imageIndex) + 1;

  return normalizedProductName
    ? `${normalizedProductName} - Produktbild - ${normalizedIndex}`
    : `Produktbild - ${normalizedIndex}`;
};

export const getProductImageAlt = (image?: ImagesData | null, productName?: string | null, imageIndex = 0) => {
  const alternate = image ? productImageGetters.getImageAlternate(image)?.trim() : '';

  return alternate || getProductImageFallbackAlt(productName, imageIndex);
};
