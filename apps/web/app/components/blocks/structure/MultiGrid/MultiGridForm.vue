<template>
  <div class="sticky h-[calc(100vh-52px)] overflow-y-auto">
    <UiAccordionItem
      v-model="textSettings"
      data-testid="open-layout-settings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-settings') }}</h2>
      </template>

      <div data-testid="image-text-form">
        <div v-if="isTwoColumnMultigrid" class="py-4">
          <UiFormLabel>{{ getEditorTranslation('column-size') }}</UiFormLabel>
          <ColumnWidthInput
            :multi-grid-structure="multiGridStructure"
            @update:column-widths="multiGridStructure.configuration.columnWidths = $event"
          />
        </div>

        <div class="py-2">
          <UiFormLabel>{{ getEditorTranslation('columns-count-label') }}</UiFormLabel>
          <div class="border-b py-1 flex gap-2">
            <button
              v-for="count in [2, 3, 4, 5, 6]"
              :key="`columns-${count}`"
              type="button"
              :class="[
                gapBtnClasses,
                {
                  'bg-editor-button text-white': count === (multiGridStructure.configuration.columnWidths?.length || 0),
                },
              ]"
              @click="setColumnCount(count)"
            >
              {{ count }}
            </button>
          </div>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('horizontal-alignment-label') }}</UiFormLabel>
          <select
            v-model="multiGridStructure.configuration.layout.horizontalAlignment"
            class="w-full rounded border border-gray-300 px-2 py-2"
            data-testid="horizontal-alignment"
          >
            <option v-for="option in horizontalAlignmentOptions" :key="option" :value="option">
              {{ getEditorTranslation(`horizontal-alignment-${option}`) }}
            </option>
          </select>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('vertical-alignment-label') }}</UiFormLabel>
          <select
            v-model="multiGridStructure.configuration.layout.verticalAlignment"
            class="w-full rounded border border-gray-300 px-2 py-2"
            data-testid="vertical-alignment"
          >
            <option v-for="option in verticalAlignmentOptions" :key="option" :value="option">
              {{ getEditorTranslation(`vertical-alignment-${option}`) }}
            </option>
          </select>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('margin-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowUpward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.marginTop"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="margin-top"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowDownward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.marginBottom"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="margin-bottom"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowBack /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.marginLeft"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="margin-left"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
              <span><SfIconArrowForward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.marginRight"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="margin-right"
              />
            </div>
          </div>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowUpward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.paddingTop"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="padding-top"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowDownward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.paddingBottom"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="padding-bottom"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
              <span><SfIconArrowBack /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.paddingLeft"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="padding-left"
              />
            </div>
            <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
              <span><SfIconArrowForward /></span>
              <input
                v-model.number="multiGridStructure.configuration.layout.paddingRight"
                type="number"
                class="w-12 text-center outline-none"
                data-testid="padding-right"
              />
            </div>
          </div>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('gap-label') }}</UiFormLabel>
          <div class="border-b py-1 flex gap-2">
            <button
              v-for="gapOption in gapOptions"
              :key="gapOption"
              type="button"
              data-testid="gap-btn"
              :class="[
                gapBtnClasses,
                { 'bg-editor-button text-white': gapOption === multiGridStructure.configuration.layout.gap },
              ]"
              @click="multiGridStructure.configuration.layout.gap = gapOption"
            >
              {{ getEditorTranslation('gap-size-' + gapOption.toLowerCase()) }}
            </button>
          </div>
          <div class="mt-2 text-xs text-neutral-700">
            {{ getEditorTranslation('spacing-between') }} {{ getGapPx(multiGridStructure.configuration.layout.gap) }}px
          </div>
        </div>
      </div>
      <div v-if="multiGridStructure.configuration.columnWidths?.length" class="py-4">
        <UiFormLabel>{{ getEditorTranslation('sticky-columns') }}</UiFormLabel>

        <div class="grid grid-cols-3 gap-2 mt-2">
          <button
            v-for="i in numColumns"
            :key="`sticky-col-${i}`"
            type="button"
            class="px-3 py-2 rounded-md border text-sm"
            :class="
              isSticky(i - 1)
                ? 'border-neutral-900 ring-2 ring-neutral-900 bg-neutral-50'
                : 'border-neutral-300 hover:border-neutral-400'
            "
            @click="toggleSticky(i - 1)"
          >
            {{ getEditorTranslation('column') }} {{ i }}
          </button>
        </div>
      </div>
      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="resolvedUuid" />
    </UiAccordionItem>

    <UiAccordionItem
      v-model="layoutBackground"
      data-testid="open-layout-background-settings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-background') }}</h2>
      </template>

      <div v-if="multiGridStructure.configuration.layout" class="py-2">
        <div class="mb-3 flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('gradient-enabled-label') }}</UiFormLabel>
          <SfSwitch v-model="multiGridStructure.configuration.layout.gradientEnabled" />
        </div>

        <template v-if="multiGridStructure.configuration.layout.gradientEnabled">
          <div class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-type-label') }}</UiFormLabel>
            <select
              v-model="multiGridStructure.configuration.layout.gradientType"
              class="w-full rounded border border-gray-300 px-2 py-2"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>

          <div class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-start-label') }}</UiFormLabel>
            <EditorColorPicker v-model="multiGridStructure.configuration.layout.gradientStartColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="multiGridStructure.configuration.layout.gradientStartColor" type="text">
                  <template #suffix>
                    <button
                      type="button"
                      class="editor-color-swatch"
                      :style="{ backgroundColor: color }"
                      @mousedown.stop
                      @click.stop="toggle"
                    />
                  </template>
                </SfInput>
              </template>
            </EditorColorPicker>
          </div>

          <div class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-end-label') }}</UiFormLabel>
            <EditorColorPicker v-model="multiGridStructure.configuration.layout.gradientEndColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="multiGridStructure.configuration.layout.gradientEndColor" type="text">
                  <template #suffix>
                    <button
                      type="button"
                      class="editor-color-swatch"
                      :style="{ backgroundColor: color }"
                      @mousedown.stop
                      @click.stop="toggle"
                    />
                  </template>
                </SfInput>
              </template>
            </EditorColorPicker>
          </div>

          <div v-if="multiGridStructure.configuration.layout.gradientType === 'linear'" class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-angle-label') }}</UiFormLabel>
            <input
              v-model.number="multiGridStructure.configuration.layout.gradientAngle"
              type="number"
              class="w-full rounded border border-gray-300 px-2 py-2"
              min="0"
              max="360"
            />
          </div>

          <div v-if="multiGridStructure.configuration.layout.gradientType === 'radial'" class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-radius-label') }}</UiFormLabel>
            <input
              v-model.number="multiGridStructure.configuration.layout.gradientRadius"
              type="number"
              class="w-full rounded border border-gray-300 px-2 py-2"
              min="1"
              max="300"
            />
          </div>

          <div v-if="multiGridStructure.configuration.layout.gradientType === 'radial'" class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-start-x-label') }}</UiFormLabel>
            <input
              v-model.number="multiGridStructure.configuration.layout.gradientStartX"
              type="number"
              class="w-full rounded border border-gray-300 px-2 py-2"
              min="0"
              max="100"
            />
          </div>

          <div v-if="multiGridStructure.configuration.layout.gradientType === 'radial'" class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-start-y-label') }}</UiFormLabel>
            <input
              v-model.number="multiGridStructure.configuration.layout.gradientStartY"
              type="number"
              class="w-full rounded border border-gray-300 px-2 py-2"
              min="0"
              max="100"
            />
          </div>
        </template>

        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('background-color-label') }}</UiFormLabel>
        </div>
        <EditorColorPicker v-model="multiGridStructure.configuration.layout.backgroundColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <label>
              <SfInput
                v-model="multiGridStructure.configuration.layout.backgroundColor"
                type="text"
                data-testid="input-background-color"
              >
                <template #suffix>
                  <button
                    type="button"
                    class="editor-color-swatch"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </label>
          </template>
        </EditorColorPicker>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import type { ColumnBlock } from '~/components/blocks/structure/MultiGrid/types';
import type { Block } from '@plentymarkets/shop-api';
import {
  SfInput,
  SfSwitch,
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import { v4 as uuidv4 } from 'uuid';
import ColumnWidthInput from '~/components/editor/ColumnWidthInput.vue';

const props = defineProps<{ uuid?: string }>();

const { blockUuid } = useSiteConfiguration();
const resolvedUuid = computed(() => props.uuid || blockUuid.value);
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();
const defaultSpacing = 0;
const isTwoColumnMultigrid = computed(() => {
  return multiGridStructure.value.configuration?.columnWidths?.length === 2;
});

const createEmptyGridBlock = (slot: number): Block => ({
  name: 'EmptyGridBlock',
  type: 'content',
  content: [],
  parent_slot: slot,
  meta: {
    uuid: uuidv4(),
  },
});

const syncSlotContent = (structure: ColumnBlock) => {
  const columnCount = structure.configuration?.columnWidths?.length || 0;
  const currentContent = Array.isArray(structure.content) ? structure.content : [];

  let nextContent = currentContent
    .map((block) => {
      if (typeof block.parent_slot !== 'number') return block;

      if (block.parent_slot >= columnCount) {
        if (block.name === 'EmptyGridBlock') return null;
        block.parent_slot = Math.max(0, columnCount - 1);
      }

      return block.parent_slot >= 0 ? block : null;
    })
    .filter((block): block is Block => block !== null);

  const keptEmptySlots = new Set<number>();
  nextContent = nextContent.filter((block) => {
    if (block.name !== 'EmptyGridBlock' || typeof block.parent_slot !== 'number') return true;
    if (keptEmptySlots.has(block.parent_slot)) return false;

    keptEmptySlots.add(block.parent_slot);
    return true;
  });

  for (let slot = 0; slot < columnCount; slot += 1) {
    const blocksInSlot = nextContent.filter((block) => block.parent_slot === slot);
    const hasRealBlock = blocksInSlot.some((block) => block.name !== 'EmptyGridBlock');

    if (hasRealBlock) {
      nextContent = nextContent.filter((block) => !(block.parent_slot === slot && block.name === 'EmptyGridBlock'));
      continue;
    }

    if (blocksInSlot.length === 0) {
      nextContent.push(createEmptyGridBlock(slot));
    }
  }

  if (
    structure.content !== currentContent ||
    currentContent.length !== nextContent.length ||
    currentContent.some((block, index) => block !== nextContent[index])
  ) {
    structure.content = nextContent;
  }
};

const multiGridStructure = computed(() => {
  const block = (findOrDeleteBlockByUuid(data.value, resolvedUuid.value) as ColumnBlock) || { content: [] };
  if (!Array.isArray(block.content)) {
    block.content = [];
  }

  if (!block.configuration.layout) {
    block.configuration.layout = {
      marginTop: defaultSpacing,
      marginRight: 0,
      marginBottom: defaultSpacing,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      backgroundColor: '#ffffff',
      gap: 'M',
      gradientEnabled: false,
      gradientType: 'linear',
      gradientStartColor: '#ffffff',
      gradientEndColor: '#f3f4f6',
      gradientAngle: 180,
      gradientRadius: 100,
      gradientStartX: 50,
      gradientStartY: 50,
      horizontalAlignment: 'left',
      verticalAlignment: 'top',
    };
  } else {
    if (!block.configuration.layout.backgroundColor) block.configuration.layout.backgroundColor = '#ffffff';
    if (!block.configuration.layout.gap) block.configuration.layout.gap = 'M';
    if (block.configuration.layout.gradientEnabled === undefined) block.configuration.layout.gradientEnabled = false;
    if (!block.configuration.layout.gradientType) block.configuration.layout.gradientType = 'linear';
    if (!block.configuration.layout.gradientStartColor) block.configuration.layout.gradientStartColor = '#ffffff';
    if (!block.configuration.layout.gradientEndColor) block.configuration.layout.gradientEndColor = '#f3f4f6';
    if (block.configuration.layout.gradientAngle === undefined) block.configuration.layout.gradientAngle = 180;
    if (block.configuration.layout.gradientRadius === undefined) block.configuration.layout.gradientRadius = 100;
    if (block.configuration.layout.gradientStartX === undefined) block.configuration.layout.gradientStartX = 50;
    if (block.configuration.layout.gradientStartY === undefined) block.configuration.layout.gradientStartY = 50;
    if (!block.configuration.layout.horizontalAlignment) block.configuration.layout.horizontalAlignment = 'left';
    if (!block.configuration.layout.verticalAlignment) block.configuration.layout.verticalAlignment = 'top';
    if (block.configuration.layout.marginTop === undefined) block.configuration.layout.marginTop = defaultSpacing;
    if (block.configuration.layout.marginRight === undefined) block.configuration.layout.marginRight = 0;
    if (block.configuration.layout.marginLeft === undefined) block.configuration.layout.marginLeft = 0;
    if (block.configuration.layout.paddingTop === undefined) block.configuration.layout.paddingTop = 0;
    if (block.configuration.layout.paddingRight === undefined) block.configuration.layout.paddingRight = 0;
    if (block.configuration.layout.paddingBottom === undefined) block.configuration.layout.paddingBottom = 0;
    if (block.configuration.layout.paddingLeft === undefined) block.configuration.layout.paddingLeft = 0;
    if (block.configuration.layout.marginBottom === undefined || block.configuration.layout.marginBottom === null) {
      block.configuration.layout.marginBottom = defaultSpacing;
    }
  }
  syncSlotContent(block);
  return block;
});

const { isFullWidth } = useFullWidthToggleForConfig(computed(() => multiGridStructure.value.configuration));

const gapOptions = ['None', 'S', 'M', 'L', 'XL'];
const horizontalAlignmentOptions = ['left', 'center', 'right'] as const;
const verticalAlignmentOptions = ['top', 'center', 'bottom'] as const;
const gapBtnClasses =
  'py-2 leading-6 px-4 gap-2 !hover:bg-gray-100 inline-flex items-center justify-center font-medium text-base focus-visible:outline focus-visible:outline-offset rounded-md disabled:text-disabled-500 disabled:bg-disabled-300 disabled:shadow-none disabled:ring-0 disabled:cursor-not-allowed';
type GapSize = 'None' | 'S' | 'M' | 'L' | 'XL';
const gapPxMap: Record<GapSize, number> = {
  None: 0,
  S: 4,
  M: 8,
  L: 12,
  XL: 20,
};

const getGapPx = (gap: string | undefined): number => {
  const validGap = gap === 'None' || gap === 'S' || gap === 'M' || gap === 'L' || gap === 'XL' ? gap : 'M';
  return gapPxMap[validGap as GapSize];
};

if (!multiGridStructure.value.configuration?.sticky) multiGridStructure.value.configuration.sticky = [];

const numColumns = computed(() => Math.max(0, multiGridStructure.value.configuration.columnWidths?.length || 0));

const isSticky = (columnIndex: number) => {
  const sticky = multiGridStructure.value.configuration?.sticky || [];
  return sticky.includes(columnIndex);
};

const toggleSticky = (columnIndex: number) => {
  const configuration = multiGridStructure.value.configuration;

  if (!Array.isArray(configuration?.sticky)) {
    configuration.sticky = [];
  }

  const position = configuration?.sticky.indexOf(columnIndex);

  if (position === -1) {
    configuration?.sticky.push(columnIndex);
  } else {
    configuration?.sticky.splice(position, 1);
  }
};

const getColumnWidthsForCount = (count: number) => {
  const presets: Record<number, number[]> = {
    2: [6, 6],
    3: [4, 4, 4],
    4: [3, 3, 3, 3],
    5: [2, 2, 2, 3, 3],
    6: [2, 2, 2, 2, 2, 2],
  };
  return presets[count] || [6, 6];
};

const setColumnCount = (count: number) => {
  const structure = multiGridStructure.value;
  structure.configuration.columnWidths = getColumnWidthsForCount(count);

  if (!Array.isArray(structure.configuration.sticky)) {
    structure.configuration.sticky = [];
  }
  structure.configuration.sticky = structure.configuration.sticky.filter((column) => column < count);

  if (Array.isArray(structure.content)) {
    structure.content.forEach((block: any) => {
      if (typeof block.parent_slot !== 'number') return;
      if (block.name === 'EmptyGridBlock' && block.parent_slot >= count) return;
      if (block.parent_slot >= count) {
        block.parent_slot = count - 1;
      }
    });
  }
  syncSlotContent(structure);
};

const textSettings = ref(false);
const layoutBackground = ref(false);
</script>

<i18n lang="json">
{
  "en": {
    "layout-settings": "Layout Settings",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "background-color-label": "Background Color",
    "gap-label": "Gap",
    "gap-size-none": "None",
    "gap-size-s": "S",
    "gap-size-m": "M",
    "gap-size-l": "L",
    "gap-size-xl": "XL",
    "spacing-around": "Spacing around",
    "spacing-between": "Spacing between Blocks:",
    "layout-background": "Layout Background",
    "sticky-columns": "Sticky columns",
    "column-size": "Column Size",
    "column": "Column",
    "columns-count-label": "Columns",
    "gradient-enabled-label": "Enable gradient",
    "gradient-type-label": "Gradient type",
    "gradient-start-label": "Gradient start color",
    "gradient-end-label": "Gradient end color",
    "gradient-angle-label": "Gradient angle",
    "gradient-radius-label": "Gradient radius (%)",
    "gradient-start-x-label": "Gradient start X (%)",
    "gradient-start-y-label": "Gradient start Y (%)",
    "horizontal-alignment-label": "Horizontal alignment",
    "horizontal-alignment-left": "Left",
    "horizontal-alignment-center": "Center",
    "horizontal-alignment-right": "Right",
    "vertical-alignment-label": "Vertical alignment",
    "vertical-alignment-top": "Top",
    "vertical-alignment-center": "Center",
    "vertical-alignment-bottom": "Bottom"
  },
  "de": {
    "layout-settings": "Layout Settings",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "background-color-label": "Background Color",
    "gap-label": "Gap",
    "gap-size-none": "None",
    "gap-size-s": "S",
    "gap-size-m": "M",
    "gap-size-l": "L",
    "gap-size-xl": "XL",
    "spacing-around": "Spacing around",
    "spacing-between": "Spacing between Blocks:",
    "layout-background": "Layout Background",
    "sticky-columns": "Sticky columns",
    "column-size": "Column Size",
    "column": "Column",
    "columns-count-label": "Spalten",
    "gradient-enabled-label": "Verlauf aktivieren",
    "gradient-type-label": "Verlaufstyp",
    "gradient-start-label": "Startfarbe Verlauf",
    "gradient-end-label": "Endfarbe Verlauf",
    "gradient-angle-label": "Verlaufswinkel",
    "gradient-radius-label": "Verlaufsradius (%)",
    "gradient-start-x-label": "Verlauf Start X (%)",
    "gradient-start-y-label": "Verlauf Start Y (%)",
    "horizontal-alignment-label": "Horizontale Ausrichtung",
    "horizontal-alignment-left": "Links",
    "horizontal-alignment-center": "Zentriert",
    "horizontal-alignment-right": "Rechts",
    "vertical-alignment-label": "Vertikale Ausrichtung",
    "vertical-alignment-top": "Oben",
    "vertical-alignment-center": "Mitte",
    "vertical-alignment-bottom": "Unten"
  }
}
</i18n>
