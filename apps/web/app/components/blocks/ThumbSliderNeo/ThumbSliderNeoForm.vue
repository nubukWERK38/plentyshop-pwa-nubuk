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
          <SfInput v-model="thumbContent.header.subline" type="text" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
          <SfInput v-model="thumbContent.header.headline" type="text" />
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
        <button type="button" class="action-btn" @click="addItem">{{ getEditorTranslation('add-item-label') }}</button>

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
            <SfInput v-model="item.alt" type="text" :placeholder="getEditorTranslation('alt-label')" />
            <SfInput v-model="item.link" type="text" :placeholder="getEditorTranslation('link-label')" />
            <SfInput v-model="item.text" type="text" :placeholder="getEditorTranslation('text-label')" />
          </div>
        </div>
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

const defaultContent = (): ThumbSliderNeoContent => ({
  header: {
    subline: '',
    headline: '',
    sublineColor: '#64748b',
    headlineColor: '#0f172a',
    sublineFontSize: 16,
    headlineFontSize: 46,
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

  return rawContent as ThumbSliderNeoContent;
});

const headerOpen = ref(true);
const itemsOpen = ref(true);
const controlsOpen = ref(true);

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
    "tile-skew-label": "Tile skew (deg)"
  },
  "de": {
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
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
    "tile-skew-label": "Kachel-Schraege (Grad)"
  }
}
</i18n>
