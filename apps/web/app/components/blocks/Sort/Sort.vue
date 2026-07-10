<template>
  <section
    data-testid="category-sort"
    aria-label="Sort products"
    :style="layoutStyle"
    :class="
      useSelectionModeCompact
        ? 'relative z-20 flex flex-wrap items-center gap-4 p-[10px] mb-0 md:-ml-[150px] md:w-[calc(100%+438px)]'
        : ''
    "
  >
    <span
      v-if="useSelectionModeCompact"
      class="mr-auto whitespace-nowrap text-sm font-medium text-neutral-700"
      data-testid="category-total-products"
    >
      {{ totalProducts }} {{ t('common.labels.products') }}
    </span>
    <CategorySorting
      :key="useSelectionModeCompact ? 'ph' : 'no-ph'"
      :selection-mode-compact="useSelectionModeCompact"
      :class="useSelectionModeCompact ? 'w-[260px] shrink-0' : 'mb-4'"
    />
  </section>
</template>

<script setup lang="ts">
import type { SortContent } from '~/components/blocks/Sort/types';

const props = defineProps<{ content: SortContent }>();
const { data: productsCatalog } = useProducts();
const useSelectionModeCompact = computed(() => props.content.settings?.selectionModeCompact ?? false);
const totalProducts = computed(() => Number(productsCatalog.value.pagination?.totals) || 0);

const layoutStyle = computed(() => {
  const layout = props.content.layout ?? {};
  return {
    paddingTop: `${layout.paddingTop ?? 0}px`,
    paddingBottom: `${layout.paddingBottom ?? 0}px`,
    paddingLeft: `${layout.paddingLeft ?? 0}px`,
    paddingRight: `${layout.paddingRight ?? 0}px`,
  };
});
</script>

<style scoped>
@media (max-width: 767px) {
  [data-testid='category-sort'] {
    width: 100% !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  [data-testid='category-total-products'] {
    width: 100%;
    margin-right: 0 !important;
    text-align: left;
  }

  [data-testid='category-sort'] :deep([data-testid='category-sorting']),
  [data-testid='category-sort'] :deep(.category-sorting--compact) {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 auto !important;
  }
}
</style>
