<template>
  <div ref="sliderRootRef">
    <SfScrollable
      buttons-placement="floating"
      class="pb-4 scrollbar-hidden"
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
        class="w-48 max-w-48 shrink-0"
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
});

const { sliderRootRef, shouldLoadImage } = useSliderImagePreload({
  itemWidth: 192,
  itemGap: props.itemGap,
  preloadBuffer: 2,
});

const getItemStyle = (index: number): CSSProperties => ({
  marginRight: index < (props.items?.length ?? 0) - 1 ? `${props.itemGap}px` : '0px',
});
</script>
