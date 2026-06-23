<template>
  <div class="sticky h-[80vh] overflow-y-auto">
    <UiAccordionItem
      v-model="textsOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="open-recommended-products-form-texts"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('texts-label') }}</h2>
      </template>
      <EditorRichTextEditorForm
        v-if="recommendedBlock.text"
        :model-value="recommendedBlock.text.htmlDescription ?? ''"
        :text-align="recommendedBlock.text.textAlignment ?? 'left'"
        @update:model-value="recommendedBlock.text.htmlDescription = $event"
      />
    </UiAccordionItem>

    <UiAccordionItem
      v-model="sourceOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="open-recommended-products-form-source"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('source-label') }}</h2>
      </template>

      <template v-if="!tabsEnabled">
        <fieldset class="py-2">
        <legend class="text-sm font-medium text-black">
          {{ getEditorTranslation('source-type-label') }}
        </legend>

        <div class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden">
          <div
            class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm border-r"
            :class="{ 'bg-gray-100 text-gray-900 font-semibold': recommendedBlock.source.type === 'cross_selling' }"
            data-testid="recommended-form-source-product"
            @click="recommendedBlock.source.type = 'cross_selling'"
          >
            <SfIconCheck
              :class="{ invisible: recommendedBlock.source.type !== 'cross_selling' }"
              class="mr-1 w-[1.1rem]"
            />
            {{ getEditorTranslation('source-type-product') }}
          </div>

          <div
            class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm"
            :class="{ 'bg-gray-100 text-gray-900 font-semibold': recommendedBlock.source.type === 'category' }"
            data-testid="recommended-form-source-category"
            @click="selectCategoryTab()"
          >
            <SfIconCheck :class="{ invisible: recommendedBlock.source.type !== 'category' }" class="mr-1 w-[1.1rem]" />
            {{ getEditorTranslation('source-type-category') }}
          </div>
        </div>
      </fieldset>

        <div v-if="recommendedBlock.source.type === 'cross_selling'" class="py-4">
        <UiFormLabel>{{ getEditorTranslation('product-id-label') }}</UiFormLabel>
        <SfInput
          :model-value="recommendedBlock.source.itemId"
          data-testid="recommended-form-itemId"
          name="itemId"
          type="text"
          :placeholder="getEditorTranslation('product-id-placeholder')"
          :disabled="Object.keys(currentProduct).length > 0"
          :wrapper-class="{ '!bg-disabled-100 !ring-disabled-300 !ring-1': Object.keys(currentProduct).length > 0 }"
          @input="debouncedFn($event)"
        />

        <div class="py-4">
          <UiFormLabel>{{ getEditorTranslation('cross-selling-relation-label') }}</UiFormLabel>
          <Multiselect
            v-model="crossSellingModel"
            :options="crossSellingOptions"
            :allow-empty="false"
            :multiple="false"
            label="label"
            track-by="value"
            placeholder="Select relation"
            data-testid="recommended-form-cross-selling-relation"
            class="w-full"
          />
        </div>
      </div>

        <div v-else class="py-4">
        <UiFormLabel>{{ getEditorTranslation('categories-label') }}</UiFormLabel>

        <EditorCategorySelect
          v-model="categoryIdModel"
          :base-search-params="{ type: 'in:item', sortBy: 'position_asc,name_asc', with: 'details,clients' }"
          data-testid="recommended-form-categories"
        />
      </div>

      </template>

      <div class="space-y-4 border-t border-gray-200 py-4">
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('tabs-enabled-label') }}</UiFormLabel>
          <SfSwitch v-model="tabsEnabled" data-testid="recommended-form-tabs-enabled" />
        </div>

        <template v-if="tabsEnabled">
          <div
            v-for="(tab, tabIndex) in tabsItems"
            :key="tabIndex"
            class="space-y-3 rounded-md border border-gray-200 bg-white p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <UiFormLabel class="mb-1">{{ getEditorTranslation('tab-label-label') }}</UiFormLabel>
              <button type="button" class="text-sm text-red-600" @click="removeTab(tabIndex)">
                {{ getEditorTranslation('remove-tab-label') }}
              </button>
            </div>

            <SfInput v-model="tab.label" type="text" :placeholder="getEditorTranslation('tab-label-placeholder')" />

            <fieldset>
              <legend class="text-sm font-medium text-black">
                {{ getEditorTranslation('source-type-label') }}
              </legend>

              <div
                class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden"
              >
                <div
                  class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm border-r"
                  :class="{ 'bg-gray-100 text-gray-900 font-semibold': tab.source.type === 'cross_selling' }"
                  @click="tab.source.type = 'cross_selling'"
                >
                  <SfIconCheck :class="{ invisible: tab.source.type !== 'cross_selling' }" class="mr-1 w-[1.1rem]" />
                  {{ getEditorTranslation('source-type-product') }}
                </div>

                <div
                  class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm"
                  :class="{ 'bg-gray-100 text-gray-900 font-semibold': tab.source.type === 'category' }"
                  @click="tab.source.type = 'category'"
                >
                  <SfIconCheck :class="{ invisible: tab.source.type !== 'category' }" class="mr-1 w-[1.1rem]" />
                  {{ getEditorTranslation('source-type-category') }}
                </div>
              </div>
            </fieldset>

            <div v-if="tab.source.type === 'cross_selling'" class="space-y-3">
              <div>
                <UiFormLabel>{{ getEditorTranslation('product-id-label') }}</UiFormLabel>
                <SfInput
                  v-model="tab.source.itemId"
                  name="tabItemId"
                  type="text"
                  :placeholder="getEditorTranslation('product-id-placeholder')"
                  :disabled="Object.keys(currentProduct).length > 0"
                  :wrapper-class="{
                    '!bg-disabled-100 !ring-disabled-300 !ring-1': Object.keys(currentProduct).length > 0,
                  }"
                />
              </div>

              <div>
                <UiFormLabel>{{ getEditorTranslation('cross-selling-relation-label') }}</UiFormLabel>
                <select v-model="tab.source.crossSellingRelation" class="input-field">
                  <option v-for="option in crossSellingOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div v-else>
              <UiFormLabel>{{ getEditorTranslation('categories-label') }}</UiFormLabel>
              <EditorCategorySelect
                v-model="tab.source.categoryId"
                :base-search-params="{ type: 'in:item', sortBy: 'position_asc,name_asc', with: 'details,clients' }"
              />
            </div>
          </div>
        </template>

        <button type="button" class="input-field text-left" @click="addTab">
          {{ getEditorTranslation('add-tab-label') }}
        </button>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="layoutOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2 data-testid="slider-button-group-title">{{ getEditorTranslation('layout-label') }}</h2>
      </template>

      <div class="space-y-3 py-3">
        <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('background-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="layoutState.backgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput
                v-model="layoutState.backgroundColor"
                type="text"
                data-testid="recommended-form-background-color"
              >
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('gradient-enabled-label') }}</UiFormLabel>
          <SfSwitch v-model="layoutGradientState.enabled" data-testid="recommended-form-gradient-enabled" />
        </div>

        <template v-if="layoutGradientState.enabled">
          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-type-label') }}</UiFormLabel>
            <select v-model="layoutGradientState.type" class="input-field">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-start-label') }}</UiFormLabel>
            <EditorColorPicker v-model="layoutGradientState.startColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="layoutGradientState.startColor" type="text">
                  <template #suffix>
                    <button
                      type="button"
                      class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                      :style="{ backgroundColor: color }"
                      @mousedown.stop
                      @click.stop="toggle"
                    />
                  </template>
                </SfInput>
              </template>
            </EditorColorPicker>
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-end-label') }}</UiFormLabel>
            <EditorColorPicker v-model="layoutGradientState.endColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="layoutGradientState.endColor" type="text">
                  <template #suffix>
                    <button
                      type="button"
                      class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                      :style="{ backgroundColor: color }"
                      @mousedown.stop
                      @click.stop="toggle"
                    />
                  </template>
                </SfInput>
              </template>
            </EditorColorPicker>
          </div>

          <div v-if="layoutGradientState.type === 'linear'">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-angle-label') }}</UiFormLabel>
            <input v-model.number="layoutGradientState.angle" type="number" min="0" max="360" class="input-field" />
          </div>
        </template>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('visible-items-label') }}</UiFormLabel>
          <input
            v-model.number="layoutState.visibleItems"
            type="number"
            min="1"
            max="12"
            class="input-field"
            data-testid="recommended-form-visible-items"
          />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('gap-label') }}</UiFormLabel>
          <input
            v-model.number="layoutState.gap"
            type="number"
            min="0"
            class="input-field"
            data-testid="recommended-form-gap"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('margin-left-label') }}</UiFormLabel>
            <input
              v-model.number="layoutState.marginLeft"
              type="number"
              min="0"
              class="input-field"
              data-testid="recommended-form-margin-left"
            />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('margin-right-label') }}</UiFormLabel>
            <input
              v-model.number="layoutState.marginRight"
              type="number"
              min="0"
              class="input-field"
              data-testid="recommended-form-margin-right"
            />
          </div>
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import type {
  CrossSellingRelationType,
  ProductRecommendedProductsContent,
  ProductRecommendedProductsGradient,
  ProductRecommendedProductsSource,
  ProductRecommendedProductsTab,
} from '../ProductRecommendedProducts/types';
import { SfInput, SfIconCheck, SfSwitch } from '@storefront-ui/vue';
import { useDebounceFn } from '@vueuse/core';
import { productGetters } from '@plentymarkets/shop-api';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

const props = defineProps<{ uuid?: string }>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const resolvedUuid = computed(() => props.uuid || blockUuid.value);
const { findOrDeleteBlockByUuid } = useBlockManager();
const { currentProduct } = useProducts();
const { data: categoryTree } = useCategoryTree();
const layoutOpen = ref(true);

const defaultSource = (
  overrides: Partial<ProductRecommendedProductsSource> = {},
): ProductRecommendedProductsSource => ({
  type: overrides.type ?? 'category',
  categoryId: overrides.categoryId ?? '',
  itemId: overrides.itemId ?? '',
  crossSellingRelation: overrides.crossSellingRelation ?? 'Similar',
});

const defaultGradient = (): ProductRecommendedProductsGradient => ({
  enabled: false,
  type: 'linear',
  startColor: '#ffffff',
  endColor: '#e2e8f0',
  angle: 180,
  radius: 100,
  startX: 50,
  startY: 50,
});

const createDefaultContent = (): ProductRecommendedProductsContent => ({
  text: {
    pretitle: '',
    title: '',
    subtitle: '',
    htmlDescription: '',
    color: '#000000',
    textAlignment: 'left',
  },
  source: {
    type: 'category',
    categoryId: '',
    itemId: '',
    crossSellingRelation: 'Similar' as CrossSellingRelationType,
  },
  layout: {
    fullWidth: false,
    gap: 16,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
    gradient: defaultGradient(),
    visibleItems: undefined,
  },
  tabs: {
    enabled: false,
    items: [],
  },
});

const recommendedBlock = ref<ProductRecommendedProductsContent>(createDefaultContent());

watchEffect(() => {
  const blockContent = findOrDeleteBlockByUuid(data.value, resolvedUuid.value)?.content as
    | ProductRecommendedProductsContent
    | undefined;
  if (blockContent) {
    recommendedBlock.value = blockContent;
  }
});

if (!recommendedBlock.value.source) {
  recommendedBlock.value.source = defaultSource();
} else {
  recommendedBlock.value.source = defaultSource(recommendedBlock.value.source);
}

if (!recommendedBlock.value.layout) {
  recommendedBlock.value.layout = {
    fullWidth: false,
    gap: 16,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
    gradient: defaultGradient(),
  };
} else {
  if (recommendedBlock.value.layout.fullWidth === undefined) recommendedBlock.value.layout.fullWidth = false;
  if (recommendedBlock.value.layout.gap === undefined) recommendedBlock.value.layout.gap = 16;
  if (recommendedBlock.value.layout.marginLeft === undefined) recommendedBlock.value.layout.marginLeft = 0;
  if (recommendedBlock.value.layout.marginRight === undefined) recommendedBlock.value.layout.marginRight = 0;
  if (!recommendedBlock.value.layout.backgroundColor) recommendedBlock.value.layout.backgroundColor = 'transparent';
  if (!recommendedBlock.value.layout.gradient) recommendedBlock.value.layout.gradient = defaultGradient();
}

if (!recommendedBlock.value.tabs) {
  recommendedBlock.value.tabs = {
    enabled: false,
    items: [],
  };
}
if (!recommendedBlock.value.tabs.items) recommendedBlock.value.tabs.items = [];
recommendedBlock.value.tabs.items = recommendedBlock.value.tabs.items.map((tab) => ({
  label: tab.label ?? '',
  source: defaultSource(tab.source),
}));

if (Object.keys(currentProduct.value).length) {
  recommendedBlock.value.source.itemId = productGetters.getItemId(currentProduct.value);
  recommendedBlock.value.tabs.items.forEach((tab) => {
    tab.source.itemId = productGetters.getItemId(currentProduct.value);
  });
}

const debouncedFn = useDebounceFn((event: Event) => {
  const target = event.target as HTMLInputElement;
  recommendedBlock.value.source.itemId = target.value.toString();
}, 1000);

const sourceOpen = ref(false);
const textsOpen = ref(false);
const crossSellingOptions = [
  { value: 'Accessory', label: getEditorTranslation('cross-selling-relation-accessory') },
  { value: 'ReplacementPart', label: getEditorTranslation('cross-selling-relation-replacement') },
  { value: 'Similar', label: getEditorTranslation('cross-selling-relation-similar') },
  { value: 'Bundle', label: getEditorTranslation('cross-selling-relation-bundle') },
];

const crossSellingModel = computed({
  get() {
    return crossSellingOptions.find((o) => o.value === recommendedBlock.value.source.crossSellingRelation) ?? null;
  },
  set(option) {
    recommendedBlock.value.source.crossSellingRelation = (option?.value || 'Similar') as CrossSellingRelationType;
  },
});

const firstCategoryId = (categoryTree.value?.find((category) => category.type === 'item')?.id || '').toString();

const categoryIdModel = computed({
  get() {
    return recommendedBlock.value.source?.categoryId || firstCategoryId;
  },
  set(value: string | null) {
    if (!recommendedBlock.value.source) {
      recommendedBlock.value.source = {
        type: 'cross_selling',
        itemId: '',
        categoryId: firstCategoryId,
        crossSellingRelation: 'Similar',
      };
    }
    recommendedBlock.value.source.categoryId = value || '';
  },
});

const recommendedBlockRef = recommendedBlock;

const layoutState = computed(() => {
  if (!recommendedBlock.value.layout) {
    recommendedBlock.value.layout = {
      fullWidth: false,
      gap: 16,
      marginLeft: 0,
      marginRight: 0,
      backgroundColor: 'transparent',
      gradient: defaultGradient(),
    };
  }
  if (!recommendedBlock.value.layout.backgroundColor) recommendedBlock.value.layout.backgroundColor = 'transparent';
  if (!recommendedBlock.value.layout.gradient) recommendedBlock.value.layout.gradient = defaultGradient();

  return recommendedBlock.value.layout;
});

const layoutGradientState = computed(() => {
  if (!layoutState.value.gradient) layoutState.value.gradient = defaultGradient();
  const defaults = defaultGradient();
  if (layoutState.value.gradient.enabled === undefined) layoutState.value.gradient.enabled = defaults.enabled;
  if (!layoutState.value.gradient.type) layoutState.value.gradient.type = defaults.type;
  if (!layoutState.value.gradient.startColor) layoutState.value.gradient.startColor = defaults.startColor;
  if (!layoutState.value.gradient.endColor) layoutState.value.gradient.endColor = defaults.endColor;
  if (layoutState.value.gradient.angle === undefined) layoutState.value.gradient.angle = defaults.angle;
  if (layoutState.value.gradient.radius === undefined) layoutState.value.gradient.radius = defaults.radius;
  if (layoutState.value.gradient.startX === undefined) layoutState.value.gradient.startX = defaults.startX;
  if (layoutState.value.gradient.startY === undefined) layoutState.value.gradient.startY = defaults.startY;
  return layoutState.value.gradient;
});

const tabsState = computed(() => {
  if (!recommendedBlock.value.tabs) {
    recommendedBlock.value.tabs = {
      enabled: false,
      items: [],
    };
  }
  if (!recommendedBlock.value.tabs.items) recommendedBlock.value.tabs.items = [];
  return recommendedBlock.value.tabs;
});

const createTab = (source: ProductRecommendedProductsSource): ProductRecommendedProductsTab => ({
  label: getEditorTranslation('new-tab-label'),
  source: defaultSource({
    ...source,
    categoryId: source.categoryId || firstCategoryId,
  }),
});

const ensureInitialTab = () => {
  if (!tabsState.value.items?.length) {
    tabsState.value.items = [createTab(recommendedBlock.value.source)];
  }
};

const tabsEnabled = computed({
  get: () => tabsState.value.enabled === true,
  set: (enabled: boolean) => {
    tabsState.value.enabled = enabled;

    if (enabled) ensureInitialTab();
  },
});

const tabsItems = computed<ProductRecommendedProductsTab[]>({
  get: () => tabsState.value.items ?? [],
  set: (items) => {
    tabsState.value.items = items;
  },
});

const addTab = () => {
  tabsState.value.enabled = true;

  if (!tabsItems.value.length) {
    tabsItems.value = [createTab(recommendedBlock.value.source)];
    return;
  }

  tabsItems.value = [...tabsItems.value, createTab(defaultSource({ categoryId: firstCategoryId }))];
};

const removeTab = (tabIndex: number) => {
  tabsItems.value = tabsItems.value.filter((_, index) => index !== tabIndex);

  if (!tabsItems.value.length) {
    tabsEnabled.value = false;
  }
};

watch(
  () => tabsState.value.enabled,
  (enabled) => {
    if (enabled) ensureInitialTab();
  },
  { immediate: true },
);

const { isFullWidth } = useFullWidthToggleForContent(recommendedBlockRef);

const selectCategoryTab = async () => {
  recommendedBlock.value.source.type = 'category';
};
</script>

<style scoped>
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
}
</style>

<i18n lang="json">
{
  "en": {
    "texts-label": "Texts",
    "source-label": "Source",
    "source-type-label": "Choose source",
    "source-type-product": "Product",
    "source-type-category": "Category",
    "product-id-label": "Product ID",
    "product-id-placeholder": "Enter Product ID",
    "categories-label": "Categories",
    "layout-label": "Layout",
    "tabs-label": "Tabs",
    "tabs-enabled-label": "Show source tabs below text",
    "tab-label-label": "Tab label",
    "tab-label-placeholder": "Enter tab label",
    "add-tab-label": "Add tab",
    "remove-tab-label": "Remove",
    "new-tab-label": "New tab",
    "background-color-label": "Background color",
    "gradient-enabled-label": "Enable gradient",
    "gradient-type-label": "Gradient type",
    "gradient-start-label": "Gradient start color",
    "gradient-end-label": "Gradient end color",
    "gradient-angle-label": "Gradient angle",
    "visible-items-label": "Visible products",
    "gap-label": "Gap between products (px)",
    "margin-left-label": "Margin left (px)",
    "margin-right-label": "Margin right (px)",
    "cross-selling-relation-label": "Cross-selling relation",
    "cross-selling-relation-accessory": "Accessory",
    "cross-selling-relation-replacement": "Replacement part",
    "cross-selling-relation-similar": "Similar",
    "cross-selling-relation-bundle": "Item bundle"
  },
  "de": {
    "layout-label": "Layout",
    "texts-label": "Texts",
    "source-label": "Source",
    "source-type-label": "Choose source",
    "source-type-product": "Product",
    "source-type-category": "Category",
    "product-id-label": "Product ID",
    "product-id-placeholder": "Enter Product ID",
    "categories-label": "Categories",
    "tabs-label": "Tabs",
    "tabs-enabled-label": "Source-Tabs unterhalb des Textes anzeigen",
    "tab-label-label": "Tab-Label",
    "tab-label-placeholder": "Tab-Label eingeben",
    "add-tab-label": "Tab hinzufuegen",
    "remove-tab-label": "Entfernen",
    "new-tab-label": "Neuer Tab",
    "background-color-label": "Hintergrundfarbe",
    "gradient-enabled-label": "Verlauf aktivieren",
    "gradient-type-label": "Verlaufstyp",
    "gradient-start-label": "Startfarbe Verlauf",
    "gradient-end-label": "Endfarbe Verlauf",
    "gradient-angle-label": "Verlaufswinkel",
    "visible-items-label": "Sichtbare Artikel",
    "gap-label": "Abstand zwischen Produkten (px)",
    "margin-left-label": "Margin links (px)",
    "margin-right-label": "Margin rechts (px)",

    "cross-selling-relation-label": "Cross-selling relation",
    "cross-selling-relation-accessory": "Accessory",
    "cross-selling-relation-replacement": "Replacement part",
    "cross-selling-relation-similar": "Similar",
    "cross-selling-relation-bundle": "Item bundle"
  }
}
</i18n>
