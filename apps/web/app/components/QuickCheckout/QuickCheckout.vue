<template>
  <UiModal
    v-if="isOpen"
    v-model="isOpen"
    tag="section"
    class="h-full md:h-fit m-0 p-0 lg:w-[1000px] overflow-y-auto"
    aria-label="quick-checkout-modal"
    @mousemove="endTimer()"
  >
    <header>
      <h2 class="font-bold text-lg leading-6 md:text-2xl">
        <span>{{ t('quickCheckout.heading') }}</span>
      </h2>
      <div class="absolute right-2 top-2 flex items-center">
        <span v-if="hasTimer" class="mr-2 text-gray-400">{{ timer }}s</span>
        <UiButton
          :aria-label="t('common.navigation.closeDialog')"
          data-testid="quick-checkout-close"
          square
          variant="tertiary"
          @click="close"
        >
          <SfIconClose />
        </UiButton>
      </div>
    </header>

    <div class="lg:grid lg:grid-cols-2 lg:gap-4">
      <div class="lg:border-r-2 flex flex-col items-center p-8">
        <NuxtImg
          :src="addModernImageExtension(productGetters.getMiddleImage(props.product))"
          :alt="imageAlt"
          :title="
            productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              ? productImageGetters.getImageName(productImageGetters.getFirstImage(props.product))
              : null
          "
          width="240"
          height="240"
          loading="lazy"
          class="mb-3"
        />
        <div class="flex mb-1">
          <h1 class="font-bold typography-headline-4 break-word" data-testid="product-name">
            {{ productGetters.getName(props.product) }}
          </h1>
        </div>
        <div class="mb-3">
          <span class="self-center text-gray-600 sm:typography-headline-4 typography-headline-3">
            {{ t('account.ordersAndReturns.orderDetails.quantity') }}: {{ quantity }}
          </span>
        </div>

        <div
          v-if="itemAttributes.length"
          class="mb-4 w-full max-w-[360px] border-2 border-primary-600 bg-primary-50 p-3"
          data-testid="quick-checkout-attributes"
        >
          <p class="mb-2 text-sm font-bold uppercase text-neutral-900">{{ t('quickCheckout.selectedOptions') }}</p>
          <dl class="grid gap-2">
            <div
              v-for="attribute in itemAttributes"
              :key="`${attribute.label}-${attribute.value}`"
              class="flex items-center justify-between gap-3 text-sm"
            >
              <dt class="text-neutral-700">{{ attribute.label }}</dt>
              <dd class="font-bold text-neutral-900 text-right">{{ attribute.value }}</dd>
            </div>
          </dl>
        </div>

        <ProductPrice :product="props.product" />

        <div
          v-if="shortDescription"
          class="quick-checkout__description mb-2 font-normal typography-text-sm no-preflight"
          data-testid="product-description"
          v-html="shortDescription"
        />
        <SfLink
          v-if="shortDescription"
          :tag="NuxtLink"
          :to="productDescriptionPath"
          class="quick-checkout__read-more mb-4 typography-text-sm font-semibold"
          data-testid="quick-checkout-read-more"
          @click="close"
        >
          {{ t('quickCheckout.readMore') }}
        </SfLink>

        <div class="mt-4 typography-text-xs flex gap-1">
          <span>{{ t('common.labels.asterisk') }}</span>
          <span v-if="showNetPrices">{{ t('product.priceExclVAT') }}</span>
          <span v-else>{{ t('product.priceInclVAT') }}</span>
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

        <VariationProperties :product="lastUpdatedProduct" />
      </div>
      <div class="py-8 px-10">
        <div class="mb-8">
          <p class="font-medium text-base">{{ t('quickCheckout.cartContains', { count: cartItemsCount }) }}</p>
          <div class="grid grid-cols-2">
            <p class="text-base">{{ t('quickCheckout.subTotal') }}:</p>
            <p v-if="showNetPrices" data-testid="subtotal" class="font-medium text-right">
              {{ format(cartGetters.getItemSumNet(cart)) }}
            </p>
            <p v-else data-testid="subtotal" class="font-medium text-right">{{ format(totals.subTotal) }}</p>
          </div>
        </div>

        <UiButton
          data-testid="quick-checkout-cart-button"
          size="lg"
          class="w-full mb-3"
          variant="secondary"
          @click="goToPage(paths.cart)"
        >
          {{ t('quickCheckout.checkYourCart') }}
        </UiButton>

        <UiButton
          data-testid="quick-checkout-checkout-button"
          size="lg"
          class="w-full mb-4 md:mb-0"
          @click="goToCheckout()"
        >
          {{ t('common.actions.goToCheckout') }}
        </UiButton>
        <template v-if="showPayPalButtons">
          <OrDivider class="my-4" />
          <PayPalExpressButton
            class="w-full text-center"
            location="quickCheckout"
            type="CartPreview"
            @on-approved="isOpen = false"
          />
          <PayPalPayLaterBanner placement="payment" location="quickCheckout" :amount="totals.total" />
        </template>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { SfIconClose, SfLink } from '@storefront-ui/vue';
import type { QuickCheckoutProps } from './types';
import type { Product } from '@plentymarkets/shop-api';
import { cartGetters, productGetters, productImageGetters } from '@plentymarkets/shop-api';
import ProductPrice from '~/components/ProductPrice/ProductPrice.vue';
import { paths } from '~/utils/paths';
import { getProductImageAlt } from '~/utils/productImageAlt';

const props = defineProps<QuickCheckoutProps>();

const { format } = usePriceFormatter();
const { showNetPrices } = useCart();
const localePath = useLocalePath();
const { data: cart, lastUpdatedCartItem } = useCart();
const { isAvailable: isPaypalAvailable, loadConfig } = usePayPal();
const { addModernImageExtension } = useModernImage();
const { isOpen, timer, startTimer, endTimer, closeQuickCheckout, hasTimer, quantity } = useQuickCheckout();
const { isInEditor } = useEditorState();
const cartItemsCount = computed(() => cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const { isAuthorized } = useCustomer();

onMounted(() => {
  startTimer();
  if (!isInEditor.value) loadConfig();
});
onUnmounted(() => endTimer());

const lastUpdatedProduct = computed(() => cartGetters.getVariation(lastUpdatedCartItem.value) || ({} as Product));
const itemAttributes = computed(() => cartGetters.getItemAttributes(lastUpdatedCartItem.value));
const shortDescription = computed(() => productGetters.getShortDescription(props.product));
const variationId = computed(() => productGetters.getVariationId(props.product));

const productPath = computed(() => {
  if (useCallisto().isEnabled) {
    return localePath(`/${productGetters.getUrlPath(props.product)}/a-${productGetters.getItemId(props.product)}`);
  }

  const basePath = `/${productGetters.getUrlPath(props.product)}_${productGetters.getItemId(props.product)}`;
  const shouldAppendVariation = productGetters.shouldAppendVariationToLink(props.product);

  return localePath(shouldAppendVariation ? `${basePath}_${variationId.value}` : basePath);
});
const productDescriptionPath = computed(() => `${productPath.value}#beschreibung`);

const totals = computed(() => {
  const totalsData = cartGetters.getTotals(cart.value);
  return {
    total: totalsData.total,
    subTotal: totalsData.subtotal,
    vats: totalsData.totalVats,
  };
});

const imageAlt = computed(() => {
  const image = props.product?.images?.all?.[0];
  return getProductImageAlt(image, productGetters.getName(props.product), 0);
});

const showPayPalButtons = computed(() => !isInEditor.value && isPaypalAvailable('quickCheckout').value);

const goToCheckout = () => (isAuthorized.value ? goToPage(paths.checkout) : goToPage(paths.guestLogin));

const goToPage = (path: string) => {
  closeQuickCheckout();
  navigateTo(localePath(path));
};

const close = () => {
  closeQuickCheckout();
};

const NuxtLink = resolveComponent('NuxtLink');
</script>

<style scoped>
.quick-checkout__description {
  max-height: calc(1.45em * 5);
  overflow: hidden;
  line-height: 1.45;
}

.quick-checkout__description :deep(p),
.quick-checkout__description :deep(ul),
.quick-checkout__description :deep(ol) {
  margin: 0 0 0.35rem;
}

.quick-checkout__description :deep(p:last-child),
.quick-checkout__description :deep(ul:last-child),
.quick-checkout__description :deep(ol:last-child) {
  margin-bottom: 0;
}

.quick-checkout__read-more {
  color: var(--ci-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
