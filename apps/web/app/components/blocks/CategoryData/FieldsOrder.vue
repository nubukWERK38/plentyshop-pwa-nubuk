<template>
  <template v-for="key in renderOrder" :key="key">
    <template v-if="fields?.[key]">
      <template v-if="key === 'name' && texts.name">
        <h1
          id="category-headline"
          class="font-bold"
          data-testid="category-name"
        >
          {{ texts.name }}
        </h1>

        <ul
          v-if="showSubcategories && subcategories.length"
          class="mt-3 ml-5 list-disc"
          data-testid="category-subcategories"
          id="category-subcategories"
        >
          <li
            v-for="(subcategory, index) in subcategories"
            :id="`category-subcategory-item-${index}`"
            :key="`${subcategory}-${index}`"
            :class="`category-subcategory-item category-subcategory-item--${index}`"
            data-testid="category-subcategory-item"
          >
            {{ subcategory }}
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
} from '~/components/blocks/CategoryData/types';

const props = defineProps<{
  fields: CategoryDataFieldsVisibility;
  fieldsOrder: CategoryDataFieldKey[];
  texts: CategoryData;
  showSubcategories: boolean;
  subcategories: string[];
}>();

const renderOrder = computed<CategoryDataFieldKey[]>(() =>
  props.fieldsOrder?.length
    ? props.fieldsOrder
    : (['name', 'description1', 'description2', 'shortDescription'] as CategoryDataFieldKey[]),
);
</script>
