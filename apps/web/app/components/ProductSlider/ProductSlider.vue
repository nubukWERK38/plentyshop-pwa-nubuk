<template>
  <div ref="sliderRootRef" class="w-full">
    <SfScrollable
      buttons-placement="floating"
      class="w-full pb-4 scrollbar-hidden"
      :wrapper-class="wrapperClass"
      data-testid="product-slider"
    >
      <UiProductCard
        v-for="(product, index) in items"
        :key="productGetters.getId(product)"
        :product="product"
        :should-load-image="shouldLoadImage(index)"
        :index="index"
        is-from-slider
        :class="['product-slider__item w-44 max-w-44 shrink-0 sm:w-48 sm:max-w-48 xl:w-56 xl:max-w-56', cardClass]"
        :style="getItemStyle(index)"
      />
    </SfScrollable>
  </div>
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
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import { SfScrollable, SfLink } from '@storefront-ui/vue';
import type { CSSProperties } from 'vue';
import type { ProductSliderProps } from '~/components/ProductSlider/types';
import { paths } from '~/utils/paths';

const { showNetPrices } = useCart();
const localePath = useLocalePath();

const props = withDefaults(defineProps<ProductSliderProps>(), {
  itemGap: 16,
  visibleItems: undefined,
  cardClass: '',
});

const { sliderRootRef, shouldLoadImage } = useSliderImagePreload({
  itemWidth: 192,
  itemGap: props.itemGap,
  preloadBuffer: 2,
});

const visibleItems = computed(() => {
  if (props.visibleItems === undefined || props.visibleItems === null) return undefined;
  return Math.max(1, Math.min(Number(props.visibleItems) || 1, 12));
});

const getItemStyle = (index: number): CSSProperties => {
  const style: CSSProperties = {
    marginRight: index < (props.items?.length ?? 0) - 1 ? `${props.itemGap}px` : '0px',
  };

  if (visibleItems.value !== undefined) {
    const width = `calc((100% - (${visibleItems.value - 1} * ${props.itemGap}px)) / ${visibleItems.value})`;
    style.width = width;
    style.maxWidth = width;
    style.flexBasis = width;
  }

  return style;
};
</script>
