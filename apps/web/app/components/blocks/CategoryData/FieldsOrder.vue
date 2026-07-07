<template>
  <template v-for="key in renderOrder" :key="key">
    <template v-if="fields?.[key]">
      <template v-if="key === 'name' && texts.name">
        <h1 id="category-headline" class="font-bold" data-testid="category-name">
          {{ texts.name }}
        </h1>

        <ul
          v-if="showSubcategories && subcategories.length"
          ref="subcategoryListRef"
          class="category-data-link-list mt-4"
          data-testid="category-subcategories"
          id="category-subcategories"
        >
          <li
            v-for="(subcategory, index) in visibleSubcategories"
            :id="`category-subcategory-item-${index}`"
            :key="`${subcategory.name}-${index}`"
            :class="`category-subcategory-item category-subcategory-item--${index}`"
            data-testid="category-subcategory-item"
          >
            <NuxtLink :to="subcategory.link" class="category-data-link category-data-link--subcategory">
              {{ subcategory.name }}
            </NuxtLink>
          </li>
          <li
            v-if="hasHiddenSubcategories"
            class="category-subcategory-item category-subcategory-item--ellipsis"
            data-testid="category-subcategories-ellipsis"
          >
            <span class="category-data-link category-data-link--subcategory">...</span>
          </li>
        </ul>

        <ul v-if="showBrands && brands.length" class="category-data-link-list mt-8" data-testid="category-brands">
          <li
            v-for="(brand, index) in brands"
            :id="`category-brand-item-${index}`"
            :key="`${brand.name}-${index}`"
            data-testid="category-brand-item"
          >
            <NuxtLink :to="brand.link" class="category-data-link category-data-link--brand">
              {{ brand.name }}
            </NuxtLink>
          </li>
        </ul>
      </template>

      <div
        v-else-if="key === 'description1' && texts.description1"
        class="no-preflight"
        data-testid="category-description-1"
        v-html="texts.description1"
      />

      <div
        v-else-if="key === 'description2' && texts.description2"
        class="no-preflight"
        data-testid="category-description-2"
        v-html="texts.description2"
      />

      <div
        v-else-if="key === 'shortDescription' && texts.shortDescription"
        class="no-preflight"
        data-testid="category-short-description"
        v-html="texts.shortDescription"
      />
    </template>
  </template>
</template>

<script setup lang="ts">
import type {
  CategoryDataFieldKey,
  CategoryDataFieldsVisibility,
  CategoryData,
  CategoryDataLinkItem,
  CategoryDataSubcategory,
} from '~/components/blocks/CategoryData/types';

const props = defineProps<{
  fields: CategoryDataFieldsVisibility;
  fieldsOrder: CategoryDataFieldKey[];
  texts: CategoryData;
  showSubcategories: boolean;
  subcategories: CategoryDataSubcategory[];
  showBrands: boolean;
  brands: CategoryDataLinkItem[];
  maxSubcategoryRows?: number;
}>();

const renderOrder = computed<CategoryDataFieldKey[]>(() =>
  props.fieldsOrder?.length
    ? props.fieldsOrder
    : (['name', 'description1', 'description2', 'shortDescription'] as CategoryDataFieldKey[]),
);

const subcategoryListRef = ref<HTMLElement | null>(null);
const visibleSubcategoryCount = ref(props.subcategories.length);
const hasSubcategoryRowLimit = computed(() => Number.isFinite(props.maxSubcategoryRows) && props.maxSubcategoryRows);

const visibleSubcategories = computed(() => {
  if (!hasSubcategoryRowLimit.value) return props.subcategories;
  return props.subcategories.slice(0, visibleSubcategoryCount.value);
});

const hasHiddenSubcategories = computed(
  () => Boolean(hasSubcategoryRowLimit.value) && visibleSubcategoryCount.value < props.subcategories.length,
);

const getRowIndex = (item: HTMLElement, firstRowTop: number) => {
  const rowTops = Array.from(subcategoryListRef.value?.querySelectorAll<HTMLElement>('[data-subcategory-row]') ?? [])
    .map((element) => Math.round(element.offsetTop - firstRowTop))
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((a, b) => a - b);

  const itemTop = Math.round(item.offsetTop - firstRowTop);
  return rowTops.indexOf(itemTop);
};

const reduceUntilEllipsisFits = async (firstRowTop: number, maxRows: number) => {
  await nextTick();

  const ellipsis = subcategoryListRef.value?.querySelector<HTMLElement>(
    '[data-testid="category-subcategories-ellipsis"]',
  );
  if (!ellipsis) return;

  while (visibleSubcategoryCount.value > 0 && getRowIndex(ellipsis, firstRowTop) >= maxRows) {
    visibleSubcategoryCount.value -= 1;
    await nextTick();
  }
};

const updateVisibleSubcategories = async () => {
  if (!hasSubcategoryRowLimit.value) {
    visibleSubcategoryCount.value = props.subcategories.length;
    return;
  }

  visibleSubcategoryCount.value = props.subcategories.length;
  await nextTick();

  const list = subcategoryListRef.value;
  const items = Array.from(list?.querySelectorAll<HTMLElement>('[data-testid="category-subcategory-item"]') ?? []);
  const firstItem = items[0];
  const maxRows = props.maxSubcategoryRows ?? 0;

  if (!list || !firstItem || maxRows <= 0) return;

  items.forEach((item) => item.setAttribute('data-subcategory-row', ''));

  const firstRowTop = firstItem.offsetTop;
  const firstOverflowIndex = items.findIndex((item) => getRowIndex(item, firstRowTop) >= maxRows);

  if (firstOverflowIndex === -1) {
    visibleSubcategoryCount.value = props.subcategories.length;
    return;
  }

  visibleSubcategoryCount.value = Math.max(firstOverflowIndex - 1, 0);
  await reduceUntilEllipsisFits(firstRowTop, maxRows);
};

watch(
  () => [props.subcategories.length, props.maxSubcategoryRows],
  () => {
    void updateVisibleSubcategories();
  },
  { flush: 'post' },
);

onMounted(() => {
  void updateVisibleSubcategories();
  window.addEventListener('resize', updateVisibleSubcategories);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateVisibleSubcategories);
});
</script>

<style scoped>
.category-data-link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin-left: 0;
  padding-left: 0;
}

.category-data-link {
  display: inline-flex;
  align-items: center;
  background: rgb(10 17 18 / 92%);
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.0625rem 0.375rem;
  text-transform: uppercase;
  text-decoration: none;
}

.category-data-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.125rem;
}

.category-data-link--subcategory {
  color: #c8ff00;
}

.category-data-link--brand {
  color: #fff;
}
</style>
