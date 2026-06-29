<template>
  <section
    data-testid="category-sort"
    aria-label="Sort products"
    :style="layoutStyle"
    :class="useSelectionModeCompact ? 'flex flex-wrap items-center justify-between gap-3 mb-4' : ''"
  >
    <span
      v-if="useSelectionModeCompact && totalProducts > 0"
      class="text-sm font-normal leading-6 text-neutral-700 whitespace-nowrap"
      data-testid="category-toolbar-item-count"
    >
      {{
        t('search.numberOfProducts', {
          count: productsCount,
          total: totalProducts,
        })
      }}
    </span>
    <CategorySorting
      :key="useSelectionModeCompact ? 'ph' : 'no-ph'"
      :selection-mode-compact="useSelectionModeCompact"
      :class="useSelectionModeCompact ? 'w-auto' : 'mb-4'"
    />
  </section>
</template>

<script setup lang="ts">
import type { SortContent } from '~/components/blocks/Sort/types';

const props = defineProps<{ content: SortContent }>();
const { data: productsCatalog } = useProducts();
const useSelectionModeCompact = computed(() => props.content.settings?.selectionModeCompact ?? false);
const productsCount = computed(() => productsCatalog.value?.products?.length ?? 0);
const totalProducts = computed(() => Number(productsCatalog.value?.pagination?.totals) || 0);
const categoryToolbarShowsItemCount = useState<boolean>('category-toolbar-shows-item-count', () => false);

watchEffect(() => {
  categoryToolbarShowsItemCount.value = useSelectionModeCompact.value;
});

onUnmounted(() => {
  if (useSelectionModeCompact.value) categoryToolbarShowsItemCount.value = false;
});

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
