<template>
  <div class="sticky h-[80vh] overflow-y-auto">
    <UiAccordionItem
      v-model="imageOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="open-image-text-box-form-images"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('images-label') }}</h2>
      </template>

      <div class="space-y-4 py-3">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('desktop-image-label') }}</UiFormLabel>
          <SfInput v-model="blockContent.image.desktop" type="text" :placeholder="getEditorTranslation('image-placeholder')" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('mobile-image-label') }}</UiFormLabel>
          <SfInput v-model="blockContent.image.mobile" type="text" :placeholder="getEditorTranslation('image-placeholder')" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('alt-label') }}</UiFormLabel>
          <SfInput v-model="blockContent.image.alt" type="text" :placeholder="getEditorTranslation('alt-placeholder')" />
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="textOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="open-image-text-box-form-text"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('text-label') }}</h2>
      </template>

      <div class="space-y-4 py-3">
        <EditorRichTextEditorForm
          :model-value="blockContent.text.html"
          :text-align="blockContent.text.alignX"
          @update:model-value="blockContent.text.html = $event"
        />

        <div>
          <UiFormLabel class="mb-2">{{ getEditorTranslation('position-label') }}</UiFormLabel>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="option in positionOptions"
              :key="option.value"
              type="button"
              class="input-field text-left"
              :class="{ 'bg-gray-100 font-semibold': blockContent.text.position === option.value }"
              @click="blockContent.text.position = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <template v-if="blockContent.text.position === 'inside'">
          <div>
            <UiFormLabel class="mb-2">{{ getEditorTranslation('inside-align-y-label') }}</UiFormLabel>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in alignYOptions"
                :key="option.value"
                type="button"
                class="input-field"
                :class="{ 'bg-gray-100 font-semibold': blockContent.text.alignY === option.value }"
                @click="blockContent.text.alignY = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div>
            <UiFormLabel class="mb-2">{{ getEditorTranslation('inside-align-x-label') }}</UiFormLabel>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in alignXOptions"
                :key="option.value"
                type="button"
                class="input-field"
                :class="{ 'bg-gray-100 font-semibold': blockContent.text.alignX === option.value }"
                @click="blockContent.text.alignX = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="buttonOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="open-image-text-box-form-button"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('button-label') }}</h2>
      </template>

      <div class="space-y-4 py-3">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('button-text-label') }}</UiFormLabel>
          <SfInput v-model="blockContent.button.label" type="text" :placeholder="getEditorTranslation('button-text-placeholder')" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('button-link-label') }}</UiFormLabel>
          <SfInput v-model="blockContent.button.link" type="text" :placeholder="getEditorTranslation('button-link-placeholder')" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('button-bg-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="blockContent.button.backgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="blockContent.button.backgroundColor" type="text">
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('button-text-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="blockContent.button.textColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="blockContent.button.textColor" type="text">
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
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { ImageTextBoxAlignX, ImageTextBoxAlignY, ImageTextBoxContent, ImageTextBoxFormProps, ImageTextBoxPosition } from './types';

const props = defineProps<ImageTextBoxFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const imageOpen = ref(true);
const textOpen = ref(false);
const buttonOpen = ref(false);

const defaultContent = (): ImageTextBoxContent => ({
  image: {
    desktop: '',
    mobile: '',
    alt: '',
  },
  text: {
    html: '',
    position: 'below',
    alignY: 'center',
    alignX: 'center',
  },
  button: {
    label: '',
    link: '',
    backgroundColor: '#111827',
    textColor: '#ffffff',
  },
});

const blockContent = computed<ImageTextBoxContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<ImageTextBoxContent>;

  if (!content.image) content.image = {};
  content.image.desktop = content.image.desktop ?? '';
  content.image.mobile = content.image.mobile ?? '';
  content.image.alt = content.image.alt ?? '';

  if (!content.text) content.text = {};
  content.text.html = content.text.html ?? '';
  content.text.position = (content.text.position ?? 'below') as ImageTextBoxPosition;
  content.text.alignY = (content.text.alignY ?? 'center') as ImageTextBoxAlignY;
  content.text.alignX = (content.text.alignX ?? 'center') as ImageTextBoxAlignX;

  if (!content.button) content.button = {};
  content.button.label = content.button.label ?? '';
  content.button.link = content.button.link ?? '';
  content.button.backgroundColor = content.button.backgroundColor ?? '#111827';
  content.button.textColor = content.button.textColor ?? '#ffffff';

  return content as ImageTextBoxContent;
});

onMounted(() => {
  const block = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value);
  if (block && !block.content) {
    block.content = defaultContent();
  }
});

const positionOptions: { value: ImageTextBoxPosition; label: string }[] = [
  { value: 'above', label: getEditorTranslation('position-above') },
  { value: 'below', label: getEditorTranslation('position-below') },
  { value: 'left', label: getEditorTranslation('position-left') },
  { value: 'right', label: getEditorTranslation('position-right') },
  { value: 'overlay', label: getEditorTranslation('position-overlay') },
  { value: 'inside', label: getEditorTranslation('position-inside') },
];

const alignYOptions: { value: ImageTextBoxAlignY; label: string }[] = [
  { value: 'top', label: getEditorTranslation('align-top') },
  { value: 'center', label: getEditorTranslation('align-center') },
  { value: 'bottom', label: getEditorTranslation('align-bottom') },
];

const alignXOptions: { value: ImageTextBoxAlignX; label: string }[] = [
  { value: 'left', label: getEditorTranslation('align-left') },
  { value: 'center', label: getEditorTranslation('align-center') },
  { value: 'right', label: getEditorTranslation('align-right') },
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
</style>

<i18n lang="json">
{
  "en": {
    "images-label": "Images",
    "desktop-image-label": "Desktop image",
    "mobile-image-label": "Mobile image",
    "image-placeholder": "Image URL",
    "alt-label": "Alt text",
    "alt-placeholder": "Describe the image",
    "text-label": "Text",
    "position-label": "Text position",
    "position-above": "Above image",
    "position-below": "Below image",
    "position-left": "Left of image",
    "position-right": "Right of image",
    "position-overlay": "Overlay on image edge",
    "position-inside": "Inside image",
    "inside-align-y-label": "Inside vertical alignment",
    "inside-align-x-label": "Inside horizontal alignment",
    "align-top": "Top",
    "align-center": "Center",
    "align-bottom": "Bottom",
    "align-left": "Left",
    "align-right": "Right",
    "button-label": "CTA Button",
    "button-text-label": "Link text",
    "button-text-placeholder": "Learn more",
    "button-link-label": "Link",
    "button-link-placeholder": "/target-path",
    "button-bg-color-label": "Button color",
    "button-text-color-label": "Button text color"
  },
  "de": {
    "images-label": "Bilder",
    "desktop-image-label": "Desktop-Bild",
    "mobile-image-label": "Mobile-Bild",
    "image-placeholder": "Bild-URL",
    "alt-label": "Alt-Text",
    "alt-placeholder": "Bildbeschreibung",
    "text-label": "Text",
    "position-label": "Textposition",
    "position-above": "Ueber dem Bild",
    "position-below": "Unter dem Bild",
    "position-left": "Links vom Bild",
    "position-right": "Rechts vom Bild",
    "position-overlay": "Ueber dem Bildrand",
    "position-inside": "Im Bild",
    "inside-align-y-label": "Vertikale Ausrichtung im Bild",
    "inside-align-x-label": "Horizontale Ausrichtung im Bild",
    "align-top": "Oben",
    "align-center": "Mitte",
    "align-bottom": "Unten",
    "align-left": "Links",
    "align-right": "Rechts",
    "button-label": "CTA-Button",
    "button-text-label": "Linktext",
    "button-text-placeholder": "Mehr erfahren",
    "button-link-label": "Link",
    "button-link-placeholder": "/ziel-pfad",
    "button-bg-color-label": "Button-Farbe",
    "button-text-color-label": "Button-Textfarbe"
  }
}
</i18n>
