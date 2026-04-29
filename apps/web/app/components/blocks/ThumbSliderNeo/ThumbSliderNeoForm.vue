<template>
  <div data-testid="thumb-slider-neo-form" class="sticky h-[calc(100vh-52px)] overflow-y-auto">
    <UiAccordionItem
      v-model="headerOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('header-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-label') }}</UiFormLabel>
          <SfInput v-model="thumbContent.header.subline" type="text" class="w-full" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
          <SfInput v-model="thumbContent.header.headline" type="text" class="w-full" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-alignment-label') }}</UiFormLabel>
          <select v-model="thumbContent.header.sublineAlignment" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-alignment-label') }}</UiFormLabel>
          <select v-model="thumbContent.header.headlineAlignment" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.sublineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.sublineColor" type="text" class="w-full">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.headlineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.headlineColor" type="text" class="w-full">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.sublineBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.sublineBackgroundColor" type="text" class="w-full">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.headlineBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.headlineBackgroundColor" type="text" class="w-full">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-font-size-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.sublineFontSize" type="number" min="10" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-font-size-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.headlineFontSize" type="number" min="14" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-font-weight-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.sublineFontWeight" type="number" min="100" max="900" step="100" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-font-weight-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.headlineFontWeight" type="number" min="100" max="900" step="100" class="input-field" />
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="itemsOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('items-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div v-for="(item, index) in thumbContent.items" :key="`item-${index}`" class="rounded border p-3">
          <div class="mb-2 flex justify-between items-center">
            <p class="text-sm font-semibold">{{ getEditorTranslation('item-label') }} {{ index + 1 }}</p>
            <button type="button" class="text-xs text-red-600" @click="removeItem(index)">{{ getEditorTranslation('remove-label') }}</button>
          </div>

          <UiImagePicker
            :label="getEditorTranslation('image-label')"
            :image="item.image"
            :placeholder="placeholderImg"
            dimensions="400 x 220"
            selected-image-type="desktop"
            @add="(payload) => onAddImage(payload, index)"
            @delete="onDeleteImage(index)"
          />

          <div class="mt-2 space-y-2">
            <SfInput v-model="item.alt" type="text" :placeholder="getEditorTranslation('alt-label')" class="w-full" />
            <SfInput v-model="item.link" type="text" :placeholder="getEditorTranslation('link-label')" class="w-full" />
            <SfInput v-model="item.text" type="text" :placeholder="getEditorTranslation('text-label')" class="w-full" />
          </div>
        </div>

        <button type="button" class="action-btn" @click="addItem">{{ getEditorTranslation('add-item-label') }}</button>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="controlsOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('controls-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('autoplay-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.autoplay" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.fullWidth" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('delay-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.autoplayDelay" type="number" min="200" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('speed-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.speed" type="number" min="100" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-view-desktop-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.slidesPerViewDesktop" type="number" min="1" max="8" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-view-mobile-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.slidesPerViewMobile" type="number" min="1" max="4" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-group-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.slidesPerGroup" type="number" min="1" max="4" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-skew-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.tileSkew" type="number" min="-30" max="30" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-text-align-label') }}</UiFormLabel>
          <select v-model="thumbContent.controls.tileTextAlign" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.controls.tileBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.controls.tileBackgroundColor" type="text" class="w-full">
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
          <UiFormLabel>{{ getEditorTranslation('tile-gradient-enabled-label') }}</UiFormLabel>
          <SfSwitch v-model="tileGradientState.enabled" />
        </div>

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-type-label') }}</UiFormLabel>
          <select v-model="tileGradientState.type" class="input-field">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-label') }}</UiFormLabel>
          <EditorColorPicker v-model="tileGradientState.startColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="tileGradientState.startColor" type="text" class="w-full">
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

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-end-label') }}</UiFormLabel>
          <EditorColorPicker v-model="tileGradientState.endColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="tileGradientState.endColor" type="text" class="w-full">
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

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'linear'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-angle-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.angle" type="number" min="0" max="360" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-radius-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.radius" type="number" min="1" max="300" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-x-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.startX" type="number" min="0" max="100" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-y-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.startY" type="number" min="0" max="100" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-text-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.controls.tileTextColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.controls.tileTextColor" type="text" class="w-full">
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

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">{{ getEditorTranslation('tile-padding-label') }}</h3>
          <div>
            <UiFormLabel class="mb-1">Top</UiFormLabel>
            <input v-model.number="tilePaddingState.top" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Right</UiFormLabel>
            <input v-model.number="tilePaddingState.right" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Bottom</UiFormLabel>
            <input v-model.number="tilePaddingState.bottom" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Left</UiFormLabel>
            <input v-model.number="tilePaddingState.left" type="number" min="0" class="input-field" />
          </div>
        </div>

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">{{ getEditorTranslation('tile-text-padding-label') }}</h3>
          <div>
            <UiFormLabel class="mb-1">Top</UiFormLabel>
            <input v-model.number="tileTextPaddingState.top" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Right</UiFormLabel>
            <input v-model.number="tileTextPaddingState.right" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Bottom</UiFormLabel>
            <input v-model.number="tileTextPaddingState.bottom" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Left</UiFormLabel>
            <input v-model.number="tileTextPaddingState.left" type="number" min="0" class="input-field" />
          </div>
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type { ThumbSliderNeoContent, ThumbSliderNeoFormProps } from './types';

const props = defineProps<ThumbSliderNeoFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { placeholderImg } = usePickerHelper();

const defaultSpacing = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

const normalizeSpacing = (spacing?: Partial<ThumbSliderNeoContent['controls']['margin']>) => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const normalizeGradient = (gradient?: Partial<ThumbSliderNeoContent['controls']['tileGradient']>) => ({
  enabled: gradient?.enabled === true,
  type: gradient?.type ?? 'linear',
  startColor: gradient?.startColor ?? '#1f2937',
  endColor: gradient?.endColor ?? '#0f172a',
  angle: gradient?.angle ?? 135,
  radius: gradient?.radius ?? 100,
  startX: gradient?.startX ?? 50,
  startY: gradient?.startY ?? 50,
});

const defaultContent = (): ThumbSliderNeoContent => ({
  header: {
    subline: '',
    headline: '',
    sublineAlignment: 'left',
    headlineAlignment: 'left',
    sublineColor: '#64748b',
    headlineColor: '#0f172a',
    sublineBackgroundColor: 'transparent',
    headlineBackgroundColor: 'transparent',
    sublineFontSize: 16,
    headlineFontSize: 46,
    sublineFontWeight: 500,
    headlineFontWeight: 700,
    backgroundColor: 'transparent',
    gradient: {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#f8fafc',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    },
    margin: defaultSpacing(),
    padding: defaultSpacing(),
  },
  items: [
    {
      image: placeholderImg,
      alt: 'Marke',
      link: '/',
      text: '',
    },
  ],
  controls: {
    fullWidth: false,
    autoplay: false,
    autoplayDelay: 3500,
    speed: 600,
    slidesPerViewDesktop: 5,
    slidesPerViewMobile: 2,
    slidesPerGroup: 1,
    tileSkew: -8,
    tileBackgroundColor: '#111827',
    tileTextColor: '#ffffff',
    tileTextAlign: 'left',
    tileGradient: {
      enabled: false,
      type: 'linear',
      startColor: '#1f2937',
      endColor: '#0f172a',
      angle: 135,
      radius: 100,
      startX: 50,
      startY: 50,
    },
    tilePadding: defaultSpacing(),
    tileTextPadding: defaultSpacing(),
    margin: defaultSpacing(),
    padding: defaultSpacing(),
  },
});

const thumbContent = computed<ThumbSliderNeoContent>(() => {
  const uuid = props.uuid || blockUuid.value;
  const rawContent = findOrDeleteBlockByUuid(data.value, uuid)?.content as Partial<ThumbSliderNeoContent> | undefined;

  if (!rawContent) {
    const fallback = defaultContent();
    return fallback;
  }

  if (!rawContent.header) rawContent.header = defaultContent().header;
  if (!Array.isArray(rawContent.items) || rawContent.items.length === 0) rawContent.items = defaultContent().items;
  if (!rawContent.controls) rawContent.controls = defaultContent().controls;

  rawContent.header = {
    ...defaultContent().header,
    ...rawContent.header,
    gradient: normalizeGradient(rawContent.header.gradient),
    margin: normalizeSpacing(rawContent.header.margin),
    padding: normalizeSpacing(rawContent.header.padding),
  };

  rawContent.items = rawContent.items.map((item) => ({
    image: item?.image ?? '',
    alt: item?.alt ?? '',
    link: item?.link ?? '/',
    text: item?.text ?? '',
  }));

  rawContent.controls = {
    ...defaultContent().controls,
    ...rawContent.controls,
    tileGradient: normalizeGradient(rawContent.controls.tileGradient),
    tilePadding: normalizeSpacing(rawContent.controls.tilePadding),
    tileTextPadding: normalizeSpacing(rawContent.controls.tileTextPadding),
    margin: normalizeSpacing(rawContent.controls.margin),
    padding: normalizeSpacing(rawContent.controls.padding),
  };

  return rawContent as ThumbSliderNeoContent;
});

const headerOpen = ref(true);
const itemsOpen = ref(true);
const controlsOpen = ref(true);

const tileGradientState = computed(() => {
  if (!thumbContent.value.controls.tileGradient) {
    thumbContent.value.controls.tileGradient = normalizeGradient();
  }
  return thumbContent.value.controls.tileGradient;
});

const tilePaddingState = computed(() => {
  if (!thumbContent.value.controls.tilePadding) {
    thumbContent.value.controls.tilePadding = normalizeSpacing();
  }
  return thumbContent.value.controls.tilePadding;
});

const tileTextPaddingState = computed(() => {
  if (!thumbContent.value.controls.tileTextPadding) {
    thumbContent.value.controls.tileTextPadding = normalizeSpacing();
  }
  return thumbContent.value.controls.tileTextPadding;
});

const addItem = () => {
  thumbContent.value.items.push({ image: placeholderImg, alt: '', link: '/', text: '' });
};

const removeItem = (index: number) => {
  thumbContent.value.items.splice(index, 1);
};

const onAddImage = ({ image }: { image: string }, index: number) => {
  const item = thumbContent.value.items[index];
  if (!item) return;
  item.image = image;
};

const onDeleteImage = (index: number) => () => {
  const item = thumbContent.value.items[index];
  if (!item) return;
  item.image = '';
};
</script>

<style scoped>
.action-btn {
  width: 100%;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  background: #f0fdf4;
}

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
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-alignment-label": "Subline alignment",
    "headline-alignment-label": "Headline alignment",
    "alignment-left-label": "Left",
    "alignment-center-label": "Center",
    "alignment-right-label": "Right",
    "subline-color-label": "Subline color",
    "headline-color-label": "Headline color",
    "subline-background-label": "Subline background",
    "headline-background-label": "Headline background",
    "subline-font-size-label": "Subline font size (px)",
    "headline-font-size-label": "Headline font size (px)",
    "subline-font-weight-label": "Subline font weight",
    "headline-font-weight-label": "Headline font weight",
    "items-label": "Tiles",
    "item-label": "Tile",
    "add-item-label": "Add tile",
    "remove-label": "Remove",
    "image-label": "Image",
    "alt-label": "Alt text",
    "link-label": "Link",
    "text-label": "Text below tile",
    "controls-label": "Controls",
    "autoplay-label": "Autoplay",
    "full-width-label": "Full width",
    "delay-label": "Autoplay delay (ms)",
    "speed-label": "Slide speed (ms)",
    "slides-per-view-desktop-label": "Tiles per view (desktop)",
    "slides-per-view-mobile-label": "Tiles per view (mobile)",
    "slides-per-group-label": "Tiles per slide",
    "tile-skew-label": "Tile skew (deg)",
    "tile-text-align-label": "Tile text alignment",
    "tile-background-label": "Tile background",
    "tile-gradient-enabled-label": "Enable tile gradient",
    "tile-gradient-type-label": "Tile gradient type",
    "tile-gradient-start-label": "Tile gradient start color",
    "tile-gradient-end-label": "Tile gradient end color",
    "tile-gradient-angle-label": "Tile gradient angle",
    "tile-gradient-radius-label": "Tile gradient radius",
    "tile-gradient-start-x-label": "Tile gradient start X",
    "tile-gradient-start-y-label": "Tile gradient start Y",
    "tile-text-color-label": "Tile text color",
    "tile-padding-label": "Tile padding",
    "tile-text-padding-label": "Tile text padding"
  },
  "de": {
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-alignment-label": "Subline Ausrichtung",
    "headline-alignment-label": "Headline Ausrichtung",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "subline-color-label": "Subline Farbe",
    "headline-color-label": "Headline Farbe",
    "subline-background-label": "Subline Hintergrund",
    "headline-background-label": "Headline Hintergrund",
    "subline-font-size-label": "Subline Schriftgroesse (px)",
    "headline-font-size-label": "Headline Schriftgroesse (px)",
    "subline-font-weight-label": "Subline Font-Weight",
    "headline-font-weight-label": "Headline Font-Weight",
    "items-label": "Kacheln",
    "item-label": "Kachel",
    "add-item-label": "Kachel hinzufuegen",
    "remove-label": "Entfernen",
    "image-label": "Bild",
    "alt-label": "Alt-Text",
    "link-label": "Link",
    "text-label": "Text unter Kachel",
    "controls-label": "Steuerung",
    "autoplay-label": "Autoplay",
    "full-width-label": "Volle Breite",
    "delay-label": "Autoplay Delay (ms)",
    "speed-label": "Slide Geschwindigkeit (ms)",
    "slides-per-view-desktop-label": "Kacheln sichtbar (Desktop)",
    "slides-per-view-mobile-label": "Kacheln sichtbar (Mobile)",
    "slides-per-group-label": "Kacheln pro Slide",
    "tile-skew-label": "Kachel-Schraege (Grad)",
    "tile-text-align-label": "Kachel Textausrichtung",
    "tile-background-label": "Kachel Hintergrund",
    "tile-gradient-enabled-label": "Kachel Verlauf aktivieren",
    "tile-gradient-type-label": "Kachel Verlaufstyp",
    "tile-gradient-start-label": "Kachel Verlauf Startfarbe",
    "tile-gradient-end-label": "Kachel Verlauf Endfarbe",
    "tile-gradient-angle-label": "Kachel Verlauf Winkel",
    "tile-gradient-radius-label": "Kachel Verlauf Radius",
    "tile-gradient-start-x-label": "Kachel Verlauf Start X",
    "tile-gradient-start-y-label": "Kachel Verlauf Start Y",
    "tile-text-color-label": "Kachel Textfarbe",
    "tile-padding-label": "Kachel Padding",
    "tile-text-padding-label": "Kachel Text Padding"
  }
}
</i18n>
