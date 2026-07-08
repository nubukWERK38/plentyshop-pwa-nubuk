<template>
  <section
    data-testid="category-per-page"
    aria-label="Show products per page"
    :style="layoutStyle"
    :class="useSelectionModeCompact ? 'relative z-10 flex justify-end mb-0 pointer-events-none' : ''"
  >
    <CategoryItemsPerPage
      :key="useSelectionModeCompact ? 'ph' : 'no-ph'"
      :class="useSelectionModeCompact ? 'w-[160px] shrink-0 pointer-events-auto' : 'mb-6'"
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

<style scoped>
@media (max-width: 767px) {
  [data-testid='category-per-page'] {
    width: 100% !important;
    justify-content: stretch !important;
    padding-right: 0 !important;
    padding-left: 0 !important;
    pointer-events: auto !important;
  }

  [data-testid='category-per-page'] :deep([data-testid='category-items-per-page']),
  [data-testid='category-per-page'] :deep(.category-items-per-page--compact) {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 auto !important;
  }
}
</style>
