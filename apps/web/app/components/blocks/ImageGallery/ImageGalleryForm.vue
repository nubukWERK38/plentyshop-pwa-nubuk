<template>
  <UiAccordionItem
    v-model="thumbsOpen"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    data-testid="item-image-thumbnails"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('item-image-label') }}</h2>
    </template>

    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <UiFormLabel>{{ getEditorTranslation('show-thumbnails') }}</UiFormLabel>
        <SfSwitch v-model="uiItemImageBlock.thumbnails.showThumbnails" data-testid="show-thumbnails" />
      </div>

      <div v-show="uiItemImageBlock.thumbnails.showThumbnails" class="space-y-3">
        <UiFormLabel>{{ getEditorTranslation('thumbnail-type') }}</UiFormLabel>

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="thumb in thumbnails"
            :key="thumb.type"
            type="button"
            class="relative w-full rounded-lg border p-2 transition"
            :class="
              uiItemImageBlock.thumbnails.thumbnailType === thumb.type
                ? 'border-neutral-900 ring-2 ring-neutral-900'
                : 'border-neutral-300 hover:border-neutral-400'
            "
            :aria-pressed="uiItemImageBlock.thumbnails.thumbnailType === thumb.type"
            :aria-label="thumb.label"
            data-testid="thumbnail-type-card"
            @click="uiItemImageBlock.thumbnails.thumbnailType = thumb.type"
          >
            <NuxtImg :src="thumb.cdn" :alt="thumb.label" class="w-full h-auto rounded" />
            <span
              v-if="uiItemImageBlock.thumbnails.thumbnailType === thumb.type"
              class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs"
              ><SfIconCheck size="xs"
            /></span>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <UiFormLabel>{{ getEditorTranslation('enable-zoom-on-hover') }}</UiFormLabel>
        <SfSwitch v-model="uiItemImageBlock.thumbnails.enableHoverZoom" data-testid="enable-zoom-on-hover" />
      </div>
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

    <div class="space-y-3 py-2">
      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

      <div class="flex items-center justify-between">
        <UiFormLabel>{{ getEditorTranslation('gradient-enabled-label') }}</UiFormLabel>
        <SfSwitch v-model="layoutGradientState.enabled" />
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
        <UiFormLabel class="mb-1">{{ getEditorTranslation('background-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="uiItemImageBlock.layout.backgroundColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="uiItemImageBlock.layout.backgroundColor" type="text">
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
        <UiFormLabel class="mb-1">{{ getEditorTranslation('margin-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="cell"><span><SfIconArrowUpward /></span><input v-model.number="layoutMarginState.top" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowDownward /></span><input v-model.number="layoutMarginState.bottom" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowBack /></span><input v-model.number="layoutMarginState.left" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowForward /></span><input v-model.number="layoutMarginState.right" type="number" class="num" /></div>
        </div>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('padding-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="cell"><span><SfIconArrowUpward /></span><input v-model.number="layoutPaddingState.top" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowDownward /></span><input v-model.number="layoutPaddingState.bottom" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowBack /></span><input v-model.number="layoutPaddingState.left" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowForward /></span><input v-model.number="layoutPaddingState.right" type="number" class="num" /></div>
        </div>
      </div>
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="headerOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('header-label') }}</h2>
    </template>

    <div class="space-y-3 py-2">
      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-label') }}</UiFormLabel>
        <SfInput v-model="headerState.subline" type="text" />
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
        <SfInput v-model="headerState.headline" type="text" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-size-label') }}</UiFormLabel>
          <input v-model.number="headerState.sublineFontSize" type="number" min="10" max="80" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-size-label') }}</UiFormLabel>
          <input v-model.number="headerState.headlineFontSize" type="number" min="12" max="120" class="input-field" />
        </div>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="headerState.sublineColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="headerState.sublineColor" type="text"><template #suffix><button type="button" class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8" :style="{ backgroundColor: color }" @mousedown.stop @click.stop="toggle" /></template></SfInput>
          </template>
        </EditorColorPicker>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="headerState.headlineColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="headerState.headlineColor" type="text"><template #suffix><button type="button" class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8" :style="{ backgroundColor: color }" @mousedown.stop @click.stop="toggle" /></template></SfInput>
          </template>
        </EditorColorPicker>
      </div>

      <div class="flex items-center justify-between">
        <UiFormLabel>{{ getEditorTranslation('header-gradient-enabled-label') }}</UiFormLabel>
        <SfSwitch v-model="headerGradientState.enabled" />
      </div>

      <template v-if="headerGradientState.enabled">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-type-label') }}</UiFormLabel>
          <select v-model="headerGradientState.type" class="input-field">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-start-label') }}</UiFormLabel>
          <EditorColorPicker v-model="headerGradientState.startColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="headerGradientState.startColor" type="text"><template #suffix><button type="button" class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8" :style="{ backgroundColor: color }" @mousedown.stop @click.stop="toggle" /></template></SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-end-label') }}</UiFormLabel>
          <EditorColorPicker v-model="headerGradientState.endColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="headerGradientState.endColor" type="text"><template #suffix><button type="button" class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8" :style="{ backgroundColor: color }" @mousedown.stop @click.stop="toggle" /></template></SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div v-if="headerGradientState.type === 'linear'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('gradient-angle-label') }}</UiFormLabel>
          <input v-model.number="headerGradientState.angle" type="number" min="0" max="360" class="input-field" />
        </div>
      </template>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('header-background-label') }}</UiFormLabel>
        <EditorColorPicker v-model="headerState.backgroundColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="headerState.backgroundColor" type="text"><template #suffix><button type="button" class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8" :style="{ backgroundColor: color }" @mousedown.stop @click.stop="toggle" /></template></SfInput>
          </template>
        </EditorColorPicker>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('header-margin-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="cell"><span><SfIconArrowUpward /></span><input v-model.number="headerMarginState.top" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowDownward /></span><input v-model.number="headerMarginState.bottom" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowBack /></span><input v-model.number="headerMarginState.left" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowForward /></span><input v-model.number="headerMarginState.right" type="number" class="num" /></div>
        </div>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('header-padding-label') }}</UiFormLabel>
        <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
          <div class="cell"><span><SfIconArrowUpward /></span><input v-model.number="headerPaddingState.top" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowDownward /></span><input v-model.number="headerPaddingState.bottom" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowBack /></span><input v-model.number="headerPaddingState.left" type="number" class="num" /></div>
          <div class="cell"><span><SfIconArrowForward /></span><input v-model.number="headerPaddingState.right" type="number" class="num" /></div>
        </div>
      </div>
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import {
  SfInput,
  SfSwitch,
  SfIconCheck,
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import type { BoxSpacing, ImageGalleryContent } from '~/components/Gallery/types';
import type { Thumbnails, ImageGalleryFormProps } from '~/components/blocks/ImageGallery/types';

const props = defineProps<ImageGalleryFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const defaultSpacing = (): BoxSpacing => ({ top: 0, right: 0, bottom: 0, left: 0 });

const uiItemImageBlock = computed<ImageGalleryContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<ImageGalleryContent>;

  if (!content.thumbnails) content.thumbnails = {};
  if (content.thumbnails.showThumbnails === undefined) content.thumbnails.showThumbnails = true;
  if (!content.thumbnails.thumbnailType) content.thumbnails.thumbnailType = 'left-vertical';
  if (content.thumbnails.enableHoverZoom === undefined) content.thumbnails.enableHoverZoom = true;

  if (!content.layout) content.layout = {};
  if (content.layout.fullWidth === undefined) content.layout.fullWidth = false;
  if (!content.layout.backgroundColor) content.layout.backgroundColor = 'transparent';
  if (!content.layout.margin) content.layout.margin = defaultSpacing();
  if (!content.layout.padding) content.layout.padding = defaultSpacing();
  if (!content.layout.gradient) {
    content.layout.gradient = {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#e2e8f0',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }

  if (!content.header) content.header = {};
  if (content.header.subline === undefined) content.header.subline = '';
  if (content.header.headline === undefined) content.header.headline = '';
  if (!content.header.sublineColor) content.header.sublineColor = '#64748b';
  if (!content.header.headlineColor) content.header.headlineColor = '#0f172a';
  if (content.header.sublineFontSize === undefined) content.header.sublineFontSize = 16;
  if (content.header.headlineFontSize === undefined) content.header.headlineFontSize = 44;
  if (!content.header.backgroundColor) content.header.backgroundColor = 'transparent';
  if (!content.header.margin) content.header.margin = defaultSpacing();
  if (!content.header.padding) content.header.padding = defaultSpacing();
  if (!content.header.gradient) {
    content.header.gradient = {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#e2e8f0',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }

  return content as ImageGalleryContent;
});

const layoutState = computed(() => uiItemImageBlock.value.layout);
const layoutGradientState = computed(() => {
  if (!layoutState.value.gradient) {
    layoutState.value.gradient = {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#e2e8f0',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }
  return layoutState.value.gradient;
});
const layoutMarginState = computed(() => {
  if (!layoutState.value.margin) layoutState.value.margin = defaultSpacing();
  return layoutState.value.margin;
});
const layoutPaddingState = computed(() => {
  if (!layoutState.value.padding) layoutState.value.padding = defaultSpacing();
  return layoutState.value.padding;
});

const headerState = computed(() => {
  if (!uiItemImageBlock.value.header) {
    uiItemImageBlock.value.header = {
      subline: '',
      headline: '',
      sublineColor: '#64748b',
      headlineColor: '#0f172a',
      sublineFontSize: 16,
      headlineFontSize: 44,
      backgroundColor: 'transparent',
      gradient: {
        enabled: false,
        type: 'linear',
        startColor: '#ffffff',
        endColor: '#e2e8f0',
        angle: 180,
        radius: 100,
        startX: 50,
        startY: 50,
      },
      margin: defaultSpacing(),
      padding: defaultSpacing(),
    };
  }
  return uiItemImageBlock.value.header;
});
const headerGradientState = computed(() => {
  if (!headerState.value.gradient) {
    headerState.value.gradient = {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#e2e8f0',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }
  return headerState.value.gradient;
});
const headerMarginState = computed(() => {
  if (!headerState.value.margin) headerState.value.margin = defaultSpacing();
  return headerState.value.margin;
});
const headerPaddingState = computed(() => {
  if (!headerState.value.padding) headerState.value.padding = defaultSpacing();
  return headerState.value.padding;
});

const { isFullWidth } = useFullWidthToggleForContent(uiItemImageBlock);

const thumbsOpen = ref(true);
const layoutOpen = ref(true);
const headerOpen = ref(false);
const thumbnails: Thumbnails = [
  {
    type: 'left-vertical',
    cdn: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/Blocks/preview-thumbs-left.png',
    label: getEditorTranslation('thumb-left-vertical'),
  },
  {
    type: 'right-vertical',
    cdn: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/Blocks/preview-thumbs-right.png',
    label: getEditorTranslation('thumb-right-vertical'),
  },
  {
    type: 'bottom',
    cdn: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/Blocks/preview-thumbs-bottom.png',
    label: getEditorTranslation('thumb-bottom'),
  },
];
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

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #fff;
}

.num {
  width: 3rem;
  text-align: center;
  outline: none;
}
</style>

<i18n lang="json">
{
  "en": {
    "item-image-label": "Item image",
    "show-thumbnails": "Show thumbnails",
    "thumbnail-type": "Thumbnail type",
    "enable-zoom-on-hover": "Enable zoom on hover",
    "thumb-left-vertical": "Left vertical strip",
    "thumb-right-vertical": "Right vertical strip",
    "thumb-bottom": "Bottom strip",
    "layout-label": "Layout",
    "background-color-label": "Background color",
    "gradient-enabled-label": "Enable gradient",
    "gradient-type-label": "Gradient type",
    "gradient-start-label": "Gradient start color",
    "gradient-end-label": "Gradient end color",
    "gradient-angle-label": "Gradient angle",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-size-label": "Subline size (px)",
    "headline-size-label": "Headline size (px)",
    "subline-color-label": "Subline color",
    "headline-color-label": "Headline color",
    "header-gradient-enabled-label": "Header gradient",
    "header-background-label": "Header background",
    "header-margin-label": "Header margin (px)",
    "header-padding-label": "Header padding (px)"
  },
  "de": {
    "item-image-label": "Item image",
    "show-thumbnails": "Show thumbnails",
    "thumbnail-type": "Thumbnail type",
    "enable-zoom-on-hover": "Enable zoom on hover",
    "thumb-left-vertical": "Left vertical strip",
    "thumb-right-vertical": "Right vertical strip",
    "thumb-bottom": "Bottom strip",
    "layout-label": "Layout",
    "background-color-label": "Hintergrundfarbe",
    "gradient-enabled-label": "Verlauf aktivieren",
    "gradient-type-label": "Verlaufstyp",
    "gradient-start-label": "Startfarbe Verlauf",
    "gradient-end-label": "Endfarbe Verlauf",
    "gradient-angle-label": "Verlaufswinkel",
    "margin-label": "Margin (px)",
    "padding-label": "Padding (px)",
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-size-label": "Subline Groesse (px)",
    "headline-size-label": "Headline Groesse (px)",
    "subline-color-label": "Subline Farbe",
    "headline-color-label": "Headline Farbe",
    "header-gradient-enabled-label": "Header Verlauf",
    "header-background-label": "Header Hintergrund",
    "header-margin-label": "Header Margin (px)",
    "header-padding-label": "Header Padding (px)"
  }
}
</i18n>
