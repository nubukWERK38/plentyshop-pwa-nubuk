<template>
  <NarrowContainer v-if="breadcrumbs.length" class="px-4 md:px-0" data-testid="breadcrumbs-widget">
    <UiBreadcrumbs :breadcrumbs="breadcrumbs" />
  </NarrowContainer>
</template>

<script setup lang="ts">
import { categoryGetters, categoryTreeGetters } from '@plentymarkets/shop-api';

const { data: productsCatalog } = useProducts();
const { data: categoryTree } = useCategoryTree();

const breadcrumbs = computed(() => {
  if (!productsCatalog.value.category) {
    return [];
  }

  const categoryBreadcrumbs = categoryTreeGetters.generateBreadcrumbFromCategory(
    categoryTree.value,
    categoryGetters.getId(productsCatalog.value.category),
  );

  categoryBreadcrumbs.unshift({ name: t('common.labels.home'), link: '/' });
  return categoryBreadcrumbs;
});
</script>
