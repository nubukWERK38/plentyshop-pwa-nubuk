<template>
  <section
    data-testid="category-sort"
    aria-label="Sort products"
    :style="layoutStyle"
    :class="
      useSelectionModeCompact
        ? 'relative z-20 flex flex-wrap items-center justify-between gap-4 mb-4'
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
      :class="useSelectionModeCompact ? 'w-full sm:w-[260px] shrink-0' : 'mb-4'"
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
