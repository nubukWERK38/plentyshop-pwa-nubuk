<template>
  <div class="block-slider-edit" data-testid="image-text-slider-form">
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
            :data-testid="`image-text-slider-slide-tab-${index}`"
            @click="activeSlideIndex = index"
          >
            {{ getEditorTranslation('slide-label') }} {{ index + 1 }}
          </button>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
            data-testid="image-text-slider-add-slide"
            @click="addSlide"
          >
            {{ getEditorTranslation('add-slide-label') }}
          </button>

          <button
            type="button"
            class="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="sliderContent.slides.length <= 1"
            data-testid="image-text-slider-delete-slide"
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
          <SfInput v-model="activeSlide.image.alt" type="text" data-testid="image-text-slider-alt" />
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
          <SfInput v-model="activeSlide.text.subline" type="text" data-testid="image-text-slider-subline" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.headline" type="text" data-testid="image-text-slider-headline" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.ctaLabel" type="text" data-testid="image-text-slider-cta-label" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('cta-link-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.ctaLink" type="text" data-testid="image-text-slider-cta-link" />
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-bg-color-label') }}</UiFormLabel>
          <SfInput v-model="activeSlide.text.backgroundColor" type="text" data-testid="image-text-slider-bg-color" />
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
            data-testid="image-text-slider-image-position"
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
            data-testid="image-text-slider-desktop-text-alignment"
          >
            <option value="left">{{ getEditorTranslation('left-label') }}</option>
            <option value="center">{{ getEditorTranslation('center-label') }}</option>
            <option value="right">{{ getEditorTranslation('right-label') }}</option>
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
            data-testid="image-text-slider-mobile-text-alignment"
          >
            <option value="left">{{ getEditorTranslation('left-label') }}</option>
            <option value="center">{{ getEditorTranslation('center-label') }}</option>
            <option value="right">{{ getEditorTranslation('right-label') }}</option>
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
          <SfSwitch v-model="sliderContent.controls.showPagination" data-testid="image-text-slider-show-pagination" />
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-arrows-label') }}</UiFormLabel>
          <SfSwitch v-model="sliderContent.controls.showArrows" data-testid="image-text-slider-show-arrows" />
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-arrows-hover-label') }}</UiFormLabel>
          <SfSwitch
            v-model="sliderContent.controls.arrowsOnHover"
            :disabled="!sliderContent.controls.showArrows"
            data-testid="image-text-slider-show-arrows-hover"
          />
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch, SfIconCheck } from '@storefront-ui/vue';
import type { ImageTextSliderContent, ImageTextSliderFormProps, ImageTextSliderSlide, ImageTextSliderSpacing } from './types';

type ImageTarget = 'desktop' | 'mobile' | 'textBackground';

const props = defineProps<ImageTextSliderFormProps>();

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

const defaultSpacing = (): ImageTextSliderSpacing => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const defaultSlide = (): ImageTextSliderSlide => ({
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
    backgroundImage: '',
    backgroundColor: 'transparent',
  },
  desktop: {
    imagePosition: 'right',
    textAlignment: 'left',
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
    margin: defaultSpacing(),
    padding: {
      top: 20,
      right: 16,
      bottom: 20,
      left: 16,
    },
  },
});

const ensureSpacing = (spacing?: Partial<ImageTextSliderSpacing>): ImageTextSliderSpacing => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const ensureSlide = (slide?: Partial<ImageTextSliderSlide>): ImageTextSliderSlide => {
  const fallback = defaultSlide();
  return {
    image: {
      desktop: slide?.image?.desktop || fallback.image.desktop,
      mobile: slide?.image?.mobile || fallback.image.mobile,
      alt: slide?.image?.alt || '',
    },
    text: {
      subline: slide?.text?.subline || fallback.text.subline,
      headline: slide?.text?.headline || fallback.text.headline,
      ctaLabel: slide?.text?.ctaLabel || fallback.text.ctaLabel,
      ctaLink: slide?.text?.ctaLink || fallback.text.ctaLink,
      ctaVariant: slide?.text?.ctaVariant || fallback.text.ctaVariant,
      backgroundImage: slide?.text?.backgroundImage || '',
      backgroundColor: slide?.text?.backgroundColor || 'transparent',
    },
    desktop: {
      imagePosition: slide?.desktop?.imagePosition || fallback.desktop.imagePosition,
      textAlignment: slide?.desktop?.textAlignment || fallback.desktop.textAlignment,
      margin: ensureSpacing(slide?.desktop?.margin),
      padding: ensureSpacing(slide?.desktop?.padding ?? fallback.desktop.padding),
    },
    mobile: {
      textAlignment: slide?.mobile?.textAlignment || fallback.mobile.textAlignment,
      margin: ensureSpacing(slide?.mobile?.margin),
      padding: ensureSpacing(slide?.mobile?.padding ?? fallback.mobile.padding),
    },
  };
};

const ensureContent = (content?: Partial<ImageTextSliderContent>): ImageTextSliderContent => ({
  slides: Array.isArray(content?.slides) && content.slides.length > 0 ? content.slides.map(ensureSlide) : [defaultSlide()],
  controls: {
    showPagination: content?.controls?.showPagination !== false,
    showArrows: content?.controls?.showArrows !== false,
    arrowsOnHover: content?.controls?.arrowsOnHover === true,
  },
});

const sliderContent = computed<ImageTextSliderContent>(() => {
  const block = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value);
  const normalized = ensureContent((block?.content ?? {}) as Partial<ImageTextSliderContent>);

  if (block) {
    block.content = normalized as unknown as typeof block.content;
  }

  return normalized;
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
    "primary-label": "Primary",
    "secondary-label": "Secondary",
    "text-bg-color-label": "Text area background color",
    "desktop-layout-label": "Desktop layout",
    "mobile-layout-label": "Mobile layout",
    "mobile-layout-hint": "Mobile always uses two rows: image on top and text with CTA below.",
    "image-position-label": "Desktop position",
    "position-text-left-image-right": "Text left, image right",
    "position-image-left-text-right": "Image left, text right",
    "text-alignment-label": "Text alignment",
    "left-label": "Left",
    "center-label": "Center",
    "right-label": "Right",
    "margin-label": "Margin (top, right, bottom, left)",
    "padding-label": "Padding (top, right, bottom, left)",
    "controls-label": "Slider controls",
    "show-pagination-label": "Show pagination bars",
    "show-arrows-label": "Show modern arrows",
    "show-arrows-hover-label": "Show arrows only on hover"
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
    "primary-label": "Primary",
    "secondary-label": "Secondary",
    "text-bg-color-label": "Hintergrundfarbe Textbereich",
    "desktop-layout-label": "Desktop Layout",
    "mobile-layout-label": "Mobile Layout",
    "mobile-layout-hint": "Mobil werden immer zwei Zeilen genutzt: Bild oben, Text mit CTA unten.",
    "image-position-label": "Desktop Position",
    "position-text-left-image-right": "Text links, Bild rechts",
    "position-image-left-text-right": "Bild links, Text rechts",
    "text-alignment-label": "Textausrichtung",
    "left-label": "Links",
    "center-label": "Zentriert",
    "right-label": "Rechts",
    "margin-label": "Margin (oben, rechts, unten, links)",
    "padding-label": "Padding (oben, rechts, unten, links)",
    "controls-label": "Slider Steuerung",
    "show-pagination-label": "Pagination-Striche anzeigen",
    "show-arrows-label": "Moderne Pfeile anzeigen",
    "show-arrows-hover-label": "Pfeile nur bei Hover anzeigen"
  }
}
</i18n>
