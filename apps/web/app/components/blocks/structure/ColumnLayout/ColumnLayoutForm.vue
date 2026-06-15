<template>
  <div class="sticky h-[calc(100vh-52px)] overflow-y-auto">
    <UiAccordionItem
      v-model="layoutSettings"
      data-testid="open-column-layout-settings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-settings') }}</h2>
      </template>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('columns-count-label') }}</UiFormLabel>
        <div class="border-b py-2 flex flex-wrap gap-2">
          <button
            v-for="count in 12"
            :key="`columns-${count}`"
            type="button"
            :class="[gapBtnClasses, { 'bg-editor-button text-white': count === columnsCount }]"
            @click="setColumnCount(count)"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('column-widths-label') }}</UiFormLabel>
        <p class="mb-2 text-xs text-neutral-700">
          {{ getEditorTranslation('column-widths-hint') }}
        </p>

        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="(width, index) in columnLayoutStructure.configuration.columnWidths"
            :key="`col-width-${index}`"
            class="flex items-center gap-2 rounded border border-neutral-300 px-2 py-1"
          >
            <span class="text-xs text-neutral-700">{{ getEditorTranslation('column') }} {{ index + 1 }}</span>
            <input
              :value="width"
              type="number"
              class="w-full rounded border border-neutral-300 px-2 py-1"
              min="1"
              max="12"
              @input="updateColumnWidth(index, Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>
      </div>

      <div v-if="columnLayoutStructure.configuration.layout" class="py-2">
        <UiFormLabel>{{ getEditorTranslation('margin-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowUpward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.marginTop"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="margin-top"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowDownward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.marginBottom"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="margin-bottom"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowBack /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.marginLeft"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="margin-left"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
            <span><SfIconArrowForward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.marginRight"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="margin-right"
            />
          </div>
        </div>
      </div>

      <div v-if="columnLayoutStructure.configuration.layout" class="py-2">
        <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowUpward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.paddingTop"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="padding-top"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowDownward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.paddingBottom"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="padding-bottom"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
            <span><SfIconArrowBack /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.paddingLeft"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="padding-left"
            />
          </div>
          <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
            <span><SfIconArrowForward /></span>
            <input
              v-model.number="columnLayoutStructure.configuration.layout.paddingRight"
              type="number"
              class="w-12 text-center outline-none"
              data-testid="padding-right"
            />
          </div>
        </div>
      </div>

      <div v-if="columnLayoutStructure.configuration.layout" class="py-2">
        <UiFormLabel>{{ getEditorTranslation('gap-label') }}</UiFormLabel>
        <div class="border-b py-1 flex gap-2">
          <button
            v-for="gapOption in gapOptions"
            :key="gapOption"
            type="button"
            data-testid="gap-btn"
            :class="[gapBtnClasses, { 'bg-editor-button text-white': gapOption === columnLayoutStructure.configuration.layout.gap }]"
            @click="columnLayoutStructure.configuration.layout.gap = gapOption"
          >
            {{ getEditorTranslation('gap-size-' + gapOption.toLowerCase()) }}
          </button>
        </div>
      </div>

      <EditorFullWidthToggle v-if="resolvedUuid" v-model="isFullWidth" :block-uuid="resolvedUuid" />
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import {
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import { v4 as uuidv4 } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { ColumnLayoutBlock } from '~/components/blocks/structure/ColumnLayout/types';

const props = defineProps<{ uuid?: string }>();

const { blockUuid } = useSiteConfiguration();
const resolvedUuid = computed(() => props.uuid || blockUuid.value);
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { getSetting: getBlockSize } = useSiteSettings('verticalBlockSize');
const blockSize = computed(() => getBlockSize());
const defaultMarginBottom = computed(() => getVerticalPixels(blockSize.value));

const clampColumnCount = (count: number) => {
  if (!Number.isFinite(count)) return 1;
  return Math.min(12, Math.max(1, Math.round(count)));
};

const splitIntoTwelve = (count: number) => {
  const normalizedCount = clampColumnCount(count);
  const base = Math.floor(12 / normalizedCount);
  const remainder = 12 % normalizedCount;

  return Array.from({ length: normalizedCount }, (_, index) => base + (index < remainder ? 1 : 0));
};

const normalizeWidthsToTwelve = (inputWidths: number[], count: number): number[] => {
  const normalizedCount = clampColumnCount(count);
  const candidate = inputWidths.slice(0, normalizedCount).map((width) => {
    if (!Number.isFinite(width)) return 0;
    return Math.max(0, Math.round(width));
  });

  while (candidate.length < normalizedCount) {
    candidate.push(0);
  }

  const total = candidate.reduce((sum, width) => sum + width, 0);

  if (total <= 0) {
    return splitIntoTwelve(normalizedCount);
  }

  const proportional = candidate.map((width) => (width / total) * 12);
  const floored = proportional.map((value) => Math.floor(value));
  let remainder = 12 - floored.reduce((sum, value) => sum + value, 0);

  const fractions = proportional
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < fractions.length && remainder > 0; index += 1) {
    const fraction = fractions[index];
    if (!fraction) continue;

    const targetIndex = fraction.index;
    floored[targetIndex] = (floored[targetIndex] ?? 0) + 1;
    remainder -= 1;
  }

  for (let index = 0; index < floored.length; index += 1) {
    const currentValue = floored[index] ?? 0;
    if (currentValue > 0) continue;

    const donorIndex = floored.findIndex((value) => value > 1);
    if (donorIndex === -1) break;

    const donorValue = floored[donorIndex] ?? 0;
    floored[donorIndex] = donorValue - 1;
    floored[index] = currentValue + 1;
  }

  return floored;
};

const createEmptyGridBlock = (slot: number): Block => ({
  name: 'EmptyGridBlock',
  type: 'content',
  content: [],
  parent_slot: slot,
  meta: {
    uuid: uuidv4(),
  },
});

const createDefaultColumnLayoutBlock = (): ColumnLayoutBlock => ({
  name: 'ColumnLayout',
  type: 'structure',
  meta: {
    uuid: uuidv4(),
  },
  content: [],
  configuration: {
    visible: true,
    columns: 2,
    columnWidths: [6, 6],
  },
});

const fallbackStructure = ref<ColumnLayoutBlock>(createDefaultColumnLayoutBlock());

const syncSlotContent = (structure: ColumnLayoutBlock, columnsCount: number) => {
  if (!Array.isArray(structure.content)) {
    structure.content = [];
  }

  structure.content = structure.content.filter((block) => {
    if (typeof block.parent_slot !== 'number') return false;
    return block.parent_slot >= 0 && block.parent_slot < columnsCount;
  });

  for (let slot = 0; slot < columnsCount; slot += 1) {
    const blocksInSlot = structure.content.filter((block) => block.parent_slot === slot);
    const hasRealBlock = blocksInSlot.some((block) => block.name !== 'EmptyGridBlock');

    if (hasRealBlock) {
      structure.content = structure.content.filter((block) => !(block.parent_slot === slot && block.name === 'EmptyGridBlock'));
      continue;
    }

    if (blocksInSlot.length === 0) {
      structure.content.push(createEmptyGridBlock(slot));
    }
  }
};

const columnLayoutStructure = computed(() => {
  const existingBlock = findOrDeleteBlockByUuid(data.value, resolvedUuid.value) as ColumnLayoutBlock | undefined;
  const block = existingBlock || fallbackStructure.value;

  if (!block.configuration) {
    block.configuration = {
      visible: true,
      columns: 2,
      columnWidths: [6, 6],
    };
  }

  if (!Array.isArray(block.content)) {
    block.content = [];
  }

  if (!Array.isArray(block.configuration.columnWidths) || block.configuration.columnWidths.length === 0) {
    block.configuration.columnWidths = [6, 6];
  }

  const configuredColumns = block.configuration.columns ?? block.configuration.columnWidths.length;
  const normalizedColumns = clampColumnCount(configuredColumns || 1);
  block.configuration.columns = normalizedColumns;
  block.configuration.columnWidths = normalizeWidthsToTwelve(block.configuration.columnWidths, normalizedColumns);

  if (!block.configuration.layout) {
    block.configuration.layout = {
      marginTop: 0,
      marginRight: 0,
      marginBottom: defaultMarginBottom.value,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      backgroundColor: '#ffffff',
      gap: 'M',
      fullWidth: false,
    };
  }

  if (!block.configuration.layout.gap) block.configuration.layout.gap = 'M';
  if (!block.configuration.layout.backgroundColor) block.configuration.layout.backgroundColor = '#ffffff';
  if (block.configuration.layout.marginTop === undefined) block.configuration.layout.marginTop = 0;
  if (block.configuration.layout.marginRight === undefined) block.configuration.layout.marginRight = 0;
  if (block.configuration.layout.marginLeft === undefined) block.configuration.layout.marginLeft = 0;
  if (block.configuration.layout.paddingTop === undefined) block.configuration.layout.paddingTop = 0;
  if (block.configuration.layout.paddingRight === undefined) block.configuration.layout.paddingRight = 0;
  if (block.configuration.layout.paddingBottom === undefined) block.configuration.layout.paddingBottom = 0;
  if (block.configuration.layout.paddingLeft === undefined) block.configuration.layout.paddingLeft = 0;
  if (block.configuration.layout.marginBottom === undefined || block.configuration.layout.marginBottom === null) {
    block.configuration.layout.marginBottom = defaultMarginBottom.value;
  }

  syncSlotContent(block, normalizedColumns);
  return block;
});

const { isFullWidth } = useFullWidthToggleForConfig(computed(() => columnLayoutStructure.value.configuration));

const columnsCount = computed(() => clampColumnCount(columnLayoutStructure.value.configuration.columns || 1));

const setColumnCount = (count: number) => {
  const normalized = clampColumnCount(count);
  columnLayoutStructure.value.configuration.columns = normalized;
  columnLayoutStructure.value.configuration.columnWidths = normalizeWidthsToTwelve(
    splitIntoTwelve(normalized),
    normalized,
  );
  syncSlotContent(columnLayoutStructure.value, normalized);
};

const updateColumnWidth = (index: number, value: number) => {
  const widths = [...columnLayoutStructure.value.configuration.columnWidths];
  widths[index] = Number.isFinite(value) ? Math.max(1, Math.min(12, Math.round(value))) : 1;
  columnLayoutStructure.value.configuration.columnWidths = normalizeWidthsToTwelve(widths, columnsCount.value);
};

const gapOptions = ['None', 'S', 'M', 'L', 'XL'];
const gapBtnClasses =
  'py-2 leading-6 px-4 gap-2 !hover:bg-gray-100 inline-flex items-center justify-center font-medium text-base focus-visible:outline focus-visible:outline-offset rounded-md disabled:text-disabled-500 disabled:bg-disabled-300 disabled:shadow-none disabled:ring-0 disabled:cursor-not-allowed';

const layoutSettings = ref(false);
</script>

<i18n lang="json">
{
  "en": {
    "layout-settings": "Layout Settings",
    "columns-count-label": "Columns",
    "column-widths-label": "Column width ratio",
    "column-widths-hint": "Widths are normalized to 12 units. Example: 2/10 = 20/80.",
    "column": "Column",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "gap-label": "Gap",
    "gap-size-none": "None",
    "gap-size-s": "S",
    "gap-size-m": "M",
    "gap-size-l": "L",
    "gap-size-xl": "XL"
  },
  "de": {
    "layout-settings": "Layout Settings",
    "columns-count-label": "Spalten",
    "column-widths-label": "Spaltenverhaeltnis",
    "column-widths-hint": "Breiten werden auf 12 Einheiten normiert. Beispiel: 2/10 = 20/80.",
    "column": "Spalte",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "gap-label": "Gap",
    "gap-size-none": "None",
    "gap-size-s": "S",
    "gap-size-m": "M",
    "gap-size-l": "L",
    "gap-size-xl": "XL"
  }
}
</i18n>
