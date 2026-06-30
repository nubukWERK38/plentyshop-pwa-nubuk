<template>
  <UiAccordionItem
    v-model="flagsOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('flags-label') }}</h2>
    </template>

    <div class="space-y-5 py-3">
      <div v-for="(flag, index) in blockContent.flags" :key="index" class="space-y-3 border-b pb-5 last:border-b-0">
        <div class="flex items-center justify-between gap-4">
          <UiFormLabel>{{ getEditorTranslation('flag-label', { number: index + 1 }) }}</UiFormLabel>
          <SfSwitch v-model="flag.visible" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('text-label') }}</UiFormLabel>
          <SfInput v-model="flag.label" type="text" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('link-label') }}</UiFormLabel>
          <SfInput v-model="flag.link" type="text" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('icon-label') }}</UiFormLabel>
          <SfInput v-model="flag.icon" type="text" />
        </div>
      </div>
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="layoutOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-label') }}</h2>
    </template>

    <div class="space-y-4 py-3">
      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('top-label') }}</UiFormLabel>
        <SfInput v-model.number="blockContent.top" type="number" min="0" />
      </div>

      <div v-for="colorField in colorFields" :key="colorField.key">
        <UiFormLabel class="mb-1">{{ colorField.label }}</UiFormLabel>
        <EditorColorPicker v-model="blockContent[colorField.key]" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="blockContent[colorField.key]" type="text">
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
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type { ContactFlagsContent, ContactFlagsFormProps } from './types';
import { createDefaultContactFlagsContent } from './defaults';

const props = defineProps<ContactFlagsFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const flagsOpen = ref(true);
const layoutOpen = ref(false);

const blockContent = computed<ContactFlagsContent>(() => {
  const block = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value);
  const defaults = createDefaultContactFlagsContent();
  const content = (block?.content ?? {}) as Partial<ContactFlagsContent>;

  content.flags = defaults.flags.map((defaultFlag, index) => ({
    ...defaultFlag,
    ...(content.flags?.[index] ?? {}),
  }));
  content.top = content.top ?? defaults.top;
  content.backgroundColor = content.backgroundColor ?? defaults.backgroundColor;
  content.textColor = content.textColor ?? defaults.textColor;
  content.iconColor = content.iconColor ?? defaults.iconColor;

  if (block) block.content = content as ContactFlagsContent;

  return content as ContactFlagsContent;
});

const colorFields: Array<{ key: 'backgroundColor' | 'textColor' | 'iconColor'; label: string }> = [
  { key: 'backgroundColor', label: getEditorTranslation('background-color-label') },
  { key: 'textColor', label: getEditorTranslation('text-color-label') },
  { key: 'iconColor', label: getEditorTranslation('icon-color-label') },
];
</script>

<i18n lang="json">
{
  "en": {
    "flags-label": "Flags",
    "flag-label": "Flag {number}",
    "text-label": "Text",
    "link-label": "Link",
    "icon-label": "Font Awesome icon class",
    "layout-label": "Layout",
    "top-label": "Distance from top in px",
    "background-color-label": "Background color",
    "text-color-label": "Text color",
    "icon-color-label": "Icon color"
  },
  "de": {
    "flags-label": "Fähnchen",
    "flag-label": "Fähnchen {number}",
    "text-label": "Text",
    "link-label": "Link",
    "icon-label": "Font-Awesome-Iconklasse",
    "layout-label": "Layout",
    "top-label": "Abstand von oben in px",
    "background-color-label": "Hintergrundfarbe",
    "text-color-label": "Textfarbe",
    "icon-color-label": "Iconfarbe"
  }
}
</i18n>
