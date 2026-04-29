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
                { 'bg-editor-button text-white': count === (multiGridStructure.configuration.columnWidths?.length || 0) },
              ]"
              @click="setColumnCount(count)"
            >
              {{ count }}
            </button>
          </div>
        </div>

        <div v-if="multiGridStructure.configuration.layout" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('margin-label') }}</UiFormLabel>
          <div class="grid grid-cols-2 gap-px rounded-md overflow-hidden border border-gray-300">
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
            <select v-model="multiGridStructure.configuration.layout.gradientType" class="w-full rounded border border-gray-300 px-2 py-2">
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

          <div class="mb-3">
            <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-end-label') }}</UiFormLabel>
            <EditorColorPicker v-model="multiGridStructure.configuration.layout.gradientEndColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="multiGridStructure.configuration.layout.gradientEndColor" type="text">
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
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
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
import { SfInput, SfSwitch, SfIconArrowUpward, SfIconArrowDownward } from '@storefront-ui/vue';
import ColumnWidthInput from '~/components/editor/ColumnWidthInput.vue';

const props = defineProps<{ uuid?: string }>();

const { blockUuid } = useSiteConfiguration();
const resolvedUuid = computed(() => props.uuid || blockUuid.value);
const { allBlocks: data } = useBlocks();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { getSetting: getBlockSize } = useSiteSettings('verticalBlockSize');
const blockSize = computed(() => getBlockSize());
const defaultMarginBottom = computed(() => getVerticalPixels(blockSize.value));
const isTwoColumnMultigrid = computed(() => {
  return multiGridStructure.value.configuration?.columnWidths?.length === 2;
});

const multiGridStructure = computed(() => {
  const block = (findOrDeleteBlockByUuid(data.value, resolvedUuid.value) as ColumnBlock) || { content: [] };
  if (!block.configuration.layout) {
    block.configuration.layout = {
      marginTop: 0,
      marginBottom: defaultMarginBottom.value,
      backgroundColor: '#ffffff',
      gap: 'M',
      gradientEnabled: false,
      gradientType: 'linear',
      gradientStartColor: '#ffffff',
      gradientEndColor: '#f3f4f6',
      gradientAngle: 180,
    };
  } else {
    if (!block.configuration.layout.backgroundColor) block.configuration.layout.backgroundColor = '#ffffff';
    if (!block.configuration.layout.gap) block.configuration.layout.gap = 'M';
    if (block.configuration.layout.gradientEnabled === undefined) block.configuration.layout.gradientEnabled = false;
    if (!block.configuration.layout.gradientType) block.configuration.layout.gradientType = 'linear';
    if (!block.configuration.layout.gradientStartColor) block.configuration.layout.gradientStartColor = '#ffffff';
    if (!block.configuration.layout.gradientEndColor) block.configuration.layout.gradientEndColor = '#f3f4f6';
    if (block.configuration.layout.gradientAngle === undefined) block.configuration.layout.gradientAngle = 180;
    if (block.configuration.layout.marginBottom === undefined || block.configuration.layout.marginBottom === null) {
      block.configuration.layout.marginBottom = defaultMarginBottom.value;
    }
  }
  return block;
});

const { isFullWidth } = useFullWidthToggleForConfig(computed(() => multiGridStructure.value.configuration));

const gapOptions = ['None', 'S', 'M', 'L', 'XL'];
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
      if (block.parent_slot >= count) {
        block.parent_slot = count - 1;
      }
    });
  }
};

const textSettings = ref(false);
const layoutBackground = ref(false);
</script>

<i18n lang="json">
{
  "en": {
    "layout-settings": "Layout Settings",
    "margin-label": "Margin (px)",
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
    "gradient-angle-label": "Gradient angle"
  },
  "de": {
    "layout-settings": "Layout Settings",
    "margin-label": "Margin (px)",
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
    "gradient-angle-label": "Verlaufswinkel"
  }
}
</i18n>
