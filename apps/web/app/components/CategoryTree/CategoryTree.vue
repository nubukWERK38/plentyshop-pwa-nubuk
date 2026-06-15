<template>
  <div
    v-if="parent || (categoryTreeItem && categoryTreeGetters.getItems(categoryTreeItem)?.length)"
    class="category-tree mt-4"
  >
    <div
      class="border-b border-neutral-900 pb-4 text-lg font-bold text-neutral-900 select-none"
      data-testid="category-tree"
    >
      {{ t('common.labels.categories') }}
    </div>

    <ul v-if="categoryTreeItem" class="mb-4" data-testid="categories">
      <CategoryTreeItem
        :name="categoryTreeGetters.getName(categoryTreeItem)"
        :href="localePath(buildCategoryMenuLink(categoryTreeItem, categoryTree))"
        :has-children="hasChildren(categoryTreeItem)"
      />
      <CategoryTreeItem
        v-for="(categoryItem, index) in categoryTreeGetters.getItems(categoryTreeItem)"
        :key="index"
        :name="categoryTreeGetters.getName(categoryItem)"
        :href="localePath(buildCategoryMenuLink(categoryItem, categoryTree))"
        :has-children="hasChildren(categoryItem)"
        nested
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { type CategoryTreeItem, categoryGetters, categoryTreeGetters } from '@plentymarkets/shop-api';
import type { CategoryTreeProps } from '~/components/CategoryTree/types';

const props = defineProps<CategoryTreeProps>();

const { data: categoryTree } = useCategoryTree();
const { buildCategoryMenuLink } = useLocalization();

const localePath = useLocalePath();
const categoryTreeItem = computed(() =>
  categoryTreeGetters.findCategoryById(categoryTree.value, categoryGetters.getId(props.category)),
);
const parent = computed(() =>
  categoryTreeGetters.findCategoryById(categoryTree.value, categoryGetters.getParentId(props.category)),
);
const hasChildren = (category: CategoryTreeItem) => Boolean(categoryTreeGetters.getItems(category)?.length);
</script>
