<template>
  <div v-if="visibleCategoryItems.length" class="category-tree mt-4">
    <div
      class="border-b border-neutral-900 pb-4 text-lg font-bold text-neutral-900 select-none"
      data-testid="category-tree"
    >
      {{ t('common.labels.categories') }}
    </div>

    <ul class="mb-4" data-testid="categories">
      <CategoryTreeItem
        v-for="(categoryItem, index) in visibleCategoryItems"
        :key="index"
        :name="categoryTreeGetters.getName(categoryItem)"
        :href="localePath(buildCategoryMenuLink(categoryItem, categoryTree))"
        :has-children="hasChildren(categoryItem)"
        :nested="categoryItem.id !== visibleRootId"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  type CategoryTreeItem as ApiCategoryTreeItem,
  categoryGetters,
  categoryTreeGetters,
} from '@plentymarkets/shop-api';
import type { CategoryTreeProps } from '~/components/CategoryTree/types';

const hiddenRootCategoryName = 'Produkte Neuer Shop';
const props = defineProps<CategoryTreeProps>();

const { data: categoryTree } = useCategoryTree();
const { buildCategoryMenuLink } = useLocalization();

const localePath = useLocalePath();
const getParentCategoryId = () => {
  const categoryWithParent = props.category as typeof props.category & {
    parentCategoryId?: number | string | null;
    parentCategoryID?: number | string | null;
    parentId?: number | string | null;
  };

  return Number(
    categoryGetters.getParentId(props.category) ||
      categoryWithParent.parentCategoryId ||
      categoryWithParent.parentCategoryID ||
      categoryWithParent.parentId ||
      0,
  );
};
const categoryTreeItem = computed(
  () => categoryTreeGetters.findCategoryById(categoryTree.value, categoryGetters.getId(props.category)) ?? undefined,
);
const parent = computed(
  () => categoryTreeGetters.findCategoryById(categoryTree.value, getParentCategoryId()) ?? undefined,
);
const isHiddenRootCategory = (category?: ApiCategoryTreeItem) =>
  Boolean(category && categoryTreeGetters.getName(category) === hiddenRootCategoryName);
const visibleRoot = computed(() => {
  if (!categoryTreeItem.value && !parent.value) return undefined;
  if (isHiddenRootCategory(categoryTreeItem.value)) return undefined;
  if (parent.value && !isHiddenRootCategory(parent.value)) return parent.value;
  return categoryTreeItem.value ?? parent.value;
});
const visibleRootId = computed(() => visibleRoot.value?.id);
const visibleCategoryItems = computed(() => {
  const currentCategoryTreeItem = categoryTreeItem.value;
  if (currentCategoryTreeItem && isHiddenRootCategory(currentCategoryTreeItem)) {
    return categoryTreeGetters.getItems(currentCategoryTreeItem) ?? [];
  }

  if (!visibleRoot.value) return [];

  return [visibleRoot.value, ...(categoryTreeGetters.getItems(visibleRoot.value) ?? [])];
});
const hasChildren = (category: ApiCategoryTreeItem) => Boolean(categoryTreeGetters.getItems(category)?.length);
</script>
