<template>
  <section
    data-testid="category-per-page"
    aria-label="Show products per page"
    :style="layoutStyle"
    :class="useSelectionModeCompact ? 'relative z-10 flex justify-end mb-4' : ''"
  >
    <CategoryItemsPerPage
      :key="useSelectionModeCompact ? 'ph' : 'no-ph'"
      :class="useSelectionModeCompact ? 'w-full sm:w-[160px] shrink-0' : 'mb-6'"
      :selection-mode-compact="useSelectionModeCompact"
      :total-products="productsCatalog.pagination?.totals ?? 0"
    />
  </section>
</template>
<script setup lang="ts">
import type { PerPageContent } from '~/components/blocks/PerPageFilter/types';

const { data: productsCatalog } = useProducts();
const props = defineProps<{ content: PerPageContent }>();
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
