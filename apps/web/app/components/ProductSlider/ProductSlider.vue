<template>
  <div
    ref="sliderRootRef"
    class="product-slider w-full"
    :class="{ 'product-slider--fixed-items': visibleItems !== undefined }"
    :style="sliderStyle"
  >
    <SfScrollable
      buttons-placement="floating"
      class="w-full pb-4 scrollbar-hidden"
      :wrapper-class="wrapperClass"
      data-testid="product-slider"
      @on-prev="handleScrollableNavigation('prev', $event)"
      @on-next="handleScrollableNavigation('next', $event)"
    >
      <template #previousButton="{ onClick, disabled }">
        <button
          type="button"
          class="product-slider__nav product-slider__nav--prev"
          :disabled="disabled"
          aria-label="Previous"
          data-testid="product-slider-prev"
          @click="onClick"
        >
          <SfIconChevronLeft class="product-slider__nav-icon" />
        </button>
      </template>

      <UiProductCard
        v-for="(product, index) in items"
        :key="productGetters.getId(product)"
        :product="product"
        :should-load-image="shouldLoadImage(index)"
        :index="index"
        is-from-slider
        :class="['product-slider__item w-44 max-w-44 shrink-0 sm:w-48 sm:max-w-48 xl:w-56 xl:max-w-56', cardClass]"
      />

      <template #nextButton="{ onClick, disabled }">
        <button
          type="button"
          class="product-slider__nav product-slider__nav--next"
          :disabled="disabled"
          aria-label="Next"
          data-testid="product-slider-next"
          @click="onClick"
        >
          <SfIconChevronRight class="product-slider__nav-icon" />
        </button>
      </template>
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
import { SfIconChevronLeft, SfIconChevronRight, SfScrollable, SfLink } from '@storefront-ui/vue';
import type { CSSProperties } from 'vue';
import type { ProductSliderProps } from '~/components/ProductSlider/types';
import { paths } from '~/utils/paths';

type ScrollableNavigationEvent = {
  preventDefault: () => void;
};

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

const sliderStyle = computed<CSSProperties>(
  () =>
    ({
      '--product-slider-gap': `${props.itemGap}px`,
      '--product-slider-item-width':
        visibleItems.value !== undefined
          ? `calc((100% - (${visibleItems.value - 1} * ${props.itemGap}px)) / ${visibleItems.value})`
          : undefined,
    }) as CSSProperties,
);

const resolveScrollContainer = () =>
  sliderRootRef.value?.querySelector<HTMLElement>('[data-testid="product-slider"]') ?? null;

const getScrollContainerGap = (scrollContainer: HTMLElement) => {
  const styles = window.getComputedStyle(scrollContainer);
  return Number.parseFloat(styles.columnGap || styles.gap || '0') || props.itemGap;
};

const getScrollableStep = (scrollContainer: HTMLElement) => {
  const firstItem = scrollContainer.querySelector<HTMLElement>('.product-slider__item');
  if (!firstItem) return scrollContainer.clientWidth;

  const gap = getScrollContainerGap(scrollContainer);
  const itemWidth = firstItem.getBoundingClientRect().width;
  const itemFullWidth = itemWidth + gap;
  const itemsPerStep =
    visibleItems.value ?? Math.max(1, Math.round((scrollContainer.clientWidth + gap) / itemFullWidth));

  return itemsPerStep * itemFullWidth;
};

const handleScrollableNavigation = (direction: 'prev' | 'next', event: ScrollableNavigationEvent) => {
  const scrollContainer = resolveScrollContainer();
  if (!scrollContainer) return;

  event.preventDefault();

  const firstItem = scrollContainer.querySelector<HTMLElement>('.product-slider__item');
  const gap = getScrollContainerGap(scrollContainer);
  const itemFullWidth = firstItem ? firstItem.getBoundingClientRect().width + gap : getScrollableStep(scrollContainer);
  const currentIndex = Math.round(scrollContainer.scrollLeft / itemFullWidth);
  const stepIndex = Math.max(1, Math.round(getScrollableStep(scrollContainer) / itemFullWidth));
  const targetIndex = direction === 'next' ? currentIndex + stepIndex : currentIndex - stepIndex;
  const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;

  scrollContainer.scrollTo({
    left: Math.min(Math.max(targetIndex * itemFullWidth, 0), maxScrollLeft),
    behavior: 'smooth',
  });
};
</script>

<style scoped>
.product-slider :deep([data-testid='product-slider']) {
  gap: var(--product-slider-gap, 16px);
}

.product-slider--fixed-items :deep(.product-slider__item) {
  width: var(--product-slider-item-width);
  max-width: var(--product-slider-item-width);
  flex-basis: var(--product-slider-item-width);
}

.product-slider__nav {
  position: absolute;
  top: 50%;
  z-index: 10;
  display: none;
  width: 32px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  box-shadow: none;
  cursor: pointer;
  transform: translateY(-50%);
}

.product-slider__nav:hover,
.product-slider__nav:focus-visible {
  background: rgba(0, 0, 0, 0.72);
}

.product-slider__nav:focus-visible {
  outline: 2px solid var(--ci-accent);
  outline-offset: 2px;
}

.product-slider__nav:disabled {
  display: none;
}

.product-slider__nav--prev {
  left: -22px;
}

.product-slider__nav--next {
  right: -22px;
}

.product-slider__nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2.5;
}

@media (min-width: 768px) {
  .product-slider__nav:not(:disabled) {
    display: flex;
  }
}
</style>
