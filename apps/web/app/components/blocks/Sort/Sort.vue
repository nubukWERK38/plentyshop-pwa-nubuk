<template>
  <section
    data-testid="category-sort"
    aria-label="Sort products"
    :style="layoutStyle"
    :class="
      useSelectionModeCompact
        ? 'relative z-20 flex flex-wrap items-center justify-between gap-3 p-[10px] mb-4 md:-ml-[150px] md:w-[calc(100%+438px)]'
        : ''
    "
  >
    <CategorySorting
      :key="useSelectionModeCompact ? 'ph' : 'no-ph'"
      :selection-mode-compact="useSelectionModeCompact"
      :class="useSelectionModeCompact ? '' : 'mb-4'"
    />
  </section>
</template>

<script setup lang="ts">
import type { SortContent } from '~/components/blocks/Sort/types';

const props = defineProps<{ content: SortContent }>();
const useSelectionModeCompact = computed(() => props.content.settings?.selectionModeCompact ?? false);

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
