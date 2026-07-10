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
                v-if="shouldShowPricePerUnit(product)"
                :base-price="basePriceSingleValue"
                :unit-content="productGetters.getUnitContent(product)"
                :unit-name="productGetters.getUnitName(product)"
              />
              <ul class="purchase-card__more-infos">
                <li>
                  <button type="button" title="Wie läuft eine Retoure ab?" @click="openInfoModal('return')">
                    <SfIconChevronRight size="xs" aria-hidden="true" />
                    Wie läuft eine Retoure ab?
                  </button>
                </li>
                <li>
                  <button type="button" title="Fragen zum Produkt?" @click="openProductQuestionTab">
                    <SfIconChevronRight size="xs" aria-hidden="true" />
                    Fragen zum Produkt?
                  </button>
                </li>
                <li>
                  <button type="button" title="Mit Bike-Leasing bis zu 40% sparen" @click="openInfoModal('leasing')">
                    <SfIconChevronRight size="xs" aria-hidden="true" />
                    Mit Bike-Leasing bis zu 40% sparen
                  </button>
                </li>
                <li>
                  <button type="button" title="Herstellerangaben" @click="openManufacturerDetails">
                    <SfIconChevronRight size="xs" aria-hidden="true" />
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
                class="purchase-card__preview-text mb-2 font-normal whitespace-pre-line break-words no-preflight"
                data-testid="product-description"
              >
                <p class="purchase-card__preview-title">
                  <span class="purchase-card__preview-product-name">{{ productGetters.getName(product) }}</span>
                  <span class="purchase-card__preview-title-main">Kurz-Check</span>
                </p>
                <div class="purchase-card__preview-copy" v-html="productGetters.getShortDescription(product)" />
              </div>
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
                  <!--<PayPalPayLaterBanner
                    placement="product"
                    location="itemPage"
                    :amount="priceWithProperties * quantitySelectorValue"
                  />-->
                </template>
                <div v-if="showEasyCreditButton" data-testid="easycredit-button" class="purchase-card__easycredit mt-3">
                  <img class="purchase-card__easycredit-logo" :src="EASY_CREDIT_LOGO_URL" alt="easyCredit" />
                  <div class="purchase-card__easycredit-content">
                    <div
                      :id="easyCreditInlineComponentId"
                      ref="easyCreditInlineComponent"
                      class="purchase-card__easycredit-widget"
                      @click.capture="handleEasyCreditInlineClick"
                    />
                    <p v-if="showEasyCreditDebug" class="purchase-card__easycredit-debug">
                      {{ easyCreditDebugMessage }}
                    </p>
                  </div>
                </div>
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

    <ClientOnly>
      <Teleport to="body">
        <UiModal
          v-model="infoModalOpen"
          aria-labelledby="purchase-card-info-modal-title"
          tag="section"
          role="dialog"
          class="purchase-card__info-modal"
          overlay-classes="purchase-card__info-modal-overlay"
        >
          <header class="purchase-card__info-modal-header">
            <h2 id="purchase-card-info-modal-title" class="purchase-card__info-modal-title">{{ infoModalTitle }}</h2>
            <UiButton
              type="button"
              variant="tertiary"
              square
              class="text-white hover:bg-white/10 active:bg-white/20"
              :aria-label="t('common.navigation.closeDrawer')"
              @click="closeInfoModal"
            >
              <SfIconClose />
            </UiButton>
          </header>

          <div v-if="infoModalLoading" class="purchase-card__info-modal-loading">
            <SfLoaderCircular size="lg" />
          </div>
          <div v-else-if="infoModalError" class="purchase-card__info-modal-error">
            Inhalt konnte nicht geladen werden.
          </div>
          <div v-else class="purchase-card__info-modal-content" v-html="infoModalContent" />
        </UiModal>

        <UiModal
          v-model="easyCreditModalOpen"
          aria-labelledby="easycredit-modal-title"
          tag="section"
          role="dialog"
          class="purchase-card__easycredit-modal"
          overlay-classes="purchase-card__easycredit-modal-overlay"
        >
          <header class="purchase-card__easycredit-modal-header">
            <h2 id="easycredit-modal-title" class="purchase-card__easycredit-modal-title">
              <img class="purchase-card__easycredit-modal-logo" :src="EASY_CREDIT_LOGO_URL" alt="" aria-hidden="true" />
              <span>easyCredit-Ratenkauf</span>
            </h2>
            <UiButton
              type="button"
              variant="tertiary"
              square
              class="purchase-card__easycredit-close"
              :aria-label="t('common.navigation.closeDrawer')"
              @click="closeEasyCreditModal"
            >
              <SfIconClose />
            </UiButton>
          </header>
          <div class="purchase-card__easycredit-modal-content">
            <div
              :id="easyCreditModalComponentId"
              ref="easyCreditModalComponent"
              class="purchase-card__easycredit-widget"
            />
            <p v-if="showEasyCreditDebug" class="purchase-card__easycredit-debug">{{ easyCreditDebugMessage }}</p>
          </div>
        </UiModal>
      </Teleport>
    </ClientOnly>
  </form>
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
  SfIconChevronRight,
} from '@storefront-ui/vue';
import type { PriceCardPadding, PurchaseCardProps } from '~/components/ui/PurchaseCard/types';
import type { PayPalAddToCartCallback } from '#paypal/types';
import { paths } from '~/utils/paths';
import { shouldShowPricePerUnit } from '~/utils/productHelper';

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
const { isInEditor } = useEditorState();

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
const LEASING_CATEGORY_PATH = '/ueber-uns/leasingpartner';
const RETURN_CATEGORY_PATH = '/ueber-uns/retoure';
const EASY_CREDIT_WEBSHOP_ID = '1.de.11459.4';
const EASY_CREDIT_LOGO_URL = 'https://cdn03.plentyone.com/0bcmhf2jth7k/frontend/easyCredit.svg';
const EASY_CREDIT_JQUERY_URL = 'https://code.jquery.com/jquery-1.11.3.min.js';
const EASY_CREDIT_SCRIPT_URL = 'https://ratenkauf.easycredit.de/widget/ratenrechner/v2/ratenrechner.js';
const EASY_CREDIT_CSS_URL = 'https://ratenkauf.easycredit.de/ratenkauf/js/ratenrechner/v1/ratenrechner.css';
const EASY_CREDIT_MIN_AMOUNT = 200;
const showEasyCreditDebug = false;
type InfoModalType = 'return' | 'leasing';
const infoModalOpen = ref(false);
const infoModalTitle = ref('');
const infoModalContent = ref('');
const infoModalLoading = ref(false);
const infoModalError = ref(false);
const easyCreditModalOpen = ref(false);
const easyCreditInlineComponent = ref<HTMLElement | null>(null);
const easyCreditModalComponent = ref<HTMLElement | null>(null);
const easyCreditStatus = ref<'idle' | 'loading' | 'loaded' | 'rendered' | 'empty' | 'belowMinimum' | 'error'>('idle');
const easyCreditError = ref('');
const easyCreditIdBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');
const easyCreditInlineComponentId = `easycredit-ratenrechner-inline-${easyCreditIdBase}`;
const easyCreditModalComponentId = `easycredit-ratenrechner-modal-${easyCreditIdBase}`;
const infoModalPages: Record<InfoModalType, { title: string; path: string }> = {
  return: {
    title: 'Wie läuft eine Retoure ab?',
    path: RETURN_CATEGORY_PATH,
  },
  leasing: {
    title: 'Mit Bike-Leasing bis zu 40% sparen',
    path: LEASING_CATEGORY_PATH,
  },
};

const manufacturer = computed(() => {
  try {
    return productGetters.getManufacturer(props.product);
  } catch {
    return null;
  }
});
const brandName = computed(() => {
  if (!manufacturer.value) return '';

  return (
    manufacturerGetters.getManufacturerExternalName(manufacturer.value) ||
    manufacturerGetters.getManufacturerNameExternal(manufacturer.value) ||
    manufacturerGetters.getManufacturerName(manufacturer.value)
  );
});

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
  if (!manufacturer.value) return '';

  const getterLogo = getNormalizedBrandLogo(manufacturerGetters.getManufacturerLogo(manufacturer.value));
  if (getterLogo) return getterLogo;

  return getNormalizedBrandLogo(manufacturer.value);
});
const variationNumber = computed(() => productGetters.getVariationNumber(props.product));
const availabilityName = computed(() => {
  try {
    return productGetters.getAvailabilityName(props.product) || '';
  } catch {
    return '';
  }
});
const orderPropertiesGroups = computed(() => {
  if (!Array.isArray((props.product as { properties?: unknown }).properties)) return [];

  try {
    return Object.values(productPropertyGetters.getOrderPropertiesGroups(props.product));
  } catch {
    return [];
  }
});
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
  renderEasyCreditInlineWidget();
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
const showPayPalButtons = computed(
  () => !isInEditor.value && Boolean(getCombination()) && productGetters.isSalable(props?.product),
);
const showEasyCreditButton = computed(
  () => !isInEditor.value && Boolean(getCombination()) && productGetters.isSalable(props?.product),
);

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const easyCreditPurchaseAmount = computed(() => roundCurrency(priceWithProperties.value * quantitySelectorValue.value));
const easyCreditDebugMessage = computed(() => {
  const amount = format(easyCreditPurchaseAmount.value);

  switch (easyCreditStatus.value) {
    case 'idle':
      return `easyCredit Debug: wartet auf Initialisierung, Betrag ${amount}.`;
    case 'loading':
      return `easyCredit Debug: Script wird geladen, Betrag ${amount}.`;
    case 'loaded':
      return `easyCredit Debug: Script geladen, Widget wird gerendert, Betrag ${amount}.`;
    case 'rendered':
      return `easyCredit Debug: Widget wurde gerendert, Betrag ${amount}.`;
    case 'empty':
      return `easyCredit Debug: Script geladen, aber Widget blieb leer. Betrag ${amount}.`;
    case 'belowMinimum':
      return `easyCredit Debug: Betrag ${amount} liegt unter 200 EUR, easyCredit blendet den Rechner laut Doku aus.`;
    case 'error':
      return `easyCredit Debug: Script/Widget konnte nicht geladen werden. ${easyCreditError.value}`;
    default:
      return `easyCredit Debug: unbekannter Status, Betrag ${amount}.`;
  }
});

type EasyCreditRatenrechnerPlugin = {
  anzeige: (
    id: string,
    options: {
      webshopId: string;
      finanzierungsbetrag: number;
      textVariante: 'KURZ';
      euro: 'SYMBOL';
    },
  ) => void;
};

declare global {
  interface Window {
    jQuery?: unknown;
    jQuery_1_11_3?: unknown;
    rkPlugin?: EasyCreditRatenrechnerPlugin;
  }
}

useHead({
  link: [{ rel: 'stylesheet', type: 'text/css', href: EASY_CREDIT_CSS_URL }],
});

const loadExternalScript = async (src: string, isReady: () => boolean) => {
  if (isReady()) return;

  const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existingScript) {
    existingScript.remove();
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = false;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error(`Script konnte nicht geladen werden: ${src}`)));
    document.head.appendChild(script);
  });
};

const waitForEasyCreditPlugin = async () => {
  if (window.rkPlugin) return window.rkPlugin;

  easyCreditStatus.value = 'loading';
  await loadExternalScript(EASY_CREDIT_JQUERY_URL, () => Boolean(window.jQuery));

  if (window.jQuery && !window.jQuery_1_11_3) {
    window.jQuery_1_11_3 = window.jQuery;
  }

  await loadExternalScript(EASY_CREDIT_SCRIPT_URL, () => Boolean(window.rkPlugin));

  return await new Promise<EasyCreditRatenrechnerPlugin>((resolve, reject) => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.rkPlugin) {
        window.clearInterval(timer);
        resolve(window.rkPlugin);
      }
      if (attempts >= 80) {
        window.clearInterval(timer);
        reject(new Error('easyCredit Ratenrechner konnte nicht geladen werden.'));
      }
    }, 100);
  });
};

const expandEasyCreditCalculator = (container: HTMLElement) => {
  const clickableElements = Array.from(
    container.querySelectorAll<HTMLElement>('a, button, [role="button"], [onclick]'),
  );
  const trigger =
    clickableElements.find((element) => /mehr informationen|ratenkauf/i.test(element.textContent ?? '')) ??
    clickableElements[0];

  trigger?.click();
};

const renderEasyCreditWidget = async (container: HTMLElement | null, componentId: string, expandCalculator = false) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') return;
  if (!import.meta.client || !showEasyCreditButton.value || !container) return;

  if (easyCreditPurchaseAmount.value < EASY_CREDIT_MIN_AMOUNT) {
    easyCreditStatus.value = 'belowMinimum';
    container.innerHTML = '';
    return;
  }

  try {
    easyCreditError.value = '';
    container.innerHTML = '';
    const rkPlugin = await waitForEasyCreditPlugin();
    easyCreditStatus.value = 'loaded';
    rkPlugin.anzeige(componentId, {
      webshopId: EASY_CREDIT_WEBSHOP_ID,
      finanzierungsbetrag: easyCreditPurchaseAmount.value,
      textVariante: 'KURZ',
      euro: 'SYMBOL',
    });
    await nextTick();
    window.setTimeout(() => {
      if (expandCalculator) expandEasyCreditCalculator(container);
      easyCreditStatus.value = container.textContent?.trim() ? 'rendered' : 'empty';
    }, 300);
  } catch (error) {
    easyCreditStatus.value = 'error';
    easyCreditError.value = error instanceof Error ? error.message : String(error);
    container.innerHTML = '';
  }
};

const renderEasyCreditInlineWidget = async () => {
  await renderEasyCreditWidget(easyCreditInlineComponent.value, easyCreditInlineComponentId);
};

const renderEasyCreditModalWidget = async () => {
  await renderEasyCreditWidget(easyCreditModalComponent.value, easyCreditModalComponentId, true);
};

watch([easyCreditPurchaseAmount, showEasyCreditButton], async () => {
  await nextTick();
  await renderEasyCreditInlineWidget();
  if (easyCreditModalOpen.value) await renderEasyCreditModalWidget();
});

watch(easyCreditModalOpen, async (isOpen) => {
  await nextTick();

  if (isOpen) {
    await renderEasyCreditModalWidget();
  } else {
    easyCreditStatus.value = 'idle';
    easyCreditError.value = '';
    if (easyCreditModalComponent.value) easyCreditModalComponent.value.innerHTML = '';
  }
});

const handleEasyCreditInlineClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openEasyCreditModal();
};

const openEasyCreditModal = () => {
  easyCreditModalOpen.value = true;
};

const closeEasyCreditModal = () => {
  easyCreditModalOpen.value = false;
};

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

const closeInfoModal = () => {
  infoModalOpen.value = false;
};

const extractInfoModalContent = (html: string) => {
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  const content =
    documentFragment.querySelector('[data-testid="category-page-content"]') ??
    documentFragment.querySelector('main') ??
    documentFragment.body;

  content.querySelectorAll('script, style, noscript').forEach((element) => element.remove());

  return content.innerHTML;
};

const openInfoModal = async (type: InfoModalType) => {
  const page = infoModalPages[type];

  infoModalTitle.value = page.title;
  infoModalContent.value = '';
  infoModalError.value = false;
  infoModalLoading.value = true;
  infoModalOpen.value = true;

  try {
    const response = await fetch(localePath(page.path));
    if (!response.ok) throw new Error(`Failed to load ${page.path}`);

    infoModalContent.value = extractInfoModalContent(await response.text());
  } catch {
    infoModalError.value = true;
  } finally {
    infoModalLoading.value = false;
  }
};

const dispatchProductQuestionTabEvent = () => {
  return !window.dispatchEvent(new CustomEvent('open-product-question-tab', { cancelable: true }));
};

const openProductQuestionTab = () => {
  let handled = dispatchProductQuestionTabEvent();
  if (handled) return;

  setTimeout(() => {
    if (handled) return;
    handled = dispatchProductQuestionTabEvent();
  }, 100);

  setTimeout(() => {
    if (handled) return;
    dispatchProductQuestionTabEvent();
  }, 300);
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

.purchase-card__brand-logo {
  display: block;
  width: auto;
  height: auto;
  max-width: min(250px, 100%);
  max-height: 72px;
  object-fit: contain;
  object-position: left center;
}

.purchase-card__name {
  margin-bottom: 8px;
  font-size: 1.5rem;
  line-height: 1.18;
}

.purchase-card__article-number {
  margin-bottom: 16px;
  color: var(--var-primary-grey-light);
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

.purchase-card__preview-text {
  padding: 30px;
  border: 2px solid var(--ci-primary);
  background: var(--ci-primary-gradient);
  color: #fff;
  font-size: 0.8125rem;
  line-height: 1.32;
}

.purchase-card__preview-title {
  margin: 0 0 1rem;
  color: inherit;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
}

.purchase-card__preview-product-name,
.purchase-card__preview-title-main {
  display: block;
}

.purchase-card__preview-title-main {
  font-size: 2.1rem;
  line-height: 1.05;
}

.purchase-card__preview-copy :deep(p),
.purchase-card__preview-copy :deep(ul),
.purchase-card__preview-copy :deep(ol) {
  margin: 0 0 0.45rem;
  font-size: inherit;
  line-height: inherit;
}

.purchase-card__preview-copy :deep(p:last-child),
.purchase-card__preview-copy :deep(ul:last-child),
.purchase-card__preview-copy :deep(ol:last-child) {
  margin-bottom: 0;
}

.purchase-card__leasing-panel {
  margin-bottom: 18px;
  border: 2px solid var(--var-primary-grey-dark);
  background: linear-gradient(90deg, var(--var-primary-grey-light), var(--var-primary-grey-dark));
  color: #fff;
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
  color: inherit;
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
  padding: 0 20px 20px;
}

.purchase-card__leasing-panel :deep(.order-properties__group) {
  margin: 0;
  padding: 14px 18px;
  background: #f8f9f9;
  color: #071625;
}

.purchase-card__leasing-panel :deep(.order-properties__group-heading),
.purchase-card__leasing-panel :deep(.order-properties__group-description) {
  display: none;
}

.purchase-card__leasing-panel :deep(.order-properties__row) {
  width: 100%;
  margin-top: 0;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  color: #071625;
}

.purchase-card__leasing-panel :deep(.order-properties__row:last-child) {
  border-bottom: 0;
}

.purchase-card__leasing-panel :deep(.order-properties__row > div) {
  width: 100%;
}

.purchase-card__leasing-panel :deep(label[for^='prop-']) {
  color: #071625;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.35;
}

.purchase-card__leasing-panel :deep(input[type='checkbox']) {
  width: 18px;
  min-width: 18px;
  height: 18px;
  margin-right: 10px;
  color: #071625;
}

.purchase-card__price-block {
  margin-top: 0;
  margin-bottom: 8px;
}

.purchase-card__rrp {
  float: right;
  margin-right: 30px;
  margin-bottom: 10px;
  color: var(--ci-dark);
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
  margin-left: 30px;
  color: var(--ci-dark);
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

.purchase-card__easycredit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 10px 0 0;
  background: transparent;
  color: #0066b3;
  text-align: center;
}

.purchase-card__easycredit-logo {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
}

.purchase-card__easycredit-content {
  min-width: 0;
  flex: 0 1 auto;
}

:global(.purchase-card__easycredit-modal-overlay) {
  z-index: 2147483400 !important;
  background: rgb(0 0 0 / 50%);
}

:global(.purchase-card__easycredit-modal) {
  width: min(620px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 32px));
  overflow: hidden;
  border: 0;
  border-radius: 4px;
  padding: 0;
  background: #fff;
  color: #071625;
  box-shadow: 0 18px 48px rgb(0 0 0 / 28%);
}

:global(.purchase-card__easycredit-modal-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  color: #1c76bd;
}

:global(.purchase-card__easycredit-modal-title) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #1c76bd;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.purchase-card__easycredit-modal-logo {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
}

:global(.purchase-card__easycredit-close) {
  color: #777 !important;
}

.purchase-card__easycredit-modal-content {
  max-height: calc(min(760px, 100vh - 32px) - 62px);
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.purchase-card__easycredit-widget {
  width: 100%;
  min-height: 24px;
  color: #0066b3;
  text-align: center;
}

.purchase-card__easycredit-widget :deep(*) {
  color: #0066b3 !important;
}

.purchase-card__easycredit-modal-content .purchase-card__easycredit-widget {
  min-height: 360px;
}

.purchase-card__easycredit-widget :deep(.styleKurzText),
.purchase-card__easycredit-widget :deep(.styleRate),
.purchase-card__easycredit-widget :deep(.styleLink) {
  color: #0066b3 !important;
}

.purchase-card__easycredit-widget :deep(.styleKurzText),
.purchase-card__easycredit-widget :deep(.styleRate) {
  font-weight: 700 !important;
}

.purchase-card__easycredit-widget :deep(.styleLink) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.purchase-card__easycredit-debug {
  margin: 8px 0 0;
  padding: 8px 10px;
  border: 1px dashed #f28c00;
  background: #fff8ed;
  color: #7a4b00;
  font-size: 0.75rem;
  line-height: 1.35;
}

.purchase-card__tax-note {
  color: #8b8f96;
  font-style: italic;
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

:global(.purchase-card__info-modal-overlay) {
  z-index: 2147483400 !important;
  background: rgb(29 44 54 / 54%);
}

:global(.purchase-card__info-modal) {
  width: min(960px, calc(100vw - 32px));
  max-height: min(820px, calc(100vh - 32px));
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  padding: 0;
  background: #fff;
  color: #071625;
  box-shadow: 0 18px 48px rgb(0 0 0 / 28%);
}

:global(.purchase-card__info-modal-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--ci-primary);
  color: #fff;
}

:global(.purchase-card__info-modal-title) {
  margin: 0;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
}

:global(.purchase-card__info-modal-loading),
:global(.purchase-card__info-modal-error) {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

:global(.purchase-card__info-modal-content) {
  max-height: calc(min(820px, 100vh - 32px) - 80px);
  overflow-y: auto;
  padding: 1.5rem;
}

:global(.purchase-card__info-modal-content a) {
  color: var(--ci-primary);
  text-decoration: underline;
}

@media (max-width: 767px) {
  .purchase-card,
  .purchase-card__content,
  .purchase-card__price-block,
  .purchase-card__preview-text,
  .purchase-card__leasing-panel,
  .purchase-card__cart-section,
  .purchase-card__paypal-buttons,
  .purchase-card__easycredit {
    width: 100%;
    max-width: 100%;
  }

  .purchase-card {
    box-sizing: border-box;
  }

  .purchase-card__price-block {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 0;
  }

  .purchase-card__rrp {
    order: 2;
    width: 50%;
    min-width: 0;
    margin: 0;
    padding: 0 0 0 10px;
    float: none;
    text-align: left;
  }

  .purchase-card__price-row {
    order: 1;
    width: 50%;
    min-width: 0;
    gap: 8px;
  }

  .purchase-card__price {
    margin-left: 0;
  }

  .purchase-card__discount {
    min-width: 58px;
    min-height: 30px;
    font-size: 0.875rem;
  }

  .purchase-card__brand {
    font-size: 1.75rem;
  }

  .purchase-card__brand-logo {
    max-height: 56px;
  }

  .purchase-card__cart-row {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 12px;
    width: 100%;
  }

  .purchase-card__quantity {
    width: 84px;
    min-width: 84px;
  }

  .purchase-card__cart-tooltip {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .purchase-card__cart-button {
    width: 100%;
  }

  .purchase-card__leasing-summary {
    min-height: auto;
    padding: 16px;
  }

  .purchase-card__leasing-options {
    padding: 0 16px 16px;
  }

  .purchase-card :deep([data-testid='product-attributes']),
  .purchase-card :deep([data-testid='product-attributes'] > div),
  .purchase-card :deep(label[for^='attribute-']),
  .purchase-card :deep(label[for='unit-combination']),
  .purchase-card :deep(select),
  .purchase-card :deep([id='attribute-box']) {
    width: 100%;
    max-width: 100%;
  }

  .purchase-card__paypal-buttons :deep(*) {
    max-width: 100%;
  }
}
</style>
