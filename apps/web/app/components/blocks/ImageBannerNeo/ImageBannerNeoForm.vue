<template>
  <div class="block-slider-edit" data-testid="image-banner-neo-form">
    <UiAccordionItem
      v-model="slidesOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('slides-label') }}</h2>
      </template>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(_, index) in sliderContent.slides"
            :key="`slide-tab-${index}`"
            type="button"
            class="rounded-md border px-3 py-1 text-sm"
            :class="index === activeSlideIndex ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-300'"
            :data-testid="`image-banner-neo-slide-tab-${index}`"
            @click="activeSlideIndex = index"
          >
            {{ getEditorTranslation('slide-label') }} {{ index + 1 }}
          </button>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
            data-testid="image-banner-neo-add-slide"
            @click="addSlide"
          >
            {{ getEditorTranslation('add-slide-label') }}
          </button>

          <button
            type="button"
            class="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="sliderContent.slides.length <= 1"
            data-testid="image-banner-neo-delete-slide"
            @click="removeActiveSlide"
          >
            {{ getEditorTranslation('remove-slide-label') }}
          </button>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="imagesOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('images-label') }}</h2>
      </template>

      <div v-if="activeSlide" class="space-y-2">
        <UiImagePicker
          :label="getEditorTranslation('desktop-image-label')"
          :image="activeSlide.image.desktop"
          :placeholder="placeholderImg"
          dimensions="1024 x 576"
          selected-image-type="desktop"
          @add="(payload) => handleImageAdd(payload, 'desktop')"
          @delete="deleteImageByKey('desktop')"
        />

        <UiImagePicker
          :label="getEditorTranslation('mobile-image-label')"
          :image="activeSlide.image.mobile"
          :placeholder="placeholderImg"
          dimensions="320 x 320"
          selected-image-type="mobile"
          @add="(payload) => handleImageAdd(payload, 'mobile')"
          @delete="deleteImageByKey('mobile')"
        />

        <UiImagePicker
          :label="getEditorTranslation('text-bg-image-label')"
          :image="activeSlide.text.backgroundImage"
          :placeholder="placeholderImg"
          dimensions="1024 x 576"
          selected-image-type="desktop"
          @add="(payload) => handleImageAdd(payload, 'textBackground')"
          @delete="deleteImageByKey('textBackground')"
        />

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('image-alt-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.image.alt" type="text" data-testid="image-banner-neo-alt" />
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="textOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('text-label') }}</h2>
      </template>

      <div v-if="activeSlide" class="space-y-4">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.subline" type="text" data-testid="image-banner-neo-subline" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.headline" type="text" data-testid="image-banner-neo-headline" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.ctaLabel" type="text" data-testid="image-banner-neo-cta-label" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-link-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.ctaLink" type="text" data-testid="image-banner-neo-cta-link" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-variant-label') }}</UiFormLabel>
          <div class="mt-2 inline-flex w-full overflow-hidden rounded-lg border border-gray-300 bg-white text-gray-700">
            <div
              class="flex w-1/2 cursor-pointer items-center justify-center px-4 py-2 text-sm border-r"
              :class="{ 'bg-gray-100 text-gray-900 font-semibold': activeSlide.text.ctaVariant === 'primary' }"
              @click="activeSlide.text.ctaVariant = 'primary'"
            >
              <SfIconCheck class="mr-1 w-[1.1rem]" :class="{ invisible: activeSlide.text.ctaVariant !== 'primary' }" />
              {{ getEditorTranslation('primary-label') }}
            </div>
            <div
              class="flex w-1/2 cursor-pointer items-center justify-center px-4 py-2 text-sm"
              :class="{ 'bg-gray-100 text-gray-900 font-semibold': activeSlide.text.ctaVariant === 'secondary' }"
              @click="activeSlide.text.ctaVariant = 'secondary'"
            >
              <SfIconCheck
                class="mr-1 w-[1.1rem]"
                :class="{ invisible: activeSlide.text.ctaVariant !== 'secondary' }"
              />
              {{ getEditorTranslation('secondary-label') }}
            </div>
          </div>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="activeSlide.text.ctaColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="activeSlide.text.ctaColor" type="text" data-testid="image-banner-neo-cta-color">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-text-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="activeSlide.text.ctaTextColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput
                v-model="activeSlide.text.ctaTextColor"
                type="text"
                data-testid="image-banner-neo-cta-text-color"
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

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-hover-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="activeSlide.text.ctaHoverColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput
                v-model="activeSlide.text.ctaHoverColor"
                type="text"
                data-testid="image-banner-neo-cta-hover-color"
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

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-bg-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="activeSlide.text.backgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="activeSlide.text.backgroundColor" type="text" data-testid="image-banner-neo-bg-color">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="activeSlide.text.sublineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="activeSlide.text.sublineColor" type="text" data-testid="image-banner-neo-subline-color">
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
          <EditorColorPicker v-model="activeSlide.text.headlineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="activeSlide.text.headlineColor" type="text" data-testid="image-banner-neo-headline-color">
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
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="desktopLayoutOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('desktop-layout-label') }}</h2>
      </template>

      <div v-if="activeSlide" class="space-y-4">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('image-position-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.desktop.imagePosition"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-image-position"
          >
            <option value="right">{{ getEditorTranslation('position-text-left-image-right') }}</option>
            <option value="left">{{ getEditorTranslation('position-image-left-text-right') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-alignment-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.desktop.textAlignment"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-desktop-text-alignment"
          >
            <option value="left">{{ getEditorTranslation('left-label') }}</option>
            <option value="center">{{ getEditorTranslation('center-label') }}</option>
            <option value="right">{{ getEditorTranslation('right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-position-x-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.desktop.textPositionX"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-desktop-position-x"
          >
            <option value="start">{{ getEditorTranslation('position-start-label') }}</option>
            <option value="center">{{ getEditorTranslation('position-center-label') }}</option>
            <option value="end">{{ getEditorTranslation('position-end-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-position-y-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.desktop.textPositionY"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-desktop-position-y"
          >
            <option value="start">{{ getEditorTranslation('position-start-label') }}</option>
            <option value="center">{{ getEditorTranslation('position-center-label') }}</option>
            <option value="end">{{ getEditorTranslation('position-end-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-2">{{ getEditorTranslation('margin-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="activeSlide.desktop.margin.top" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.margin.right" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.margin.bottom" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.margin.left" type="number" class="input-number" />
          </div>
        </div>

        <div>
          <UiFormLabel class="mb-2">{{ getEditorTranslation('padding-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="activeSlide.desktop.padding.top" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.padding.right" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.padding.bottom" type="number" class="input-number" />
            <input v-model.number="activeSlide.desktop.padding.left" type="number" class="input-number" />
          </div>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="mobileLayoutOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('mobile-layout-label') }}</h2>
      </template>

      <div v-if="activeSlide" class="space-y-4">
        <p class="text-xs text-gray-600">{{ getEditorTranslation('mobile-layout-hint') }}</p>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-alignment-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.mobile.textAlignment"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-mobile-text-alignment"
          >
            <option value="left">{{ getEditorTranslation('left-label') }}</option>
            <option value="center">{{ getEditorTranslation('center-label') }}</option>
            <option value="right">{{ getEditorTranslation('right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-position-x-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.mobile.textPositionX"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-mobile-position-x"
          >
            <option value="start">{{ getEditorTranslation('position-start-label') }}</option>
            <option value="center">{{ getEditorTranslation('position-center-label') }}</option>
            <option value="end">{{ getEditorTranslation('position-end-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-position-y-label') }}</UiFormLabel>
          <select
            v-model="activeSlide.mobile.textPositionY"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="image-banner-neo-mobile-position-y"
          >
            <option value="start">{{ getEditorTranslation('position-start-label') }}</option>
            <option value="center">{{ getEditorTranslation('position-center-label') }}</option>
            <option value="end">{{ getEditorTranslation('position-end-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-2">{{ getEditorTranslation('margin-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="activeSlide.mobile.margin.top" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.margin.right" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.margin.bottom" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.margin.left" type="number" class="input-number" />
          </div>
        </div>

        <div>
          <UiFormLabel class="mb-2">{{ getEditorTranslation('padding-label') }}</UiFormLabel>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="activeSlide.mobile.padding.top" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.padding.right" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.padding.bottom" type="number" class="input-number" />
            <input v-model.number="activeSlide.mobile.padding.left" type="number" class="input-number" />
          </div>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="controlsOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('controls-label') }}</h2>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-pagination-label') }}</UiFormLabel>
          <SfSwitch v-model="sliderContent.controls.showPagination" data-testid="image-banner-neo-show-pagination" />
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-arrows-label') }}</UiFormLabel>
          <SfSwitch v-model="sliderContent.controls.showArrows" data-testid="image-banner-neo-show-arrows" />
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-arrows-hover-label') }}</UiFormLabel>
          <SfSwitch
            v-model="sliderContent.controls.arrowsOnHover"
            :disabled="!sliderContent.controls.showArrows"
            data-testid="image-banner-neo-show-arrows-hover"
          />
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
          <SfSwitch v-model="sliderContent.controls.fullWidth" data-testid="image-banner-neo-full-width" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('height-label') }}</UiFormLabel>
          <div class="flex items-center gap-2">
            <input
              v-model.number="sliderContent.controls.height"
              type="range"
              min="200"
              max="900"
              step="10"
              class="flex-1"
              data-testid="image-banner-neo-height-slider"
            />
            <input
              v-model.number="sliderContent.controls.height"
              type="number"
              min="200"
              max="900"
              class="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
              data-testid="image-banner-neo-height-input"
            />
            <span class="text-sm text-gray-500">px</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('autoplay-label') }}</UiFormLabel>
          <SfSwitch v-model="sliderContent.controls.autoplay" data-testid="image-banner-neo-autoplay" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('autoplay-delay-label') }}</UiFormLabel>
          <div class="flex items-center gap-2">
            <input
              v-model.number="sliderContent.controls.autoplayDelay"
              type="number"
              min="500"
              max="30000"
              step="100"
              :disabled="!sliderContent.controls.autoplay"
              class="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
              data-testid="image-banner-neo-autoplay-delay"
            />
            <span class="text-sm text-gray-500">ms</span>
          </div>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('autoplay-speed-label') }}</UiFormLabel>
          <div class="flex items-center gap-2">
            <input
              v-model.number="sliderContent.controls.autoplaySpeed"
              type="number"
              min="100"
              max="5000"
              step="100"
              :disabled="!sliderContent.controls.autoplay"
              class="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
              data-testid="image-banner-neo-autoplay-speed"
            />
            <span class="text-sm text-gray-500">ms</span>
          </div>
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch, SfIconCheck } from '@storefront-ui/vue';
import type { ImageBannerNeoContent, ImageBannerNeoFormProps, ImageBannerNeoSlide, ImageBannerNeoSpacing } from './types';

type ImageTarget = 'desktop' | 'mobile' | 'textBackground';

const props = defineProps<ImageBannerNeoFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { placeholderImg } = usePickerHelper();

const slidesOpen = ref(true);
const imagesOpen = ref(true);
const textOpen = ref(true);
const desktopLayoutOpen = ref(true);
const mobileLayoutOpen = ref(false);
const controlsOpen = ref(true);

const activeSlideIndex = ref(0);

const defaultSpacing = (): ImageBannerNeoSpacing => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const defaultSlide = (): ImageBannerNeoSlide => ({
  image: {
    desktop: placeholderImg,
    mobile: placeholderImg,
    alt: '',
  },
  text: {
    subline: 'Subline',
    headline: 'Headline',
    ctaLabel: 'Jetzt entdecken',
    ctaLink: '/',
    ctaVariant: 'primary',
    ctaColor: '',
    ctaTextColor: '',
    ctaHoverColor: '',
    backgroundImage: '',
    backgroundColor: 'transparent',
    sublineColor: '#ffffff',
    headlineColor: '#ffffff',
  },
  desktop: {
    imagePosition: 'right',
    textAlignment: 'left',
    textPositionX: 'start',
    textPositionY: 'center',
    margin: defaultSpacing(),
    padding: {
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    },
  },
  mobile: {
    textAlignment: 'left',
    textPositionX: 'start',
    textPositionY: 'center',
    margin: defaultSpacing(),
    padding: {
      top: 20,
      right: 16,
      bottom: 20,
      left: 16,
    },
  },
});

const sliderContent = computed<ImageBannerNeoContent>(() => {
  const uuid = props.uuid || blockUuid.value;
  const rawContent = findOrDeleteBlockByUuid(data.value, uuid)?.content ?? {};
  const content = rawContent as Partial<ImageBannerNeoContent>;

  // Ensure slides array (in-place)
  if (!Array.isArray(content.slides) || content.slides.length === 0) {
    content.slides = [defaultSlide()];
  } else {
    for (const slide of content.slides) {
      const s = slide as Partial<ImageBannerNeoSlide>;
      if (!s.image) {
        s.image = { desktop: placeholderImg, mobile: placeholderImg, alt: '' };
      } else {
        if (!s.image.desktop) s.image.desktop = placeholderImg;
        if (!s.image.mobile) s.image.mobile = placeholderImg;
        if (s.image.alt === undefined) s.image.alt = '';
      }
      if (!s.text) {
        s.text = defaultSlide().text;
      } else {
        if (!s.text.subline) s.text.subline = 'Subline';
        if (!s.text.headline) s.text.headline = 'Headline';
        if (!s.text.ctaLabel) s.text.ctaLabel = 'Jetzt entdecken';
        if (!s.text.ctaLink) s.text.ctaLink = '/';
        if (!s.text.ctaVariant) s.text.ctaVariant = 'primary';
        if (s.text.ctaColor === undefined) s.text.ctaColor = '';
        if (s.text.ctaTextColor === undefined) s.text.ctaTextColor = '';
        if (s.text.ctaHoverColor === undefined) s.text.ctaHoverColor = '';
        if (s.text.backgroundImage === undefined) s.text.backgroundImage = '';
        if (s.text.backgroundColor === undefined) s.text.backgroundColor = 'transparent';
        if (!s.text.sublineColor) s.text.sublineColor = '#ffffff';
        if (!s.text.headlineColor) s.text.headlineColor = '#ffffff';
      }
      if (!s.desktop) {
        s.desktop = defaultSlide().desktop;
      } else {
        if (!s.desktop.imagePosition) s.desktop.imagePosition = 'right';
        if (!s.desktop.textAlignment) s.desktop.textAlignment = 'left';
        if (!s.desktop.textPositionX) s.desktop.textPositionX = 'start';
        if (!s.desktop.textPositionY) s.desktop.textPositionY = 'center';
        if (!s.desktop.margin) s.desktop.margin = defaultSpacing();
        if (!s.desktop.padding) s.desktop.padding = { top: 32, right: 32, bottom: 32, left: 32 };
      }
      if (!s.mobile) {
        s.mobile = defaultSlide().mobile;
      } else {
        if (!s.mobile.textAlignment) s.mobile.textAlignment = 'left';
        if (!s.mobile.textPositionX) s.mobile.textPositionX = 'start';
        if (!s.mobile.textPositionY) s.mobile.textPositionY = 'center';
        if (!s.mobile.margin) s.mobile.margin = defaultSpacing();
        if (!s.mobile.padding) s.mobile.padding = { top: 20, right: 16, bottom: 20, left: 16 };
      }
    }
  }

  // Ensure controls (in-place)
  if (!content.controls) {
    content.controls = { showPagination: true, showArrows: true, arrowsOnHover: false, height: 420, fullWidth: true, autoplay: false, autoplayDelay: 4000, autoplaySpeed: 500 };
  } else {
    if (content.controls.showPagination === undefined) content.controls.showPagination = true;
    if (content.controls.showArrows === undefined) content.controls.showArrows = true;
    if (content.controls.arrowsOnHover === undefined) content.controls.arrowsOnHover = false;
    if (content.controls.height === undefined) content.controls.height = 420;
    if (content.controls.fullWidth === undefined) content.controls.fullWidth = true;
    if (content.controls.autoplay === undefined) content.controls.autoplay = false;
    if (content.controls.autoplayDelay === undefined) content.controls.autoplayDelay = 4000;
    if (content.controls.autoplaySpeed === undefined) content.controls.autoplaySpeed = 500;
  }

  return rawContent as ImageBannerNeoContent;
});

const activeSlide = computed(() => sliderContent.value.slides[activeSlideIndex.value]);

const addSlide = () => {
  sliderContent.value.slides.push(defaultSlide());
  activeSlideIndex.value = sliderContent.value.slides.length - 1;
};

const removeActiveSlide = () => {
  if (sliderContent.value.slides.length <= 1) return;
  sliderContent.value.slides.splice(activeSlideIndex.value, 1);
  activeSlideIndex.value = Math.max(activeSlideIndex.value - 1, 0);
};

const handleImageAdd = ({ image }: { image: string; name: string; type: string }, target: ImageTarget) => {
  if (!activeSlide.value) return;

  if (target === 'textBackground') {
    activeSlide.value.text.backgroundImage = image;
    return;
  }

  activeSlide.value.image[target] = image;
};

const deleteImageByKey = (target: ImageTarget) => {
  if (!activeSlide.value) return;

  if (target === 'textBackground') {
    activeSlide.value.text.backgroundImage = '';
    return;
  }

  activeSlide.value.image[target] = placeholderImg;
};

watch(
  () => sliderContent.value.slides.length,
  (newLength) => {
    if (activeSlideIndex.value > newLength - 1) {
      activeSlideIndex.value = Math.max(newLength - 1, 0);
    }
  },
);
</script>

<style scoped>
.input-number {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "slides-label": "Slides",
    "slide-label": "Slide",
    "add-slide-label": "Add slide",
    "remove-slide-label": "Remove active slide",
    "images-label": "Images",
    "desktop-image-label": "Desktop image",
    "mobile-image-label": "Mobile image",
    "text-bg-image-label": "Text area background image",
    "image-alt-label": "Image alt text",
    "text-label": "Text & CTA",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "cta-label": "CTA label",
    "cta-link-label": "CTA link",
    "cta-variant-label": "CTA style",
    "cta-color-label": "CTA color",
    "cta-text-color-label": "CTA text color (optional)",
    "cta-hover-color-label": "CTA hover color (optional)",
    "primary-label": "Primary",
    "secondary-label": "Secondary",
    "text-bg-color-label": "Text area background color",
    "subline-color-label": "Subline color",
    "headline-color-label": "Headline color",
    "desktop-layout-label": "Desktop layout",
    "mobile-layout-label": "Mobile layout",
    "mobile-layout-hint": "Mobile always uses two rows: image on top and text with CTA below.",
    "image-position-label": "Desktop position",
    "position-text-left-image-right": "Text left, image right",
    "position-image-left-text-right": "Image left, text right",
    "text-alignment-label": "Text alignment",
    "text-position-x-label": "Text position X",
    "text-position-y-label": "Text position Y",
    "position-start-label": "Start",
    "position-center-label": "Center",
    "position-end-label": "End",
    "left-label": "Left",
    "center-label": "Center",
    "right-label": "Right",
    "margin-label": "Margin (top, right, bottom, left)",
    "padding-label": "Padding (top, right, bottom, left)",
    "controls-label": "Slider controls",
    "show-pagination-label": "Show pagination bars",
    "show-arrows-label": "Show modern arrows",
    "show-arrows-hover-label": "Show arrows only on hover",
    "full-width-label": "Full width (100vw)",
    "height-label": "Slider height",
    "autoplay-label": "Autoplay",
    "autoplay-delay-label": "Autoplay delay (pause between slides)",
    "autoplay-speed-label": "Transition speed"
  },
  "de": {
    "slides-label": "Slides",
    "slide-label": "Slide",
    "add-slide-label": "Slide hinzufügen",
    "remove-slide-label": "Aktiven Slide löschen",
    "images-label": "Bilder",
    "desktop-image-label": "Desktop-Bild",
    "mobile-image-label": "Mobile-Bild",
    "text-bg-image-label": "Hintergrundbild Textbereich",
    "image-alt-label": "Alt-Text Bild",
    "text-label": "Text & CTA",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "cta-label": "CTA Text",
    "cta-link-label": "CTA Link",
    "cta-variant-label": "CTA Stil",
    "cta-color-label": "CTA Farbe",
    "cta-text-color-label": "CTA-Textfarbe (optional)",
    "cta-hover-color-label": "CTA-Hoverfarbe (optional)",
    "primary-label": "Primary",
    "secondary-label": "Secondary",
    "text-bg-color-label": "Hintergrundfarbe Textbereich",
    "subline-color-label": "Subline-Farbe",
    "headline-color-label": "Headline-Farbe",
    "desktop-layout-label": "Desktop Layout",
    "mobile-layout-label": "Mobile Layout",
    "mobile-layout-hint": "Mobil werden immer zwei Zeilen genutzt: Bild oben, Text mit CTA unten.",
    "image-position-label": "Desktop Position",
    "position-text-left-image-right": "Text links, Bild rechts",
    "position-image-left-text-right": "Bild links, Text rechts",
    "text-alignment-label": "Textausrichtung",
    "text-position-x-label": "Textposition X",
    "text-position-y-label": "Textposition Y",
    "position-start-label": "Start",
    "position-center-label": "Mitte",
    "position-end-label": "Ende",
    "left-label": "Links",
    "center-label": "Zentriert",
    "right-label": "Rechts",
    "margin-label": "Margin (oben, rechts, unten, links)",
    "padding-label": "Padding (oben, rechts, unten, links)",
    "controls-label": "Slider Steuerung",
    "show-pagination-label": "Pagination-Striche anzeigen",
    "show-arrows-label": "Moderne Pfeile anzeigen",
    "show-arrows-hover-label": "Pfeile nur bei Hover anzeigen",
    "full-width-label": "Volle Breite (100vw)",
    "height-label": "Slider-Höhe",
    "autoplay-label": "Autoplay",
    "autoplay-delay-label": "Autoplay-Verzögerung (Pause zwischen Slides)",
    "autoplay-speed-label": "Übergangsgeschwindigkeit"
  }
}
</i18n>
