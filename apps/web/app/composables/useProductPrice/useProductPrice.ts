import type { Product } from '@plentymarkets/shop-api';
import { productGetters } from '@plentymarkets/shop-api';
import type { MaybeRefOrGetter } from 'vue';

/**
 * @description Composable for managing product prices.
 * @example
 * ``` ts
 * const { price, crossedPrice } = useProductPrice();
 * useProductPrice({} as Product);
 * ```
 */

export const useProductPrice = (product: MaybeRefOrGetter<Product>) => {
  const currentProduct = computed(() => toValue(product));

  const price = computed(() => {
    const product = currentProduct.value;
    const specialOffer = productGetters.getSpecialOffer(product);
    const graduatedPrices = productGetters.getGraduatedPrices(product);

    if (graduatedPrices.length) {
      return specialOffer && specialOffer < productGetters.getCheapestGraduatedPrice(product)
        ? specialOffer
        : productGetters.getCheapestGraduatedPrice(product);
    }

    const priceValue = productGetters.getPrice(product) ?? 0;
    return specialOffer && specialOffer < priceValue ? specialOffer : priceValue;
  });

  const crossedPrice = computed(() => {
    const product = currentProduct.value;
    const specialOffer = productGetters.getSpecialOffer(product);

    return specialOffer ? productGetters.getPrice(product) : productGetters.getCrossedPrice(product);
  });

  return {
    price,
    crossedPrice,
  };
};
