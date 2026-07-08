<template>
  <div v-if="showSortAndFilter" data-testid="category-sort-filter">
    <CategorySidebar class="sidebar w-full" :is-open="isOpen" @close="close">
      <div class="h2 mb-2 border-b border-neutral-900 pb-4 text-lg font-bold text-neutral-900">
        {{ t('common.labels.filters') }}
      </div>

      <template v-for="key in orderedFilterKeys" :key="key">
        <template v-if="key === 'category' && categoryTreeEnabled">
          <CategoryTree v-if="productsCatalog.category" :category="productsCatalog.category" />
        </template>

        <template v-if="key === 'sortBy' && props.content?.fields.sortBy">
          <CategorySorting class="mb-6" />
        </template>

        <template v-if="key === 'perPage' && props.content?.fields.perPage">
          <CategoryItemsPerPage class="mb-6" :total-products="productsCatalog.pagination?.totals ?? 0" />
        </template>

        <template v-if="key === 'itemRating' && props.content?.fields.itemRating">
          <CategoryFiltersSort
            v-if="productsCatalog.facets && facetGetters.hasFilters(productsCatalog.facets)"
            :facets="productsCatalog.facets"
            :configuration="content"
            :render-key="key"
          />
        </template>

        <template v-if="key === 'manufacturer' && props.content?.fields.manufacturer">
          <CategoryFiltersSort
            v-if="productsCatalog.facets && facetGetters.hasFilters(productsCatalog.facets)"
            :facets="productsCatalog.facets"
            :configuration="content"
            :render-key="key"
          />
        </template>

        <template v-if="key === 'price' && props.content?.fields.price">
          <CategoryFiltersSort
            v-if="productsCatalog.facets && facetGetters.hasFilters(productsCatalog.facets)"
            :facets="productsCatalog.facets"
            :configuration="content"
            :render-key="key"
          />
        </template>

        <template v-if="key === 'availability' && props.content?.fields.availability">
          <CategoryFiltersSort
            v-if="productsCatalog.facets && facetGetters.hasFilters(productsCatalog.facets)"
            :facets="productsCatalog.facets"
            :configuration="content"
            :render-key="key"
          />
        </template>

        <template v-if="key === 'customizedFilters' && props.content?.fields.customizedFilters">
          <CategoryFiltersSort
            v-if="productsCatalog.facets && facetGetters.hasFilters(productsCatalog.facets)"
            :facets="productsCatalog.facets"
            :configuration="content"
            :render-key="key"
            :show-all="showAllFiltersImmediately"
            :limit="numberOfFiltersToShowInitially"
          />
        </template>
      </template>
    </CategorySidebar>

    <UiButton variant="tertiary" class="sort-filter__mobile-toggle md:hidden whitespace-nowrap" @click="open">
      <template #prefix>
        <SfIconTune />
      </template>
      {{ t('common.labels.listSettings') }}
    </UiButton>
  </div>

  <template v-else>
    <h2 v-if="clientPreview" class="text-center">{{ getEditorTranslation('no-sorting-or-filter-text') }}</h2>
  </template>
</template>

<script setup lang="ts">
import { facetGetters } from '@plentymarkets/shop-api';
import type { SortFilterProps, SortFilterFieldsVisibility, SortFilterFieldKey } from './types';
import { SfIconTune, useDisclosure } from '@storefront-ui/vue';

const { data: productsCatalog } = useProducts();

const props = defineProps<SortFilterProps>();

const showSortAndFilter = ref(false);
const { isOpen, open, close } = useDisclosure();
const { t } = useI18n({ useScope: 'global' });

const { isInEditorClient } = useEditorState();
const clientPreview = computed(() => isInEditorClient.value);

const showAllFiltersImmediately = computed(() => props.content?.showAllFiltersImmediately ?? true);
const numberOfFiltersToShowInitially = computed(() => props.content?.numberOfFiltersToShowInitially ?? 0);
const preferredFilterOrder: SortFilterFieldKey[] = ['manufacturer', 'price', 'availability', 'customizedFilters'];
const categoryTreeEnabled = computed(() => props.content?.fields.category !== false);
const orderedFilterKeys = computed(() => {
  const configuredOrder = props.content?.filtersOrder ?? [];
  const preferredKeys = preferredFilterOrder.filter((key) => configuredOrder.includes(key));
  const categoryKey = categoryTreeEnabled.value ? ['category'] : [];
  const remainingKeys = configuredOrder.filter((key) => !preferredFilterOrder.includes(key) && key !== 'category');

  return [...preferredKeys, ...categoryKey, ...remainingKeys];
});

watch(
  () => props.content?.fields,
  (newValue) => {
    showSortAndFilter.value =
      categoryTreeEnabled.value || (!!newValue && Object.values(newValue as SortFilterFieldsVisibility).some(Boolean));
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
@media (max-width: 767px) {
  [data-testid='category-sort-filter'] {
    width: 100%;
    padding-right: 0;
    padding-left: 0;
  }

  .sort-filter__mobile-toggle {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "no-sorting-or-filter-text": "You do not have any sorting or filter options enabled"
  },
  "de": {
    "no-sorting-or-filter-text": "You do not have any sorting or filter options enabled"
  }
}
</i18n>
