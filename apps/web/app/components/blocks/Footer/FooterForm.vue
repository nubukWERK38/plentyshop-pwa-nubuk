<template>
  <div class="footer-settings-view sticky" data-testid="footer-settings-drawer">
    <UiAccordionItem
      v-model="layoutOpen"
      data-testid="footer-layout-section"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-group-label') }}</h2>
      </template>

      <div class="py-2">
        <UiImagePicker
          :image="footerLayout.backgroundImage || placeholderImage"
          :placeholder="placeholderImage"
          :label="getEditorTranslation('background-image-label')"
          dimensions="1920 x 650 px"
          selected-image-type="wideScreen"
          @add="handleBackgroundImageAdd"
          @delete="footerLayout.backgroundImage = ''"
        />
      </div>

      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('content-background-label') }}</UiFormLabel>
        </div>
        <EditorColorPicker v-model="footerLayout.contentBackground" class="w-full">
          <template #trigger="{ color, toggle }">
            <label>
              <SfInput v-model="footerLayout.contentBackground" type="text" data-testid="content-bg-color-select">
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

      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('content-opacity-label') }}</UiFormLabel>
        </div>
        <SfInput
          v-model.number="footerLayout.contentOpacity"
          type="number"
          min="0"
          max="1"
          step="0.05"
          data-testid="content-opacity-input"
        />
      </div>

      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('column-count-label') }}</UiFormLabel>
        </div>
        <SfInput
          v-model.number="columnCount"
          type="number"
          min="1"
          max="8"
          step="1"
          data-testid="footer-column-count-input"
        />
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-for="(column, index) in footerColumns"
      :key="index"
      v-model="columnOpen[index]"
      :data-testid="`footer-column-section-${index + 1}`"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('column-group-label') }} {{ index + 1 }}</h2>
      </template>

      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('column-title-label') }}</UiFormLabel>
        </div>
        <SfInput v-model="column.title" type="text" :data-testid="`input-title-column-${index + 1}`" />
      </div>

      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('column-width-label') }}</UiFormLabel>
        </div>
        <SfInput v-model="column.width" type="text" :data-testid="`input-width-column-${index + 1}`" />
        <p class="mt-1 text-xs text-neutral-500">{{ getEditorTranslation('column-width-hint') }}</p>
      </div>

      <div class="py-2">
        <div class="mb-2">
          <UiFormLabel>{{ getEditorTranslation('column-links-label') }}</UiFormLabel>
        </div>
        <div v-for="switchConfig in footerLinkSwitches" :key="switchConfig.id" class="flex justify-between mb-2">
          <UiFormLabel class="mb-1">{{ getEditorTranslation(switchConfig.translationKey) }}</UiFormLabel>
          <SfSwitch
            :model-value="column[switchConfig.key] === true"
            :data-testid="`column-${index + 1}-${switchConfig.id}`"
            class="checked:bg-editor-button checked:before:hover:bg-editor-button checked:border-gray-500 checked:hover:border:bg-gray-700 hover:border-gray-700 hover:before:bg-gray-700 checked:hover:bg-gray-300 checked:hover:border-gray-400"
            @update:model-value="setColumnSwitch(column, switchConfig.key, $event)"
          />
        </div>
      </div>

      <div v-if="enableContractWithdrawalButton" class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel class="mb-1">
            {{ getEditorTranslation('contract-withdrawal-button-label') }}
          </UiFormLabel>
          <SfSwitch
            v-model="column.showCancellationForm"
            :data-testid="`column-${index + 1}-withdrawal-button-switch`"
            class="checked:bg-editor-button checked:before:hover:bg-editor-button checked:border-gray-500 checked:hover:border:bg-gray-700 hover:border-gray-700 hover:before:bg-gray-700 checked:hover:bg-gray-300 checked:hover:border-gray-400"
          />
        </div>
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('column-html-label') }}</UiFormLabel>
        <EditorRichTextEditorForm
          :model-value="column.description ?? ''"
          :block-uuid="blockUuid"
          @update:model-value="column.description = $event"
        />
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="footNoteOpen"
      data-testid="footnote-column-section"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('footnotes-group-label') }}</h2>
      </template>
      <div class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation('footnotes-text-label') }}</UiFormLabel>
        </div>
        <SfInput v-model="footerContent.footnote" type="text" data-testid="input-footnote" />
      </div>
      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('footnotes-align-label') }}</UiFormLabel>

        <div class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden">
          <button
            v-for="option in footnoteAlignOptions"
            :key="option.value"
            type="button"
            class="flex items-center justify-center w-1/3 px-4 py-2 cursor-pointer text-sm"
            :class="{ 'bg-gray-100 text-gray-900 font-semibold': footerContent.footnoteAlign === option.value }"
            :data-testid="`footnoteAlign-textbox-y-align-${option.value}`"
            @click="footerContent.footnoteAlign = option.value"
          >
            <SfIconCheck class="mr-1 w-[1.1rem]" :class="{ invisible: footerContent.footnoteAlign !== option.value }" />
            {{ getEditorTranslation(option.label) }}
          </button>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="footerColors"
      data-testid="color-column-section"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('colors-group-label') }}</h2>
      </template>
      <div v-for="colorField in colorFields" :key="colorField.key" class="py-2">
        <div class="flex justify-between mb-2">
          <UiFormLabel>{{ getEditorTranslation(colorField.label) }}</UiFormLabel>
        </div>
        <EditorColorPicker v-model="footerContent.colors[colorField.key]" class="w-full">
          <template #trigger="{ color, toggle }">
            <label>
              <SfInput
                v-model="footerContent.colors[colorField.key]"
                type="text"
                :data-testid="`${colorField.key}-color-select`"
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
import { SfInput, SfSwitch, SfIconCheck } from '@storefront-ui/vue';
import type { FooterBlock, FooterColumn, FooterContent } from './types';
import { FOOTER_SWITCH_DEFINITIONS } from './constants';

const { footer } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { enableContractWithdrawalButton } = useRuntimeConfig().public;

const layoutOpen = ref(false);
const footNoteOpen = ref(false);
const footerColors = ref(false);
const columnOpen = ref<boolean[]>([]);
const placeholderImage = '/_nuxt-plenty/images/placeholder.png';

const footerBlock = computed(() => footer.value as FooterBlock);
const footerContent = computed(() => footerBlock.value?.content as FooterContent);

const legacyColumns = () => [
  footerContent.value.column1,
  footerContent.value.column2,
  footerContent.value.column3,
  footerContent.value.column4,
];

const ensureFooterShape = () => {
  if (!footerContent.value.layout) {
    footerContent.value.layout = {
      backgroundImage: '',
      contentBackground: '#161a16',
      contentOpacity: 0.88,
    };
  }

  if (!Array.isArray(footerContent.value.columns) || footerContent.value.columns.length === 0) {
    footerContent.value.columns = legacyColumns().map((column) => ({ ...column, width: column.width || '1fr' }));
  }
};

const footerColumns = computed<FooterColumn[]>(() => {
  ensureFooterShape();
  return footerContent.value.columns || [];
});

const footerLayout = computed(() => {
  ensureFooterShape();
  return footerContent.value.layout!;
});

const columnCount = computed({
  get: () => footerColumns.value.length,
  set: (value: number) => setColumnCount(value),
});

const setColumnCount = (value: number) => {
  ensureFooterShape();
  const nextCount = Math.max(1, Math.min(8, Number(value) || 1));
  const columns = footerContent.value.columns || [];

  while (columns.length < nextCount) {
    columns.push({ title: '', description: '', width: '1fr' });
  }

  if (columns.length > nextCount) {
    columns.splice(nextCount);
  }

  footerContent.value.columns = columns;
};

const footerLinkSwitches = FOOTER_SWITCH_DEFINITIONS.filter(
  (switchConfig) => !(enableContractWithdrawalButton && switchConfig.key === 'showCancellationForm'),
).map((switchConfig) => ({
  id: `${switchConfig.key}-switch`,
  key: switchConfig.key,
  translationKey: switchConfig.editorTranslationKey,
}));

const setColumnSwitch = (column: FooterColumn, key: string, value: unknown) => {
  column[key] = value === true;
};

const footnoteAlignOptions = [
  { value: 'left', label: 'footnotes-align-option-left-label' },
  { value: 'center', label: 'footnotes-align-option-center-label' },
  { value: 'right', label: 'footnotes-align-option-right-label' },
] as const;

const colorFields = [
  { key: 'text', label: 'colors-text-label' },
  { key: 'background', label: 'colors-background-label' },
  { key: 'footnoteText', label: 'colors-footnote-text-label' },
  { key: 'footnoteBackground', label: 'colors-footnote-background-label' },
] as const;

const handleBackgroundImageAdd = ({ image }: { image: string }) => {
  footerLayout.value.backgroundImage = image;
};
</script>

<i18n lang="json">
{
  "en": {
    "layout-group-label": "Layout",
    "background-image-label": "Background image",
    "content-background-label": "Content background colour",
    "content-opacity-label": "Content background opacity",
    "column-count-label": "Number of columns",
    "column-group-label": "Column",
    "column-title-label": "Title",
    "column-width-label": "Width",
    "column-width-hint": "Use CSS values like 1fr, 1.5fr, 280px or minmax(220px, 1fr).",
    "column-links-label": "Links",
    "column-html-label": "HTML content",
    "contract-withdrawal-button-label": "Show Contract Withdrawal Button",
    "column-1-terms-and-conditions-label": "Show Terms and Conditions link",
    "column-1-cancellation-rights-label": "Show Cancellation Rights link",
    "column-1-cancellation-form-label": "Show Cancellation Form link",
    "column-1-legal-disclosure-label": "Show Legal Disclosure link",
    "column-1-privacy-policy-label": "Show Privacy Policy link",
    "column-1-declaration-of-accessibility-label": "Show Declaration of Accessibility link",
    "column-2-contact-label": "Show Contact link",
    "column-2-register-label": "Show Register link",
    "footnotes-group-label": "Footnotes",
    "footnotes-text-label": "Footnotes text",
    "footnotes-align-label": "Footnote alignment",
    "footnotes-align-option-left-label": "Left",
    "footnotes-align-option-center-label": "Center",
    "footnotes-align-option-right-label": "Right",
    "colors-group-label": "Colour",
    "colors-text-label": "Text colour",
    "colors-background-label": "Fallback background colour",
    "colors-footnote-text-label": "Footnote text colour",
    "colors-footnote-background-label": "Footnote background colour"
  },
  "de": {
    "layout-group-label": "Layout",
    "background-image-label": "Hintergrundbild",
    "content-background-label": "Hintergrundfarbe Inhalt",
    "content-opacity-label": "Deckkraft Inhaltshintergrund",
    "column-count-label": "Anzahl der Spalten",
    "column-group-label": "Spalte",
    "column-title-label": "Titel",
    "column-width-label": "Breite",
    "column-width-hint": "CSS-Werte wie 1fr, 1.5fr, 280px oder minmax(220px, 1fr) verwenden.",
    "column-links-label": "Links",
    "column-html-label": "HTML-Inhalt",
    "contract-withdrawal-button-label": "Vertragsruecktritt-Button anzeigen",
    "column-1-terms-and-conditions-label": "AGB-Link anzeigen",
    "column-1-cancellation-rights-label": "Widerrufsrecht-Link anzeigen",
    "column-1-cancellation-form-label": "Widerrufsformular-Link anzeigen",
    "column-1-legal-disclosure-label": "Impressum-Link anzeigen",
    "column-1-privacy-policy-label": "Datenschutz-Link anzeigen",
    "column-1-declaration-of-accessibility-label": "Barrierefreiheitserklaerung-Link anzeigen",
    "column-2-contact-label": "Kontakt-Link anzeigen",
    "column-2-register-label": "Registrieren-Link anzeigen",
    "footnotes-group-label": "Fußnote",
    "footnotes-text-label": "Fußnotentext",
    "footnotes-align-label": "Ausrichtung Fußnote",
    "footnotes-align-option-left-label": "Links",
    "footnotes-align-option-center-label": "Zentriert",
    "footnotes-align-option-right-label": "Rechts",
    "colors-group-label": "Farben",
    "colors-text-label": "Textfarbe",
    "colors-background-label": "Fallback-Hintergrundfarbe",
    "colors-footnote-text-label": "Textfarbe Fußnote",
    "colors-footnote-background-label": "Hintergrundfarbe Fußnote"
  }
}
</i18n>
