<template>
  <div
    class="relative flex h-full flex-col bg-white"
    data-testid="product-card"
    :class="{ 'border border-neutral-200': configuration?.cardBorders }"
  >
    <div class="relative overflow-hidden bg-white">
      <div
        v-if="hasSpecialOffer"
        class="product-card__sale-badge absolute left-5 top-4 z-[2] border px-1.5 py-0.5 text-xs font-normal uppercase leading-none tracking-[0.2em]"
        data-testid="product-card-sale-badge"
      >
        SALE
      </div>

      <div
        v-if="discountPercentage"
        class="product-card__discount-badge absolute right-0 top-0 z-[2] flex h-12 w-20 items-center justify-center pl-3 text-lg font-bold leading-none text-white"
        data-testid="product-card-discount-badge"
      >
        -{{ discountPercentage }}%
      </div>

      <UiBadges
        v-if="isFromWishlist"
        :use-tags="useTagsOnCategoryPage"
        :class="['absolute', isFromWishlist ? 'mx-2' : 'm-2']"
        :product="product"
        :use-availability="isFromWishlist"
      />

      <div ref="imageContainerRef" :class="[{ 'size-48': isFromSlider }, 'relative']">
        <SfLink
          :tag="productLinkTag"
          v-bind="productLinkProps"
          :title="productLinkTitle"
          class="relative group/image flex items-center justify-center"
          data-testid="product-card-link"
        >
          <div class="relative w-full aspect-square">
            <div
              v-if="!mainImageLoaded"
              class="absolute inset-0 rounded-md bg-neutral-100 animate-pulse"
              aria-hidden="true"
            />

            <NuxtImg
              v-if="canLoadMainImage"
              ref="mainImageRef"
              :src="imageUrl"
              :alt="imageAlt"
              :title="imageTitle || null"
              :loading="priority || lazy === false ? 'eager' : 'lazy'"
              :fetchpriority="priority ? 'high' : 'auto'"
              :preload="priority"
              :width="getWidth()"
              :height="getHeight()"
              :class="[
                'object-contain aspect-square w-full h-full transition-opacity duration-300',
                mainImageLoaded ? 'opacity-100' : 'opacity-0',
                effectiveHoverImageUrl && hoverImageLoaded ? 'group-hover/image:opacity-0' : '',
              ]"
              data-testid="image-slot"
              @load="onMainImageLoad"
              @error="onMainImageError"
            />

            <NuxtImg
              v-if="canLoadHoverImage && effectiveHoverImageUrl"
              ref="hoverImageRef"
              :src="effectiveHoverImageUrl"
              :alt="imageAlt"
              :title="hoverImageTitle || null"
              :loading="lazy === false ? 'eager' : 'lazy'"
              fetchpriority="auto"
              :preload="false"
              :width="getWidth()"
              :height="getHeight()"
              :class="[
                'absolute inset-0 object-contain w-full h-full opacity-0 transition-opacity duration-300',
                hoverImageLoaded ? 'group-hover/image:opacity-100' : '',
              ]"
              data-testid="hover-image-slot"
              @load="onHoverImageLoad"
              @error="onHoverImageError"
            />
          </div>
        </SfLink>
      </div>

      <template v-if="configuration?.showWishlistButton">
        <slot name="wishlistButton">
          <WishlistButton
            square
            class="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 !rounded-full"
            :product="product"
          />
        </slot>
      </template>
    </div>

    <div
      class="flex flex-auto flex-col px-5 pb-7 pt-4 typography-text-sm"
      :class="{
        'items-center': configuration?.contentAlignment === 'center',
        'items-end': configuration?.contentAlignment === 'right',
        'items-start': configuration?.contentAlignment === 'left',
      }"
    >
      <div
        v-if="brandName"
        class="mb-0.5 text-base font-semibold leading-tight text-neutral-900"
        data-testid="productcard-manufacturer"
      >
        {{ brandName }}
      </div>

      <SfLink
        :tag="productLinkTag"
        v-bind="productLinkProps"
        :title="productLinkTitle"
        class="product-card__name line-clamp-2 no-underline text-base leading-[1.1] text-neutral-500 hover:text-neutral-700"
        variant="secondary"
        data-testid="productcard-name"
      >
        {{ name }}
      </SfLink>

      <div v-if="showBasePrice" class="mt-2 text-xs leading-tight text-neutral-500">
        <BasePriceInLine :base-price="basePrice" :unit-content="unitContent" :unit-name="unitName" />
      </div>

      <div class="product-card__price-row mt-auto flex w-full items-end justify-between gap-4 pt-6">
        <div v-if="hasComparablePrice" class="flex flex-col text-xs font-normal leading-none text-neutral-500">
          <span class="font-semibold uppercase">UVP</span>
          <span class="mt-1">{{ format(crossedPrice ?? 0) }}</span>
        </div>
        <div v-else aria-hidden="true" />

        <span
          class="product-card__price ml-auto whitespace-nowrap text-base font-bold leading-none"
          :class="{ 'product-card__price--regular': !hasComparablePrice }"
          data-testid="product-card-vertical-price"
        >
          <span v-if="showFromText" class="mr-1">{{ t('account.ordersAndReturns.orderDetails.priceFrom') }}</span>
          <span>{{ format(price) }}</span>
          <span>{{ t('common.labels.asterisk') }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { manufacturerGetters, productGetters, productImageGetters } from '@plentymarkets/shop-api';
import { SfLink } from '@storefront-ui/vue';
import type { ProductCardProps } from '~/components/ui/ProductCard/types';
import { defaults } from '~/composables';
import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';
import { buildProductLinkTitle } from '~/utils/seo';

const props = withDefaults(defineProps<ProductCardProps>(), {
  configuration: () => ({
    cardBorders: true,
    contentAlignment: 'left',
    fields: {
      title: true,
      rating: true,
      previewText: false,
      price: true,
      addToCart: true,
      manufacturer: false,
    },
    fieldsOrder: ['title', 'manufacturer', 'rating', 'previewText', 'price', 'addToCart'],
    showWishlistButton: false,
    showSecondImageOnHover: false,
    addToCartStyle: 'primary',
    itemsPerRowDesktop: 4,
    itemsPerRowTablet: 3,
    itemsPerRowMobile: 1,
    showItemCount: true,
    itemCountPosition: 'center',
    fieldsDisabled: [],
    paginationPosition: 'bottom',
    layout: {
      fullWidth: false,
    },
  }),
});

const product = computed(() => props.product);

const configuration = computed(() => props.configuration || ({} as ItemGridContent));

const { addModernImageExtension } = useModernImage();
const localePath = useLocalePath();
const route = useRoute();
const { format } = usePriceFormatter();
const { price, crossedPrice } = useProductPrice(product);
const config = useRuntimeConfig();
const useTagsOnCategoryPage = config.public.useTagsOnCategoryPage;
const name = computed(
  () => productGetters.getName(product.value) + productGetters.getGroupedAttributesString(product.value),
);
const manufacturer = computed(() => {
  try {
    return productGetters.getManufacturer(product.value);
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
const showFromText = computed(() => productGetters.showFromText(product.value));
const hasSpecialOffer = computed(() => Boolean(productGetters.getSpecialOffer(product.value)));
const hasComparablePrice = computed(() =>
  Boolean(crossedPrice.value && differentPrices(price.value, crossedPrice.value)),
);
const discountPercentage = computed(() => {
  if (!crossedPrice.value || !hasComparablePrice.value) return 0;

  return Math.round((1 - price.value / crossedPrice.value) * 100);
});

const cover = computed(() => productGetters.getCoverImage(product.value));
const secondCover = computed(() => productGetters.getSecondCoverImage(product.value));
const productImages = computed(() => {
  try {
    return productGetters.getGallery(product.value);
  } catch {
    return [];
  }
});
const coverImage = computed(() => productImages.value[0]);
const secondCoverImage = computed(() => productImages.value[1]);

const imageUrl = computed(() => addModernImageExtension(cover.value));
const effectiveHoverImageUrl = computed(() => {
  if (!configuration.value?.showSecondImageOnHover) return '';
  const src = addModernImageExtension(secondCover.value);
  return src || '';
});

const imageAlt = computed(() =>
  coverImage.value ? productImageGetters.getImageAlternate(coverImage.value) || name.value || '' : name.value || '',
);
const imageTitle = computed(() =>
  coverImage.value ? productImageGetters.getImageName(coverImage.value) || imageAlt.value : imageAlt.value,
);
const hoverImageTitle = computed(() =>
  secondCoverImage.value
    ? productImageGetters.getImageName(secondCoverImage.value) || imageTitle.value
    : imageTitle.value,
);
const productLinkTitle = computed(() => buildProductLinkTitle(name.value));

const imageWidth = computed(() => productGetters.getImageWidth(product.value) || 600);
const imageHeight = computed(() => productGetters.getImageHeight(product.value) || 600);

const basePrice = computed(() => productGetters.getDefaultBasePrice(product.value));
const unitContent = computed(() => productGetters.getUnitContent(product.value));
const unitName = computed(() => productGetters.getUnitName(product.value));
const showBasePrice = computed(() => productGetters.showPricePerUnit(product.value));

const variationId = computed(() => productGetters.getVariationId(product.value));
const { isGlobalProductCategoryTemplate } = useProducts();
const productPath = computed(() => {
  if (isGlobalProductCategoryTemplate?.value) {
    return paths.globalItemDetails;
  }
  if (useCallisto().isEnabled) {
    return localePath(`/${productGetters.getUrlPath(product.value)}/a-${productGetters.getItemId(product.value)}`);
  }
  const basePath = `/${productGetters.getUrlPath(product.value)}_${productGetters.getItemId(product.value)}`;
  const shouldAppendVariation = productGetters.shouldAppendVariationToLink(product.value);
  return localePath(shouldAppendVariation ? `${basePath}_${variationId.value}` : basePath);
});
const shouldUseNativeProductLink = computed(() => route.meta.type === 'product');
const productLinkTag = computed(() => (shouldUseNativeProductLink.value ? 'a' : NuxtLink));
const productLinkProps = computed(() =>
  shouldUseNativeProductLink.value ? { href: productPath.value } : { to: productPath.value },
);

const priority = computed(() => !props.isFromSlider && (props.index ?? 0) < 5);
const {
  imageContainerRef,
  mainImageRef,
  hoverImageRef,
  shouldLoadMainImage,
  shouldLoadHoverImage,
  mainImageLoaded,
  hoverImageLoaded,
  onMainImageLoad,
  onMainImageError,
  onHoverImageLoad,
  onHoverImageError,
} = useLazyProductImage({
  priority,
  hoverImageUrl: effectiveHoverImageUrl,
});

const externalImagePermission = computed(() => {
  if (!props.isFromSlider) return true;
  return props.shouldLoadImage ?? true;
});
const canLoadMainImage = computed(() => {
  if (!externalImagePermission.value) return false;

  if (props.isFromSlider) return true;

  return shouldLoadMainImage.value;
});

const canLoadHoverImage = computed(() => {
  if (!externalImagePermission.value || !effectiveHoverImageUrl.value) return false;

  if (props.isFromSlider) return true;

  return shouldLoadHoverImage.value;
});
const getWidth = () => {
  if (imageWidth.value && imageWidth.value > 0 && imageUrl.value.includes(defaults.IMAGE_LINK_SUFIX)) {
    return imageWidth.value;
  }
  return '';
};

const getHeight = () => {
  if (imageHeight.value && imageHeight.value > 0 && imageUrl.value.includes(defaults.IMAGE_LINK_SUFIX)) {
    return imageHeight.value;
  }
  return '';
};

const differentPrices = (price: number, crossedPrice: number) => {
  return crossedPrice ? Math.round(price * 100) / 100 !== Math.round(crossedPrice * 100) / 100 : false;
};

const NuxtLink = resolveComponent('NuxtLink');
</script>
