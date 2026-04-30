<template>
  <UiAccordionItem
    v-model="textSettings"
    data-testid="open-text-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('text-group-label') }}</h2>
    </template>

    <EditorRichTextEditorForm
      v-model="contentModel"
      :text-align="textCardBlock.text.textAlignment"
      :placeholder="getEditorTranslation('placeholder')"
    />
  </UiAccordionItem>

  <UiAccordionItem
    v-model="buttonSettings"
    data-testid="button-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('button-group-label') }}</h2>
    </template>

    <div class="py-2">
      <div class="flex justify-between mb-2">
        <UiFormLabel>{{ getEditorTranslation('button-text-label') }}</UiFormLabel>
      </div>
      <label>
        <SfInput v-model="textCardBlock.button.label" type="text" data-testid="input-button-label">
          <template #suffix>
            <label for="text-button-label" class="rounded-lg cursor-pointer">
              <input id="text-button-label" v-model="textCardBlock.button.label" type="text" class="invisible w-8" />
            </label>
          </template>
        </SfInput>
      </label>
    </div>

    <div class="py-2">
      <div class="flex justify-between mb-2">
        <UiFormLabel>{{ getEditorTranslation('button-link-label') }}</UiFormLabel>
      </div>
      <label>
        <SfInput v-model="textCardBlock.button.link" type="text" data-testid="input-button-link">
          <template #suffix>
            <label for="text-button-link" class="rounded-lg cursor-pointer">
              <input id="text-button-link" v-model="textCardBlock.button.link" type="text" class="invisible w-8" />
            </label>
          </template>
        </SfInput>
      </label>
    </div>

    <fieldset class="py-2">
      <UiFormLabel>{{ getEditorTranslation('outline-label') }}</UiFormLabel>

      <div class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden">
        <div
          class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm"
          data-testid="button-outline-primary"
          :class="{ 'bg-gray-100 text-gray-900 font-semibold': textCardBlock.button.variant === 'primary' }"
          @click="textCardBlock.button.variant = 'primary'"
        >
          <SfIconCheck :class="{ invisible: textCardBlock.button.variant !== 'primary' }" class="mr-1 w-[1.1rem]" />
          {{ getEditorTranslation('button-variant-primary-label') }}
        </div>

        <div
          class="flex items-center justify-center w-1/2 px-4 py-2 cursor-pointer text-sm"
          data-testid="button-outline-secondary"
          :class="{ 'bg-gray-100 text-gray-900 font-semibold': textCardBlock.button.variant === 'secondary' }"
          @click="textCardBlock.button.variant = 'secondary'"
        >
          <SfIconCheck :class="{ invisible: textCardBlock.button.variant !== 'secondary' }" class="mr-1 w-[1.1rem]" />
          {{ getEditorTranslation('button-variant-secondary-label') }}
        </div>
      </div>
    </fieldset>

    <div class="py-2">
      <UiFormLabel class="mb-1">{{ getEditorTranslation('button-text-color-label') }}</UiFormLabel>
      <EditorColorPicker v-model="textCardBlock.button.textColor" class="w-full">
        <template #trigger="{ color, toggle }">
          <SfInput v-model="textCardBlock.button.textColor" type="text">
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

    <div class="py-2">
      <UiFormLabel class="mb-1">{{ getEditorTranslation('button-hover-text-color-label') }}</UiFormLabel>
      <EditorColorPicker v-model="textCardBlock.button.hoverTextColor" class="w-full">
        <template #trigger="{ color, toggle }">
          <SfInput v-model="textCardBlock.button.hoverTextColor" type="text">
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

    <div class="py-2">
      <div class="flex items-center justify-between">
        <UiFormLabel>{{ getEditorTranslation('button-gradient-enabled-label') }}</UiFormLabel>
        <SfSwitch v-model="buttonGradient.enabled" />
      </div>
    </div>

    <template v-if="buttonGradient.enabled">
      <div class="py-2">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('button-gradient-type-label') }}</UiFormLabel>
        <select v-model="buttonGradient.type" class="input-field">
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
      </div>

      <div class="py-2">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('button-gradient-start-label') }}</UiFormLabel>
        <EditorColorPicker v-model="buttonGradient.startColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="buttonGradient.startColor" type="text">
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

      <div class="py-2">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('button-gradient-end-label') }}</UiFormLabel>
        <EditorColorPicker v-model="buttonGradient.endColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="buttonGradient.endColor" type="text">
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

      <div v-if="buttonGradient.type === 'linear'" class="py-2">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('button-gradient-angle-label') }}</UiFormLabel>
        <input
          v-model.number="buttonGradient.angle"
          type="number"
          min="0"
          max="360"
          class="input-field"
        />
      </div>
    </template>

    <div v-else class="py-2">
      <UiFormLabel class="mb-1">{{ getEditorTranslation('button-background-color-label') }}</UiFormLabel>
      <EditorColorPicker v-model="textCardBlock.button.backgroundColor" class="w-full">
        <template #trigger="{ color, toggle }">
          <SfInput v-model="textCardBlock.button.backgroundColor" type="text">
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

    <div class="py-2">
      <UiFormLabel class="mb-1">{{ getEditorTranslation('button-hover-background-color-label') }}</UiFormLabel>
      <EditorColorPicker v-model="textCardBlock.button.hoverBackgroundColor" class="w-full">
        <template #trigger="{ color, toggle }">
          <SfInput v-model="textCardBlock.button.hoverBackgroundColor" type="text">
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
  </UiAccordionItem>

  <UiAccordionItem
    v-model="layoutSettings"
    data-testid="layout-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-group-label') }}</h2>
    </template>

    <div class="py-2 flex items-center justify-between gap-3">
      <UiFormLabel for="keep-transparent" class="m-0">
        {{ getEditorTranslation('keep-transparent-label') }}
      </UiFormLabel>

      <SfSwitch
        id="keep-transparent"
        v-model="isTransparent"
        data-testid="switch-keep-transparent"
        class="checked:bg-editor-button checked:before:hover:bg-editor-button checked:border-gray-500 checked:hover:border:bg-gray-700 hover:border-gray-700 hover:before:bg-gray-700 checked:hover:bg-gray-300 checked:hover:border-gray-400"
      />
    </div>

    <div v-if="!isTransparent" class="py-2">
      <div class="flex justify-between mb-2">
        <UiFormLabel>{{ getEditorTranslation('background-color-label') }}</UiFormLabel>
      </div>
      <EditorColorPicker v-model="backgroundColor" class="w-full">
        <template #trigger="{ color, toggle }">
          <label>
            <SfInput v-model="backgroundColor" type="text" data-testid="input-background-color">
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

    <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

    <div class="py-2">
      <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
      <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowUpward /></span>
          <input
            v-model.number="textCardBlock.layout.paddingTop"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-top"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowDownward /></span>
          <input
            v-model.number="textCardBlock.layout.paddingBottom"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-bottom"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowBack /></span>
          <input
            v-model.number="textCardBlock.layout.paddingLeft"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-left"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
          <span><SfIconArrowForward /></span>
          <input
            v-model.number="textCardBlock.layout.paddingRight"
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
import {
  SfInput,
  SfSwitch,
  SfIconCheck,
  SfIconArrowUpward,
  SfIconArrowDownward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import type { TextCardFormProps, TextCardContent } from './types';
const props = defineProps<TextCardFormProps>();

const { allBlocks: data } = useBlocks();

const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const textCardBlock = computed<TextCardContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<TextCardContent>;

  if (!content.text) content.text = {};
  content.text.pretitle = content.text.pretitle ?? '';
  content.text.title = content.text.title ?? '';
  content.text.subtitle = content.text.subtitle ?? '';
  content.text.htmlDescription = content.text.htmlDescription ?? '';
  content.text.color = content.text.color ?? '';
  content.text.textAlignment = content.text.textAlignment ?? 'left';

  if (!content.button) content.button = {};
  if (content.button.textColor === undefined) content.button.textColor = '';
  if (content.button.backgroundColor === undefined) content.button.backgroundColor = '';
  if (content.button.hoverTextColor === undefined) content.button.hoverTextColor = '';
  if (content.button.hoverBackgroundColor === undefined) content.button.hoverBackgroundColor = '';
  if (!content.button.backgroundGradient) {
    content.button.backgroundGradient = {
      enabled: false,
      type: 'linear',
      startColor: '#2563eb',
      endColor: '#1d4ed8',
      angle: 135,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }

  if (!content.layout) {
    content.layout = {
      backgroundColor: '',
      paddingTop: '0',
      paddingBottom: '0',
      paddingLeft: '0',
      paddingRight: '0',
      fullWidth: false,
    };
  }

  return content as TextCardContent;
});

const contentModel = computed<string>({
  get: () => decodeHtmlEntities(textCardBlock.value.text.htmlDescription ?? ''),
  set: (val: string) => {
    textCardBlock.value.text.htmlDescription = val ?? '';
  },
});

const { isFullWidth } = useFullWidthToggleForContent(textCardBlock);

const textSettings = ref(false);
const buttonSettings = ref(false);
const layoutSettings = ref(false);

const backgroundColorInit = textCardBlock.value.layout.backgroundColor;
const isTransparent = ref(!backgroundColorInit || backgroundColorInit === 'transparent');
const backgroundColor = ref(isTransparent.value ? '' : backgroundColorInit);

watch([isTransparent, backgroundColor], () => {
  textCardBlock.value.layout.backgroundColor = isTransparent.value ? 'transparent' : backgroundColor.value;
});

const buttonGradient = computed(() => {
  if (!textCardBlock.value.button.backgroundGradient) {
    textCardBlock.value.button.backgroundGradient = {
      enabled: false,
      type: 'linear',
      startColor: '#2563eb',
      endColor: '#1d4ed8',
      angle: 135,
      radius: 100,
      startX: 50,
      startY: 50,
    };
  }

  return textCardBlock.value.button.backgroundGradient;
});
</script>
<i18n lang="json">
{
  "en": {
    "text-group-label": "Text",
    "placeholder": "Enter text here...",

    "button-group-label": "Button",
    "button-text-label": "Label",
    "button-link-label": "Link target",
    "button-text-color-label": "Button text color",
    "button-hover-text-color-label": "Button hover text color",
    "button-background-color-label": "Button background color",
    "button-hover-background-color-label": "Button hover background color",
    "button-gradient-enabled-label": "Enable button gradient",
    "button-gradient-type-label": "Button gradient type",
    "button-gradient-start-label": "Button gradient start color",
    "button-gradient-end-label": "Button gradient end color",
    "button-gradient-angle-label": "Button gradient angle",
    "outline-label": "Outline",
    "button-variant-primary-label": "Primary",
    "button-variant-secondary-label": "Secondary",

    "layout-group-label": "Layout",
    "background-color-label": "Background Color",
    "padding-label": "Padding",
    "spacing-around": "Spacing around the text elements",
    "keep-transparent-label": "Keep background transparent"
  },
  "de": {
    "text-group-label": "Text",
    "placeholder": "Hier Text eingeben...",

    "button-group-label": "Button",
    "button-text-label": "Label",
    "button-link-label": "Link target",
    "button-text-color-label": "Button Textfarbe",
    "button-hover-text-color-label": "Button Hover Textfarbe",
    "button-background-color-label": "Button Hintergrundfarbe",
    "button-hover-background-color-label": "Button Hover Hintergrundfarbe",
    "button-gradient-enabled-label": "Button Verlauf aktivieren",
    "button-gradient-type-label": "Button Verlaufstyp",
    "button-gradient-start-label": "Button Startfarbe Verlauf",
    "button-gradient-end-label": "Button Endfarbe Verlauf",
    "button-gradient-angle-label": "Button Verlaufswinkel",
    "outline-label": "Outline",
    "button-variant-primary-label": "Primary",
    "button-variant-secondary-label": "Secondary",

    "layout-group-label": "Layout",
    "background-color-label": "Background Color",
    "padding-label": "Padding",
    "spacing-around": "Spacing around the text elements",
    "keep-transparent-label": "or keep transparent"
  }
}
</i18n>
