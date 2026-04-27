<template>
  <UiAccordionItem
    v-model="textOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    data-testid="item-data-text"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('text-settings-label') }}</h2>
    </template>

    <div class="py-2">
      <div class="flex justify-between mb-2">
        <UiFormLabel>{{ getEditorTranslation('main-title-label') }}</UiFormLabel>
      </div>
      <SfInput v-model="itemTableBlock.text.title" type="text" data-testid="item-data-main-title" />
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="fieldsOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    data-testid="item-table-fields"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('item-table-section-label') }}</h2>
    </template>

    <div class="py-4">
      <UiFormLabel class="block mb-4">
        {{ getEditorTranslation('elements-display-order') }}
      </UiFormLabel>

      <draggable
        v-model="itemTableBlock.fieldsOrder"
        item-key="element"
        handle=".drag-handle"
        class="rounded space-y-3"
      >
        <template #item="{ element, index }: { element: ItemDataFieldKey; index: number }">
          <div
            :key="element"
            class="flex items-center justify-between cursor-move"
            :data-testid="`item-table-field-${element}`"
          >
            <div class="flex items-center gap-3">
              <button
                class="drag-handle cursor-grab p-2 hover:bg-gray-100 rounded-full"
                :aria-label="getEditorTranslation('drag-reorder-aria')"
                :data-testid="`actions-drag-field-handle-${index}`"
              >
                <NuxtImg width="18" height="18" :src="dragIcon" />
              </button>

              <span>{{ fieldLabels[element] }}</span>
            </div>

            <SfSwitch v-model="itemTableBlock.fields[element]" :data-testid="`item-table-visible-${element}`" />
          </div>
        </template>
      </draggable>

      <EditorNumericIdTagSelect
        v-model="propertyIdsModel"
        class="mt-6"
        :label="getEditorTranslation('properties-ids-label')"
        :placeholder="getEditorTranslation('properties-ids-placeholder')"
        :tag-placeholder="getEditorTranslation('properties-ids-tag-placeholder')"
        :deselect-label="getEditorTranslation('properties-ids-deselect-label')"
        :help-text="getEditorTranslation('properties-ids-help')"
        :invalid-title="getEditorTranslation('properties-ids-invalid-title')"
        :invalid-help-text="getEditorTranslation('properties-ids-invalid-help')"
        :preview-title="getEditorTranslation('properties-preview-title')"
        :preview-empty-text="getEditorTranslation('properties-preview-empty')"
        :preview-unavailable-text="getEditorTranslation('properties-preview-unavailable')"
        :preview-items="propertyPreviewItems"
        data-test-id="item-data-property-ids"
      />
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="layoutOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    data-testid="item-table-layout"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-settings-label') }}</h2>
    </template>

    <div class="py-2">
      <div class="flex justify-between my-3">
        <span>{{ getEditorTranslation('display-as-collapsable') }}</span>
        <SfSwitch v-model="isCollapsible" :disabled="!hasTitle" data-testid="item-data-displayAsCollapsable-switch" />
      </div>

      <div class="flex justify-between mb-4">
        <span>{{ getEditorTranslation('initially-collapsed') }}</span>
        <SfSwitch
          v-model="isInitiallyCollapsed"
          :disabled="!hasTitle || !isCollapsible"
          data-testid="item-data-initiallyCollapsed-switch"
        />
      </div>

      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

      <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
      <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300 mt-1">
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowUpward /></span>
          <input
            v-model.number="itemTableBlock.layout.paddingTop"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-top"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowDownward /></span>
          <input
            v-model.number="itemTableBlock.layout.paddingBottom"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-bottom"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowBack /></span>
          <input
            v-model.number="itemTableBlock.layout.paddingLeft"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-left"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
          <span><SfIconArrowForward /></span>
          <input
            v-model.number="itemTableBlock.layout.paddingRight"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-right"
          />
        </div>
      </div>
      <div class="px-4 py-3">
        <span class="typography-text-xs text-neutral-700">
          {{ getEditorTranslation('spacing-around') }}
        </span>
      </div>
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import {
  SfInput,
  SfSwitch,
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowForward,
  SfIconArrowBack,
} from '@storefront-ui/vue';
import dragIcon from '~/assets/icons/paths/drag.svg';
import type { ItemDataContent, ItemDataFieldKey, ItemDataFieldLabels } from './types';
import { getVariationPropertyId } from '~/composables/useItemDataTable/helpers/ItemDataHelpers';
import type { NumericIdPreviewItem } from '~/components/editor/NumericIdTagSelect/types';

const { allBlocks: data } = useBlocks();
const { currentProduct } = useProducts();

const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const props = defineProps<{
  uuid?: string;
}>();

interface PreviewProperty {
  id?: number | string | null;
  names?: { propertyId?: number | string | null; name?: string | null } | null;
  values?: { value?: string | null } | null;
}

interface PreviewPropertyGroup {
  properties?: PreviewProperty[];
}

const ALL_KEYS: ItemDataFieldKey[] = [
  'itemId',
  'condition',
  'ageRating',
  'externalVariationId',
  'model',
  'manufacturer',
  'manufacturingCountry',
  'content',
  'grossWeight',
  'netWeight',
  'dimensions',
  'customTariffNumber',
  'properties',
];

const rawContent = (findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ??
  {}) as Partial<ItemDataContent>;

if (!rawContent.text) {
  rawContent.text = { title: 'More details' };
} else if (rawContent.text.title === undefined) {
  rawContent.text.title = 'More details';
}

if (!Array.isArray(rawContent.propertyIds)) {
  rawContent.propertyIds = [];
}

if (!rawContent.fields) {
  rawContent.fields = {} as ItemDataContent['fields'];
}
ALL_KEYS.forEach((key) => {
  if (rawContent.fields![key] === undefined) {
    rawContent.fields![key] = true;
  }
});

if (!rawContent.fieldsOrder || !rawContent.fieldsOrder.length) {
  rawContent.fieldsOrder = [...ALL_KEYS];
}

if (!rawContent.layout) {
  rawContent.layout = {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    displayAsCollapsable: false,
    initiallyCollapsed: false,
    fullWidth: false,
  };
} else {
  rawContent.layout.paddingTop ??= 0;
  rawContent.layout.paddingBottom ??= 0;
  rawContent.layout.paddingLeft ??= 0;
  rawContent.layout.paddingRight ??= 0;
  rawContent.layout.displayAsCollapsable ??= false;
  rawContent.layout.initiallyCollapsed ??= false;
  rawContent.layout.fullWidth ??= false;
}

const itemTableBlock = reactive(rawContent as ItemDataContent);

const { isFullWidth } = useFullWidthToggleForContent(toRef(itemTableBlock));

const propertyIdsModel = computed({
  get: () => itemTableBlock.propertyIds ?? [],
  set: (value: number[]) => {
    itemTableBlock.propertyIds = [...new Set(value.filter((id) => Number.isInteger(id) && id > 0))];
  },
});

const propertyPreviewItems = computed<NumericIdPreviewItem[]>(() => {
  const previewMap = new Map<number, NumericIdPreviewItem>();

  (currentProduct.value?.variationProperties ?? [])
    .flatMap((group: PreviewPropertyGroup) => group.properties ?? [])
    .forEach((property: PreviewProperty) => {
      const id = getVariationPropertyId(property);
      if (id === null || previewMap.has(id)) return;

      const label = property.names?.name ? String(property.names.name) : `#${id}`;
      const description = property.values?.value ? String(property.values.value) : undefined;

      previewMap.set(id, { id, label, description });
    });

  return [...previewMap.values()];
});

const fieldLabels: ItemDataFieldLabels = {
  itemId: getEditorTranslation('field-itemId'),
  condition: getEditorTranslation('field-condition'),
  ageRating: getEditorTranslation('field-ageRating'),
  externalVariationId: getEditorTranslation('field-externalVariationId'),
  model: getEditorTranslation('field-model'),
  manufacturer: getEditorTranslation('field-manufacturer'),
  manufacturingCountry: getEditorTranslation('field-manufacturingCountry'),
  content: getEditorTranslation('field-content'),
  grossWeight: getEditorTranslation('field-grossWeight'),
  netWeight: getEditorTranslation('field-netWeight'),
  dimensions: getEditorTranslation('field-dimensions'),
  customTariffNumber: getEditorTranslation('field-customTariffNumber'),
  properties: getEditorTranslation('field-properties'),
};

const textOpen = ref(true);
const fieldsOpen = ref(true);
const layoutOpen = ref(false);

const isCollapsible = ref(itemTableBlock.layout.displayAsCollapsable ?? false);
const isInitiallyCollapsed = ref(itemTableBlock.layout.initiallyCollapsed ?? false);

const hasTitle = computed(() => {
  const title = itemTableBlock.text?.title;
  return !!title && title.trim().length > 0;
});

watch(
  () => itemTableBlock.text.title,
  (newTitle) => {
    const hasAnyTitle = !!newTitle && newTitle.trim().length > 0;

    if (!hasAnyTitle) {
      isCollapsible.value = false;
      isInitiallyCollapsed.value = false;
      itemTableBlock.layout.displayAsCollapsable = false;
      itemTableBlock.layout.initiallyCollapsed = false;
    }
  },
);

watch(isCollapsible, (newValue) => {
  if (!hasTitle.value) {
    if (isCollapsible.value !== false) {
      isCollapsible.value = false;
    }
    itemTableBlock.layout.displayAsCollapsable = false;
    return;
  }

  itemTableBlock.layout.displayAsCollapsable = newValue;

  if (!newValue) {
    isInitiallyCollapsed.value = false;
    itemTableBlock.layout.initiallyCollapsed = false;
  }
});

watch(isInitiallyCollapsed, (newValue) => {
  if (!hasTitle.value || !isCollapsible.value) {
    isInitiallyCollapsed.value = false;
    itemTableBlock.layout.initiallyCollapsed = false;
    return;
  }
  itemTableBlock.layout.initiallyCollapsed = newValue;
});
</script>

<i18n lang="json">
{
  "en": {
    "text-settings-label": "Text",
    "main-title-label": "Title",

    "item-table-section-label": "Item data",
    "elements-display-order": "Elements display and order",
    "layout-settings-label": "Layout settings",
    "padding-label": "Padding (px)",
    "spacing-around": "Spacing around the table",
    "display-as-collapsable": "Display as collapsable",
    "initially-collapsed": "Initially collapsed",
    "properties-ids-label": "Property IDs",
    "properties-ids-placeholder": "Add property IDs",
    "properties-ids-tag-placeholder": "Press Enter to add",
    "properties-ids-deselect-label": "Selected",
    "properties-ids-help": "Only these property IDs are shown in the properties row. Leave the field empty to show all properties.",
    "properties-ids-invalid-title": "Invalid property IDs",
    "properties-ids-invalid-help": "Only positive integer IDs are allowed. Invalid entries were not added.",
    "properties-preview-title": "Live preview",
    "properties-preview-empty": "No property IDs selected yet.",
    "properties-preview-unavailable": "No matching property found in the current preview product.",

    "field-itemId": "Item ID",
    "field-condition": "Condition",
    "field-ageRating": "Age rating",
    "field-externalVariationId": "External variation ID",
    "field-model": "Model",
    "field-manufacturer": "Manufacturer",
    "field-manufacturingCountry": "Manufacturing country",
    "field-content": "Content",
    "field-grossWeight": "Gross weight",
    "field-netWeight": "Net weight",
    "field-dimensions": "Dimensions",
    "field-customTariffNumber": "Custom tariff number",
    "field-properties": "Properties",

    "drag-reorder-aria": "Drag to reorder"
  },
  "de": {
    "text-settings-label": "Text",
    "main-title-label": "Title",

    "item-table-section-label": "Item data",
    "elements-display-order": "Elements display and order",
    "layout-settings-label": "Layout settings",
    "padding-label": "Padding (px)",
    "spacing-around": "Spacing around the table",
    "display-as-collapsable": "Display as collapsable",
    "initially-collapsed": "Initially collapsed",
    "properties-ids-label": "Property IDs",
    "properties-ids-placeholder": "Eigenschafts-IDs hinzufügen",
    "properties-ids-tag-placeholder": "Mit Enter hinzufügen",
    "properties-ids-deselect-label": "Ausgewählt",
    "properties-ids-help": "Es werden nur diese Eigenschafts-IDs in der Eigenschaften-Zeile angezeigt. Wenn das Feld leer ist, werden alle Eigenschaften angezeigt.",
    "properties-ids-invalid-title": "Ungültige Eigenschafts-IDs",
    "properties-ids-invalid-help": "Es sind nur positive Ganzzahlen erlaubt. Ungültige Eingaben wurden nicht übernommen.",
    "properties-preview-title": "Live-Vorschau",
    "properties-preview-empty": "Es sind noch keine Eigenschafts-IDs ausgewählt.",
    "properties-preview-unavailable": "Für diese ID wurde im aktuellen Vorschauprodukt keine passende Eigenschaft gefunden.",

    "field-itemId": "Item ID",
    "field-condition": "Condition",
    "field-ageRating": "Age rating",
    "field-externalVariationId": "External variation ID",
    "field-model": "Model",
    "field-manufacturer": "Manufacturer",
    "field-manufacturingCountry": "Manufacturing country",
    "field-content": "Content",
    "field-grossWeight": "Gross weight",
    "field-netWeight": "Net weight",
    "field-dimensions": "Dimensions",
    "field-customTariffNumber": "Custom tariff number",
    "field-properties": "Properties",

    "drag-reorder-aria": "Drag to reorder"
  }
}
</i18n>
