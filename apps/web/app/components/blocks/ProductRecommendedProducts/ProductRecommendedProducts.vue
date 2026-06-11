<template>
  <section ref="blockRef" class="product-recommended-products w-screen" :style="sectionStyle">
    <div v-bind="$attrs" :style="blockStyle" class="w-full">
      <TextContent data-testid="recommended-block" class="pb-4" :text="props.content.text" :index="props.index" />

      <div v-if="tabsEnabled" class="product-recommended-products__tabs" data-testid="recommended-source-tabs">
        <button
          v-for="(tab, tabIndex) in tabs"
          :key="`${tab.label}-${tabIndex}`"
          type="button"
          class="product-recommended-products__tab"
          :class="{ 'product-recommended-products__tab--active': activeTabIndex === tabIndex }"
          :aria-pressed="activeTabIndex === tabIndex"
          @click="activeTabIndex = tabIndex"
        >
          {{ tab.label || getDefaultTabLabel(tabIndex) }}
        </button>
      </div>

      <ProductSlider
        v-if="shouldShowSlider"
        :items="recommendedProducts"
        :item-gap="layoutSettings.gap"
        :visible-items="layoutSettings.visibleItems"
        wrapper-class="w-full"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  ProductRecommendedProductsGradient,
  ProductRecommendedProductsProps,
  ProductRecommendedProductsSource,
  ProductRecommendedProductsTab,
} from './types';
import { productGetters } from '@plentymarkets/shop-api';
import type { CSSProperties } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ProductRecommendedProductsProps>(), { shouldLoad: undefined });

const { locale } = useI18n();
const { data: categoryTree } = useCategoryTree();
const { currentProduct } = useProducts();
const blockRef = ref<HTMLElement | null>(null);
const { isNearViewport } = useNearViewport(blockRef, {
  rootMargin: '200px 0px 200px 0px',
  once: true,
});
const firstCategoryId = categoryTree.value?.find((category) => category.type === 'item')?.id || '';
const categoryId = productGetters.getCategoryIds(currentProduct.value)[0] ?? '';

const shouldRenderAfterUpdate = ref(false);
const activeTabIndex = ref(0);

const ensureGradient = (gradient?: ProductRecommendedProductsGradient) => ({
  enabled: gradient?.enabled === true,
  type: gradient?.type ?? 'linear',
  startColor: gradient?.startColor ?? '#ffffff',
  endColor: gradient?.endColor ?? '#e2e8f0',
  angle: gradient?.angle ?? 180,
  radius: gradient?.radius ?? 100,
  startX: gradient?.startX ?? 50,
  startY: gradient?.startY ?? 50,
});

const gradientToCss = (gradient: ReturnType<typeof ensureGradient>) => {
  if (!gradient.enabled) return undefined;
  if (gradient.type === 'radial') {
    return `radial-gradient(circle ${gradient.radius}% at ${gradient.startX}% ${gradient.startY}%, ${gradient.startColor}, ${gradient.endColor})`;
  }
  return `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
};

const layoutSettings = computed(() => ({
  gap: props.content.layout?.gap ?? 16,
  marginLeft: props.content.layout?.marginLeft ?? 0,
  marginRight: props.content.layout?.marginRight ?? 0,
  backgroundColor: props.content.layout?.backgroundColor ?? 'transparent',
  gradient: ensureGradient(props.content.layout?.gradient),
  visibleItems: props.content.layout?.visibleItems,
}));

const sectionStyle = computed<CSSProperties>(() => ({
  background: gradientToCss(layoutSettings.value.gradient),
  backgroundColor: layoutSettings.value.gradient.enabled ? undefined : layoutSettings.value.backgroundColor,
}));

const blockStyle = computed<CSSProperties>(() => ({
  marginLeft: `${layoutSettings.value.marginLeft}px`,
  marginRight: `${layoutSettings.value.marginRight}px`,
}));

const { data: recommendedProducts, fetchProductRecommended } = useProductRecommended(props.meta.uuid);

const shouldShowSlider = computed(
  () =>
    isNearViewport.value &&
    !!recommendedProducts.value?.length &&
    (shouldRender.value || shouldRenderAfterUpdate.value),
);
const sourceWithDefaults = (source?: Partial<ProductRecommendedProductsSource>): ProductRecommendedProductsSource => ({
  type: source?.type ?? 'category',
  categoryId: source?.categoryId ?? '',
  itemId: source?.itemId ?? '',
  crossSellingRelation: source?.crossSellingRelation ?? 'Similar',
});
const tabs = computed<ProductRecommendedProductsTab[]>(() => props.content.tabs?.items ?? []);
const tabsEnabled = computed(() => props.content.tabs?.enabled === true && tabs.value.length > 0);
const activeSource = computed(() => {
  if (!tabsEnabled.value) return sourceWithDefaults(props.content.source);
  return sourceWithDefaults(tabs.value[activeTabIndex.value]?.source);
});
const activeItemId = computed(() =>
  Object.keys(currentProduct.value).length ? productGetters.getItemId(currentProduct.value) : activeSource.value.itemId,
);
const isCategory = computed(() => activeSource.value.type === 'category');
const isProduct = computed(() => activeSource.value.type === 'cross_selling' && activeItemId.value);
const shouldRender = computed(() => props.shouldLoad === undefined || props.shouldLoad === true);
const shouldFetch = computed(() => {
  return isNearViewport.value && shouldRender.value && (isCategory.value || isProduct.value);
});
const contentSource = computed(() => ({
  ...activeSource.value,
  categoryId: activeSource.value.categoryId || (categoryId || firstCategoryId || '').toString(),
  itemId: activeItemId.value,
}));

const getDefaultTabLabel = (tabIndex: number) => `Tab ${tabIndex + 1}`;

watch(
  shouldFetch,
  (visible) => {
    if (visible) {
      fetchProductRecommended(contentSource.value);
      shouldRenderAfterUpdate.value = true;
    }
  },
  { immediate: true },
);

watch(
  [
    () => activeSource.value.categoryId,
    () => activeSource.value.itemId,
    () => activeSource.value.type,
    () => activeSource.value.crossSellingRelation,
    () => activeTabIndex.value,
    () => locale.value,
  ],
  () => {
    if (
      shouldFetch.value &&
      ((activeItemId.value && activeSource.value.type === 'cross_selling') ||
        (contentSource.value.categoryId && activeSource.value.type === 'category'))
    ) {
      fetchProductRecommended(contentSource.value);
    }
    shouldRenderAfterUpdate.value = true;
  },
);
</script>

<style scoped>
.product-recommended-products {
  margin-left: calc(50% - 50vw);
}

.product-recommended-products__tabs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.product-recommended-products__tab {
  min-width: 0;
  padding: 0.5rem 0 0.75rem;
  border-bottom: 2px solid currentColor;
  color: inherit;
  text-align: left;
  text-transform: uppercase;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background: transparent;
  opacity: 0.72;
}

.product-recommended-products__tab--active {
  opacity: 1;
  color: rgb(var(--colors-2-primary-500) / 1);
}

@media (max-width: 767px) {
  .product-recommended-products__tabs {
    grid-auto-columns: minmax(9rem, 1fr);
    overflow-x: auto;
  }
}
</style>
