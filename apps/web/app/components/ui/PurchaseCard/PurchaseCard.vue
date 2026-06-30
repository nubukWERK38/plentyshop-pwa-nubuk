<template>
  <form
    class="purchase-card md:rounded-md"
    :class="{ 'md:shadow-lg': configuration?.dropShadow, 'md:border md:border-neutral-100': configuration?.borders }"
    :style="inlineStyle"
    data-testid="purchase-card"
    @submit.prevent="handleAddToCart()"
  >
    <div class="relative">
      <div class="drift-zoom-image">
        <section class="purchase-card__content p-4 xl:p-5">
          <template v-for="key in configuration?.fieldsOrder" :key="key">
            <template v-if="key === 'itemName' && configuration?.fields.itemName">
              <div v-if="brandLogo || brandName" class="purchase-card__brand" data-testid="product-brand">
                <NuxtImg
                  v-if="brandLogo"
                  :src="brandLogo"
                  :alt="brandName || t('manufacturer.logoAlt')"
                  class="purchase-card__brand-logo"
                  loading="lazy"
                />
                <span v-else>{{ brandName }}</span>
              </div>
              <h1 class="purchase-card__name font-bold break-word" data-testid="product-name">
                {{ productGetters.getName(product) }}
              </h1>
              <p v-if="variationNumber" class="purchase-card__article-number">Artikelnummer {{ variationNumber }}</p>
            </template>
            <template v-if="key === 'price' && configuration?.fields.price">
              <div class="purchase-card__price-block">
                <div v-if="hasComparablePrice" class="purchase-card__rrp">UVP {{ format(crossedPrice ?? 0) }}</div>
                <div class="purchase-card__price-row">
                  <span class="purchase-card__price" data-testid="price">
                    {{ format(priceWithProperties) }} {{ t('common.labels.asterisk') }}
                  </span>
                  <span v-if="discountPercentage" class="purchase-card__discount">{{ discountPercentage }}%</span>
                </div>
                <div
                  v-if="(productBundleGetters?.getBundleDiscount(product) ?? 0) > 0 && showBundleComponents"
                  class="mt-2"
                >
                  <UiTag :size="'sm'" :variant="'secondary'">{{
                    t('product.bundleSavings', { percent: productBundleGetters.getBundleDiscount(product) })
                  }}</UiTag>
                </div>
              </div>
              <LowestPrice :product="product" />
              <div v-if="unitContentLabel" class="purchase-card__unit-content">Inhalt {{ unitContentLabel }}</div>
              <BasePrice
                v-if="productGetters.showPricePerUnit(product)"
                :base-price="basePriceSingleValue"
                :unit-content="productGetters.getUnitContent(product)"
                :unit-name="productGetters.getUnitName(product)"
              />
              <ul class="purchase-card__more-infos">
                <li>
                  <NuxtLink :to="localePath('/ueber-uns/retoure')" title="Wie läuft eine Retoure ab?">
                    <i class="fa fa-angle-right" aria-hidden="true" />
                    Wie läuft eine Retoure ab?
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink :to="localePath(paths.contact)" title="Fragen zum Produkt?">
                    <i class="fa fa-angle-right" aria-hidden="true" />
                    Fragen zum Produkt?
                  </NuxtLink>
                </li>
                <li>
                  <button type="button" title="Mit Bike-Leasing bis zu 40% sparen" @click="openLeasingModal">
                    <i class="fa fa-angle-right" aria-hidden="true" />
                    Mit Bike-Leasing bis zu 40% sparen
                  </button>
                </li>
                <li>
                  <button type="button" title="Herstellerangaben" @click="openManufacturerDetails">
                    <i class="fa fa-angle-right" aria-hidden="true" />
                    Herstellerangaben
                  </button>
                </li>
              </ul>
            </template>
            <template v-if="key === 'tags' && configuration?.fields.tags">
              <UiBadges class="mb-2" :product="product" :use-availability="false" :use-tags="true" />
            </template>
            <template v-if="key === 'availability' && configuration?.fields.availability">
              <div v-if="availabilityName" class="purchase-card__availability" data-testid="badges">
                <span class="purchase-card__availability-dot" aria-hidden="true" />
                <span>{{ availabilityName }}</span>
              </div>
            </template>
            <template v-if="key === 'variationProperties' && configuration?.fields.variationProperties">
              <div class="mb-2 variation-properties">
                <VariationProperties :product="product" />
              </div>
            </template>
            <template v-if="key === 'starRating' && configuration?.fields.starRating">
              <div class="inline-flex items-center mb-2">
                <SfRating
                  size="xs"
                  :half-increment="true"
                  :value="reviewGetters.getAverageRating(reviewAverage, 'half')"
                  :max="5"
                />
                <SfCounter class="ml-1" size="xs">{{ reviewGetters.getTotalReviews(reviewAverage) }}</SfCounter>
                <UiButton
                  variant="tertiary"
                  class="ml-2 text-xs text-neutral-500 cursor-pointer"
                  data-testid="show-reviews"
                  @click="scrollToReviews"
                >
                  {{ t('product.showAllReviews') }}
                </UiButton>
              </div>
            </template>
            <template v-if="key === 'previewText' && configuration?.fields.previewText">
              <div
                v-if="productGetters.getShortDescription(product).length > 0"
                class="mb-2 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getShortDescription(product)"
              />
            </template>

            <template v-if="key === 'addToWishlist' && configuration?.fields.addToWishlist">
              <div
                class="flex items-center mt-2"
                :class="{ 'justify-center': configuration?.wishlistSize === 'large' }"
              >
                <WishlistButton
                  :variant="configuration?.wishlistSize === 'small' ? 'tertiary' : 'secondary'"
                  :product="product"
                  :quantity="quantitySelectorValue"
                  :square="viewport.isLessThan('lg')"
                  class="!m-0 !mb-2"
                  :class="{
                    'mr-2 mb-2 bg-white': viewport.isLessThan('lg'),
                    'w-full': configuration?.wishlistSize === 'large',
                    '!p-0 hover:bg-transparent active:bg-transparent': configuration?.wishlistSize === 'small',
                  }"
                >
                  <div>
                    {{
                      !isWishlistItem(productGetters.getVariationId(product))
                        ? t('common.actions.addToWishlist')
                        : t('common.actions.removeFromWishlist')
                    }}
                  </div>
                </WishlistButton>
              </div>
            </template>

            <template v-if="key === 'attributes' && configuration?.fields.attributes">
              <ProductAttributes :product="product" />
            </template>

            <template v-if="key === 'itemBundle'">
              <BundleOrderItems v-if="product.bundleComponents && showBundleComponents" :product="product" />
            </template>
            <template v-if="key === 'orderProperties' && configuration?.fields.orderProperties">
              <details v-if="hasOrderProperties" class="purchase-card__leasing-panel">
                <summary class="purchase-card__leasing-summary">
                  <span class="purchase-card__leasing-copy">
                    <span class="purchase-card__leasing-title">{{ leasingTitle }}</span>
                    <span v-if="leasingDescription" class="purchase-card__leasing-description">
                      {{ leasingDescription }}
                    </span>
                  </span>
                  <SfIconExpandMore class="purchase-card__leasing-chevron" aria-hidden="true" />
                </summary>
                <div class="purchase-card__leasing-options">
                  <OrderProperties :product="product" />
                </div>
              </details>
            </template>
            <template v-if="key === 'graduatedPrices' && configuration?.fields.graduatedPrices">
              <GraduatedPriceList :product="product" :count="quantitySelectorValue" />
            </template>

            <template v-if="key === 'quantityAndAddToCart' && configuration?.fields.quantityAndAddToCart">
              <UnitContentSelect
                v-if="product && productGetters.possibleUnitCombination(product).length > 1"
                :product="product"
              />
              <div class="purchase-card__cart-section mt-4">
                <div class="purchase-card__cart-row flex gap-4">
                  <UiQuantitySelector
                    :min-value="productGetters.getMinimumOrderQuantity(product)"
                    :value="quantitySelectorValue"
                    variant="vertical"
                    class="purchase-card__quantity"
                    @change-quantity="changeQuantity"
                  />
                  <div
                    v-if="showNotifyMe && !productGetters.isActiveVariationSalable(product)"
                    class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap"
                  >
                    <NotifyMe :variation-id="Number(productGetters.getVariationId(product))" />
                  </div>
                  <SfTooltip
                    v-else
                    show-arrow
                    placement="top"
                    :label="isNotValidVariation || isSalableText"
                    class="purchase-card__cart-tooltip flex-1 min-w-0 whitespace-nowrap"
                  >
                    <UiButton
                      type="submit"
                      data-testid="add-to-cart"
                      size="lg"
                      class="purchase-card__cart-button w-full h-full"
                      :disabled="loading || !productGetters.isSalable(product)"
                    >
                      <template #prefix>
                        <div v-if="!loading" class="flex row items-center">
                          <SfIconShoppingCart size="sm" />
                          {{ t('common.actions.addToCart') }}
                        </div>
                        <div v-else>
                          <SfLoaderCircular size="sm" />
                        </div>
                      </template>
                    </UiButton>
                  </SfTooltip>
                </div>
                <template v-if="showPayPalButtons">
                  <PayPalExpressButton
                    type="SingleItem"
                    location="itemPage"
                    class="purchase-card__paypal-buttons mt-4"
                    @validation-callback="paypalHandleAddToCart"
                  />
                  <PayPalPayLaterBanner
                    placement="product"
                    location="itemPage"
                    :amount="priceWithProperties * quantitySelectorValue"
                  />
                </template>
                <div class="purchase-card__tax-note mt-4 typography-text-xs flex gap-1">
                  <span>{{ t('common.labels.asterisk') }}</span>
                  <span>{{ showNetPrices ? t('product.priceExclVAT') : t('product.priceInclVAT') }}</span>
                  <i18n-t keypath="shipping.excludedLabel" scope="global">
                    <template #shipping>
                      <SfLink
                        :href="localePath(paths.shipping)"
                        target="_blank"
                        class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
                      >
                        {{ t('common.labels.delivery') }}
                      </SfLink>
                    </template>
                  </i18n-t>
                </div>
              </div>
            </template>

            <template v-if="key === 'itemText' && configuration?.fields.itemText">
              <div
                v-if="productGetters.getDescription(product)"
                class="mb-4 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getDescription(product)"
              />
            </template>
            <template v-if="key === 'technicalData' && configuration?.fields.technicalData">
              <div
                v-if="productGetters.getTechnicalData(product)"
                class="mb-4 font-normal typography-text-sm whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
                v-html="productGetters.getTechnicalData(product)"
              />
            </template>
          </template>
        </section>
      </div>
    </div>
  </form>
  <Teleport to="body">
    <UiModal
      v-model="leasingModalOpen"
      aria-labelledby="leasing-modal-title"
      tag="section"
      role="dialog"
      class="purchase-card__leasing-modal z-[2147483647] h-full w-full md:h-[calc(100vh-96px)] md:w-[min(1500px,calc(100vw-220px))] m-0 p-0 overflow-hidden"
      overlay-classes="z-[2147483647]"
    >
      <header class="purchase-card__leasing-modal-header">
        <h2 id="leasing-modal-title">Mit Bike-Leasing bis zu 40% sparen</h2>
        <UiButton
          :aria-label="t('common.navigation.closeDialog')"
          square
          variant="tertiary"
          class="purchase-card__leasing-modal-close"
          @click="leasingModalOpen = false"
        >
          <SfIconClose />
        </UiButton>
      </header>
      <div class="purchase-card__leasing-modal-body">
        <div v-if="leasingModalLoading" class="purchase-card__leasing-modal-loading">
          <SfLoaderCircular size="lg" />
        </div>
        <div
          v-else-if="leasingModalContent"
          class="purchase-card__leasing-modal-content no-preflight"
          v-html="leasingModalContent"
        />
        <p v-else class="purchase-card__leasing-modal-empty">Der Leasing-Content konnte nicht geladen werden.</p>
      </div>
    </UiModal>
  </Teleport>
</template>

<script setup lang="ts">
import {
  productGetters,
  reviewGetters,
  productBundleGetters,
  manufacturerGetters,
  productPropertyGetters,
} from '@plentymarkets/shop-api';
import {
  SfCounter,
  SfRating,
  SfIconShoppingCart,
  SfLoaderCircular,
  SfTooltip,
  SfLink,
  SfIconExpandMore,
  SfIconClose,
} from '@storefront-ui/vue';
import type { PriceCardPadding, PurchaseCardProps } from '~/components/ui/PurchaseCard/types';
import type { PayPalAddToCartCallback } from '#paypal/types';
import { paths } from '~/utils/paths';

const props = withDefaults(defineProps<PurchaseCardProps>(), {
  configuration: () => ({
    fields: {
      itemName: true,
      price: true,
      tags: true,
      availability: true,
      starRating: true,
      orderProperties: true,
      variationProperties: true,
      previewText: true,
      attributes: true,
      itemBundle: false,
      graduatedPrices: true,
      addToWishlist: true,
      quantityAndAddToCart: true,
      itemText: false,
      technicalData: false,
    },
    fieldsOrder: [
      'itemName',
      'price',
      'tags',
      'availability',
      'starRating',
      'variationProperties',
      'orderProperties',
      'previewText',
      'attributes',
      'itemBundle',
      'graduatedPrices',
      'addToWishlist',
      'quantityAndAddToCart',
      'itemText',
      'technicalData',
    ],
    fieldsDisabled: ['quantityAndAddToCart', 'price', 'itemBundle', 'attributes'],
    wishlistSize: 'small',

    dropShadow: true,
    borders: true,
    borderColor: '#EFF4F1',
    layout: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      paddingLeft: 0,
      fullWidth: false,
    },
  }),
});

const { currentProduct } = useProducts();

const { data: productReviews } = useProductReviews(Number(productGetters.getItemId(currentProduct.value)));
const reviewAverage = computed(() => reviewGetters.getReviewCounts(productReviews.value));

const { getSetting } = useSiteSettings('dontSplitItemBundle');
const showBundleComponents = computed(() => {
  return getSetting() !== '1';
});

const { showNetPrices } = useCart();
const viewport = useViewport();
const { format } = usePriceFormatter();
const { getCombination } = useProductAttributes();
const { getPropertiesForCart, getPropertiesPrice } = useProductOrderProperties();
const { validateAllFields, invalidFields, resetInvalidFields } = useValidatorAggregator('properties');
const {
  validateAllFields: validateAllFieldsAttributes,
  invalidFields: invalidAttributeFields,
  resetInvalidFields: resetAttributeFields,
} = useValidatorAggregator('attributes');
const { clear, send } = useNotification();
const { addToCart, loading } = useCart();
const quantitySelectorValue = ref(productGetters.getMinimumOrderQuantity(props?.product));
const { isWishlistItem } = useWishlist();
const { openQuickCheckout } = useQuickCheckout();
const { crossedPrice } = useProductPrice(props?.product);
const { reviewArea } = useProductReviews(Number(productGetters.getId(props?.product)));
const { getSetting: getNotifyMeSetting } = useSiteSettings('showNotifyMe');
const showNotifyMe = computed(() => getNotifyMeSetting().toString() === 'true');
const localePath = useLocalePath();
const { openDrawer } = useProductLegalDetailsDrawer();
const leasingModalOpen = ref(false);
const leasingModalLoading = ref(false);
const leasingModalContent = ref('');
const LEASING_CATEGORY_ID = 3228;
const LEASING_CATEGORY_PATH = '/ueber-uns/leasingpartner';

const manufacturer = computed(() => productGetters.getManufacturer(props.product));
const brandName = computed(
  () =>
    manufacturerGetters.getManufacturerExternalName(manufacturer.value) ||
    manufacturerGetters.getManufacturerNameExternal(manufacturer.value) ||
    manufacturerGetters.getManufacturerName(manufacturer.value),
);

const getNormalizedBrandLogo = (value: unknown): string => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = getNormalizedBrandLogo(entry);
      if (normalized) return normalized;
    }
    return '';
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;

    for (const key of ['url', 'src', 'path', 'fullPath', 'logo', 'logoUrl']) {
      const normalized = getNormalizedBrandLogo(candidate[key]);
      if (normalized) return normalized;
    }
  }

  return '';
};

const brandLogo = computed(() => {
  const getterLogo = getNormalizedBrandLogo(manufacturerGetters.getManufacturerLogo(manufacturer.value));
  if (getterLogo) return getterLogo;

  return getNormalizedBrandLogo(manufacturer.value);
});
const variationNumber = computed(() => productGetters.getVariationNumber(props.product));
const availabilityName = computed(() => productGetters.getAvailabilityName(props.product));
const orderPropertiesGroups = computed(() =>
  Object.values(productPropertyGetters.getOrderPropertiesGroups(props.product)),
);
const firstOrderPropertiesGroup = computed(() => orderPropertiesGroups.value[0]);
const hasOrderProperties = computed(() =>
  orderPropertiesGroups.value.some((group) => (group.orderProperties?.length ?? 0) > 0),
);
const leasingTitle = computed(() => {
  const group = firstOrderPropertiesGroup.value;

  return group ? productPropertyGetters.getOrderPropertyGroupName(group) || 'Fahrradleasing' : 'Fahrradleasing';
});
const leasingDescription = computed(() => {
  const group = firstOrderPropertiesGroup.value;

  return group
    ? productPropertyGetters.getOrderPropertyGroupDescription(group) ||
        'Du moechtest Dein Bike bei uns leasen? Waehle hier gleich einen gewuenschten Leasingpartner aus:'
    : '';
});
const unitContentLabel = computed(() => {
  const content = productGetters.getUnitContent(props.product);
  const unitName = productGetters.getUnitName(props.product);

  if (!content || !unitName) return '';

  return `${content} ${unitName}`;
});

const inlineStyle = computed(() => {
  const layout = props?.configuration?.layout || ({} as PriceCardPadding);

  return {
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
    borderColor: props?.configuration?.borderColor || 'transparent',
  };
});

onMounted(() => {
  resetInvalidFields();
  resetAttributeFields();
});

onBeforeRouteLeave(() => {
  if (invalidFields.value.length > 0 || invalidAttributeFields.value.length > 0) clear();
  resetInvalidFields();
  resetAttributeFields();
});

const priceWithProperties = computed(
  () =>
    (productGetters.getSpecialOffer(props?.product) ||
      productGetters.getGraduatedPriceByQuantity(props?.product, quantitySelectorValue.value)?.unitPrice.value ||
      productGetters.getPrice(props?.product) ||
      0) + getPropertiesPrice(props?.product),
);

const hasComparablePrice = computed(
  () =>
    Boolean(crossedPrice.value) &&
    Math.round(priceWithProperties.value * 100) / 100 !== Math.round(Number(crossedPrice.value) * 100) / 100,
);

const discountPercentage = computed(() => {
  if (!hasComparablePrice.value || !crossedPrice.value) return 0;

  return Math.round((priceWithProperties.value / crossedPrice.value - 1) * 100);
});

const basePriceSingleValue = computed(
  () =>
    productGetters.getGraduatedPriceByQuantity(props?.product, quantitySelectorValue.value)?.basePrice ??
    productGetters.getDefaultBasePrice(props?.product),
);

const handleValidationErrors = (): boolean => {
  send({
    message: [
      t('error.missingOrWrongProperties'),
      '',
      ...invalidAttributeFields.value.map((field) => field.name),
      ...invalidFields.value.map((field) => field.name),
      '',
      t('error.pleaseFillOutAllFields'),
    ],
    type: 'negative',
  });

  return false;
};

const handleAddToCart = async (quickCheckout = true) => {
  await validateAllFieldsAttributes();
  await validateAllFields();

  if (invalidFields.value.length > 0 || invalidAttributeFields.value.length > 0) {
    return handleValidationErrors();
  }

  if (!getCombination()) {
    send({ message: t('product.attributes.notValidVariation'), type: 'negative' });
    return false;
  }

  const addedToCart = await addToCart({
    productId: Number(productGetters.getId(props?.product)),
    quantity: Number(quantitySelectorValue.value),
    basketItemOrderParams: getPropertiesForCart(),
  });

  if (addedToCart) {
    quickCheckout
      ? openQuickCheckout(props?.product, quantitySelectorValue.value)
      : send({ message: t('cart.itemAdded'), type: 'positive' });

    if (getSetting() === '0') {
      send({ message: t('error.notificationsItemBundleSplitted'), type: 'warning' });
    }
  }

  return addedToCart;
};

const paypalHandleAddToCart = async (callback: PayPalAddToCartCallback) => {
  const added = await handleAddToCart(false);

  callback(added);
};

const changeQuantity = (quantity: string) => {
  quantitySelectorValue.value = Number(quantity);
};

const isReviewsAccordionOpen = () => {
  const customerReviewsAccordionDetailsElement = document.querySelector('#customerReviewsAccordion')
    ?.firstChild as HTMLDetailsElement;

  return customerReviewsAccordionDetailsElement.open;
};

const openReviewsAccordion = () => {
  const customerReviewsClickElement = document.querySelector('#customerReviewsClick') as HTMLElement;
  customerReviewsClickElement?.click();
};

const isSalableText = computed(() => (productGetters.isSalable(props?.product) ? '' : t('product.notAvailable')));
const isNotValidVariation = computed(() => (getCombination() ? '' : t('product.attributes.notValidVariation')));
const showPayPalButtons = computed(() => Boolean(getCombination()) && productGetters.isSalable(props?.product));

const scrollToReviews = () => {
  if (!isReviewsAccordionOpen()) {
    openReviewsAccordion();
  }

  if (reviewArea.value) {
    reviewArea.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const openManufacturerDetails = () => {
  openDrawer();
};

const openLeasingModal = async () => {
  leasingModalOpen.value = true;

  if (leasingModalContent.value || leasingModalLoading.value) return;

  leasingModalLoading.value = true;
  try {
    const templateResponse = await useSdk().plentysystems.getCategoryTemplate({ id: LEASING_CATEGORY_ID });
    leasingModalContent.value = templateResponse?.data?.data || '';

    if (!leasingModalContent.value) {
      const facetResponse = await useSdk().plentysystems.getFacet({
        categoryUrlPath: LEASING_CATEGORY_PATH,
        page: 1,
        itemsPerPage: 1,
      });
      const categoryDetails = facetResponse?.data?.category?.details?.[0];
      leasingModalContent.value =
        categoryDetails?.description || categoryDetails?.description2 || categoryDetails?.fulltext || '';
    }
  } catch {
    leasingModalContent.value = '';
  } finally {
    leasingModalLoading.value = false;
  }
};
</script>

<style scoped>
.purchase-card {
  color: #071625;
  box-shadow: none;
}

.purchase-card__content {
  display: flex;
  flex-direction: column;
}

.purchase-card__brand {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  color: #050505;
  font-size: 2rem;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.purchase-card__name {
  margin-bottom: 8px;
  font-size: 1.5rem;
  line-height: 1.18;
}

.purchase-card__article-number {
  margin-bottom: 16px;
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.4;
}

.purchase-card__availability {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  margin: 18px 0;
  color: #071625;
  font-size: 0.875rem;
  line-height: 1.25;
  text-transform: uppercase;
}

.purchase-card__availability-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 999px;
  background: #ff9d00;
}

.purchase-card__leasing-panel {
  margin-bottom: 18px;
  background: #e8e8e8;
}

.purchase-card__leasing-summary {
  display: flex;
  min-height: 122px;
  cursor: pointer;
  list-style: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.purchase-card__leasing-summary::-webkit-details-marker {
  display: none;
}

.purchase-card__leasing-copy {
  display: grid;
  gap: 8px;
}

.purchase-card__leasing-title {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.25;
}

.purchase-card__leasing-description {
  color: #071625;
  font-size: 0.95rem;
  line-height: 1.45;
}

.purchase-card__leasing-chevron {
  flex: 0 0 auto;
  transition: transform 0.2s ease;
}

.purchase-card__leasing-panel[open] .purchase-card__leasing-chevron {
  transform: rotate(180deg);
}

.purchase-card__leasing-options {
  padding: 0 20px 18px;
}

.purchase-card__leasing-panel :deep(.order-properties__group) {
  margin: 0;
}

.purchase-card__leasing-panel :deep(.order-properties__group-heading),
.purchase-card__leasing-panel :deep(.order-properties__group-description) {
  display: none;
}

.purchase-card__leasing-panel :deep(.order-properties__row) {
  margin-top: 10px;
}

.purchase-card__price-block {
  margin-top: 0;
  margin-bottom: 8px;
}

.purchase-card__rrp {
  color: #a9afb8;
  font-size: 0.95rem;
  line-height: 1.3;
}

.purchase-card__price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.purchase-card__price {
  color: #ef4444;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1.1;
}

.purchase-card__discount {
  display: inline-flex;
  min-width: 76px;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  background: #ef4b55;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
}

.purchase-card__unit-content {
  margin-top: 24px;
  margin-bottom: 8px;
  color: #a9afb8;
  font-size: 1rem;
}

.purchase-card__more-infos {
  display: grid;
  gap: 3px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}

.purchase-card__more-infos a,
.purchase-card__more-infos button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ci-primary);
  font-size: 0.95rem;
  line-height: 1.35;
  text-align: left;
}

.purchase-card__more-infos a:hover,
.purchase-card__more-infos a:focus-visible,
.purchase-card__more-infos button:hover,
.purchase-card__more-infos button:focus-visible {
  color: #071625;
  text-decoration: underline;
}

.purchase-card__cart-row {
  align-items: stretch;
  flex-wrap: nowrap;
}

.purchase-card__quantity {
  width: 84px;
  min-width: 84px;
  flex: 0 0 84px;
}

.purchase-card__quantity :deep(.rounded-md) {
  border-radius: 0;
}

.purchase-card__cart-tooltip {
  display: block;
}

.purchase-card__cart-button {
  min-height: 60px;
  border-radius: 0;
  background: #d1ff00 !important;
  color: #000 !important;
  font-weight: 800;
}

.purchase-card__cart-button:hover,
.purchase-card__cart-button:active {
  background: #c4f000 !important;
  color: #000 !important;
}

.purchase-card__paypal-buttons {
  width: 100%;
}

.purchase-card__tax-note {
  color: #8b8f96;
  font-style: italic;
}

.purchase-card__leasing-modal {
  z-index: 10000;
  background: #fff;
  border-radius: 0;
}

.purchase-card__leasing-modal-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #d9d9d9;
  background: #fff;
  padding: 0 18px;
}

.purchase-card__leasing-modal-header h2 {
  margin: 0;
  color: #071625;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
}

.purchase-card__leasing-modal-close {
  color: #7a7c7f;
}

.purchase-card__leasing-modal-body {
  height: calc(100% - 64px);
  overflow-y: auto;
  background: #fff;
}

.purchase-card__leasing-modal-loading,
.purchase-card__leasing-modal-empty {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  color: #7a7c7f;
}

.purchase-card__leasing-modal-content {
  width: min(100%, 1380px);
  margin: 0 auto;
  padding: 64px 48px 80px;
}

.purchase-card :deep(select) {
  width: 100%;
  height: 36px;
  min-height: 36px;
  border-radius: 0;
  background-color: #e8e8e8 !important;
  border-color: #d9d9d9 !important;
  color: #071625;
  padding-top: 0;
  padding-bottom: 8px;
  box-shadow: none;
}

.purchase-card :deep(label[for^='attribute-']),
.purchase-card :deep(label[for='unit-combination']) {
  display: block;
  padding: 9px 14px 0;
  background: #e8e8e8;
  color: #071625;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.purchase-card :deep(label[for^='attribute-'] + select),
.purchase-card :deep(label[for^='attribute-'] + div select),
.purchase-card :deep(label[for='unit-combination'] + select),
.purchase-card :deep(label[for='unit-combination'] + div select) {
  margin-top: 0;
  padding-top: 0;
}

@media (max-width: 767px) {
  .purchase-card__brand {
    font-size: 1.75rem;
  }

  .purchase-card__cart-row {
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 12px;
  }

  .purchase-card__leasing-modal-content {
    padding: 32px 18px 56px;
  }
}
</style>
