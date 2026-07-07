<template>
  <div>
    <UiAccordionItem
      v-model="textOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="category-data-text"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('item-card-label') }}</h2>
      </template>

      <div class="py-2">
        <div class="flex items-center justify-between px-2 pb-2 text-sm font-medium text-gray-700">
          <span>{{ getEditorTranslation('item-card-text') }}</span>
          <SfTooltip :label="getEditorTranslation('item-card-tooltip')" placement="top">
            <SfIconInfo size="base" class="ml-2 text-gray-500" />
          </SfTooltip>
        </div>

        <div v-for="field in categoryDataBlock.fieldsOrder" :key="field" class="flex items-center justify-between py-2">
          <span>{{ fieldLabels[field] }}</span>
          <SfSwitch
            v-model="categoryDataBlock.fields[field]"
            :disabled="categoryDataBlock.fieldsDisabled?.includes(field)"
            :data-testid="`category-data-field-${field}`"
          />
        </div>

        <div
          v-if="showTextHint"
          class="mx-4 mt-4 mb-4 flex items-start gap-2 text-sm text-neutral-600"
          role="alert"
          aria-live="polite"
          data-testid="fields-empty-hint"
        >
          <SfIconWarning class="mt-0.5 shrink-0 text-yellow-500" aria-hidden="true" />
          <span class="italic">
            {{ fieldsEmptyHintText }}
            (
            <a :href="learnMoreTextUrl" target="_blank" rel="noopener noreferrer" class="underline">
              {{ getEditorTranslation('learn-more') }}
            </a>
            ).
          </span>
        </div>

        <div class="py-2">
          <UiFormLabel>{{ getEditorTranslation('show-subcategories-label') }}</UiFormLabel>
          <div class="mt-2 flex items-center gap-6">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.showSubcategories" type="radio" :value="true" />
              <span>{{ getEditorTranslation('show-subcategories-yes') }}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.showSubcategories" type="radio" :value="false" />
              <span>{{ getEditorTranslation('show-subcategories-no') }}</span>
            </label>
          </div>
        </div>

        <div v-if="categoryDataBlock.showSubcategories" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('subcategories-source-label') }}</UiFormLabel>
          <div class="mt-2 flex items-center gap-6">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.subcategoryMode" type="radio" value="default" />
              <span>{{ getEditorTranslation('source-default') }}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.subcategoryMode" type="radio" value="manual" />
              <span>{{ getEditorTranslation('source-manual') }}</span>
            </label>
          </div>
        </div>

        <div v-if="categoryDataBlock.showSubcategories && categoryDataBlock.subcategoryMode === 'manual'" class="py-2">
          <div class="space-y-3">
            <div
              v-for="(subcategory, index) in categoryDataBlock.subcategories"
              :key="index"
              class="rounded border border-neutral-200 p-3"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">
                  {{ getEditorTranslation('subcategory-item-label') }} {{ index + 1 }}
                </span>
                <button
                  type="button"
                  class="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  :aria-label="getEditorTranslation('remove-link-label')"
                  @click="removeLinkItem('subcategories', index)"
                >
                  <SfIconDelete size="sm" />
                </button>
              </div>
              <SfInput
                v-model="subcategory.name"
                class="mb-2"
                type="text"
                :placeholder="getEditorTranslation('link-name-placeholder')"
              />
              <SfInput
                v-model="subcategory.link"
                type="text"
                :placeholder="getEditorTranslation('link-url-placeholder')"
              />
            </div>
          </div>
          <button type="button" class="mt-3 text-sm font-medium underline" @click="addLinkItem('subcategories')">
            {{ getEditorTranslation('add-subcategory-link-label') }}
          </button>
        </div>

        <div class="py-2">
          <UiFormLabel>{{ getEditorTranslation('show-brands-label') }}</UiFormLabel>
          <div class="mt-2 flex items-center gap-6">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.showBrands" type="radio" :value="true" />
              <span>{{ getEditorTranslation('show-subcategories-yes') }}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.showBrands" type="radio" :value="false" />
              <span>{{ getEditorTranslation('show-subcategories-no') }}</span>
            </label>
          </div>
        </div>

        <div v-if="categoryDataBlock.showBrands" class="py-2">
          <UiFormLabel>{{ getEditorTranslation('brands-source-label') }}</UiFormLabel>
          <div class="mt-2 flex items-center gap-6">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.brandMode" type="radio" value="default" />
              <span>{{ getEditorTranslation('source-default') }}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input v-model="categoryDataBlock.brandMode" type="radio" value="manual" />
              <span>{{ getEditorTranslation('source-manual') }}</span>
            </label>
          </div>
        </div>

        <div v-if="categoryDataBlock.showBrands && categoryDataBlock.brandMode === 'manual'" class="py-2">
          <div class="space-y-3">
            <div
              v-for="(brand, index) in categoryDataBlock.brands"
              :key="index"
              class="rounded border border-neutral-200 p-3"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">{{ getEditorTranslation('brand-item-label') }} {{ index + 1 }}</span>
                <button
                  type="button"
                  class="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  :aria-label="getEditorTranslation('remove-link-label')"
                  @click="removeLinkItem('brands', index)"
                >
                  <SfIconDelete size="sm" />
                </button>
              </div>
              <SfInput
                v-model="brand.name"
                class="mb-2"
                type="text"
                :placeholder="getEditorTranslation('link-name-placeholder')"
              />
              <SfInput v-model="brand.link" type="text" :placeholder="getEditorTranslation('link-url-placeholder')" />
            </div>
          </div>
          <button type="button" class="mt-3 text-sm font-medium underline" @click="addLinkItem('brands')">
            {{ getEditorTranslation('add-brand-link-label') }}
          </button>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="imageOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="category-data-image"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('image-label') }}</h2>
      </template>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('display-category-image-label') }}</UiFormLabel>
        <div class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden">
          <button
            v-for="option in imageOptions"
            :key="option"
            type="button"
            class="flex w-1/3 items-center justify-center border-r px-4 py-2 text-sm last:border-r-0"
            :class="{ 'bg-gray-100 font-semibold text-gray-900': categoryDataBlock.displayCategoryImage === option }"
            @click="categoryDataBlock.displayCategoryImage = option"
          >
            <SfIconCheck
              :class="{ invisible: categoryDataBlock.displayCategoryImage !== option }"
              class="mr-1 w-[1.1rem]"
            />
            {{ getEditorTranslation(option) }}
          </button>
        </div>
      </div>

      <div
        v-if="showImageSlotHint"
        class="mx-4 mt-4 mb-4 flex items-start gap-2 text-sm text-neutral-600"
        role="alert"
        aria-live="polite"
        data-testid="image-slot-empty-hint"
      >
        <SfIconWarning class="mt-0.5 shrink-0 text-yellow-500" aria-hidden="true" />
        <span class="italic">
          {{ getEditorTranslation('image-slot-empty-hint-prefix') }}
          <a :href="learnMoreUrl" target="_blank" rel="noopener noreferrer" class="underline">
            {{ getEditorTranslation('learn-more') }} </a
          >.
        </span>
      </div>

      <div v-if="categoryDataBlock.displayCategoryImage !== 'off'" class="py-2">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('image-alt-label') }}</UiFormLabel>
        <SfInput v-model="categoryDataBlock.image.alt" name="alt" type="text" data-testid="slide-alt-text" />
        <div class="typography-text-xs text-gray-500 flex gap-1 mt-2 sm:mb-0">
          {{ getEditorTranslation('image-alt-hint') }}
        </div>
      </div>

      <div v-if="categoryDataBlock.displayCategoryImage !== 'off'" class="py-2">
        <UiFormLabel>{{ getEditorTranslation('image-scalling-label') }}</UiFormLabel>
        <div class="mt-2 w-full inline-flex rounded-lg border border-gray-300 bg-white text-gray-700 overflow-hidden">
          <button
            v-for="option in fillModeOptions"
            :key="option"
            type="button"
            class="flex w-1/2 items-center justify-center border-r px-4 py-2 text-sm last:border-r-0"
            :class="{ 'bg-gray-100 font-semibold text-gray-900': categoryDataBlock.image.fillMode === option }"
            @click="categoryDataBlock.image.fillMode = option"
          >
            <SfIconCheck :class="{ invisible: categoryDataBlock.image.fillMode !== option }" class="mr-1 w-[1.1rem]" />
            {{ getEditorTranslation(`image-scalling-${option}-label`) }}
          </button>
        </div>
      </div>

      <div v-if="categoryDataBlock.displayCategoryImage !== 'off'" class="py-2">
        <UiFormLabel>{{ getEditorTranslation('image-brightness-label') }}</UiFormLabel>
        <input
          v-model.number="categoryDataBlock.image.brightness"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="w-full"
          @input="clampBrightness($event, 'image')"
        />
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="layoutOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
      data-testid="category-data-layout"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-label') }}</h2>
      </template>

      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import type { CategoryDataLinkItem } from './types';
import { SfIconCheck, SfIconDelete, SfIconInfo, SfIconWarning, SfInput, SfSwitch, SfTooltip } from '@storefront-ui/vue';

const layoutOpen = ref(true);
const textOpen = ref(true);
const imageOpen = ref(true);

const {
  learnMoreUrl,
  learnMoreTextUrl,
  categoryDataBlock,
  fieldLabels,
  showImageSlotHint,
  showTextHint,
  fieldsEmptyHintText,
  clampBrightness,
} = useCategoryData();

const { blockUuid } = useSiteConfiguration();
const { isFullWidth } = useFullWidthToggleForContent(categoryDataBlock);

const imageOptions = ['off', 'image-1', 'image-2'] as const;
const fillModeOptions = ['fit', 'fill'] as const;

const addLinkItem = (key: 'subcategories' | 'brands') => {
  const items = categoryDataBlock.value[key] as CategoryDataLinkItem[];
  items.push({ name: '', link: '' });
};

const removeLinkItem = (key: 'subcategories' | 'brands', index: number) => {
  const items = categoryDataBlock.value[key] as CategoryDataLinkItem[];
  items.splice(index, 1);
};
</script>

<i18n lang="json">
{
  "en": {
    "layout-label": "Layout",
    "item-card-label": "Category text",
    "item-card-text": "Text display and order",
    "item-card-tooltip": "You can manage the descriptions of categories inside the PlentyONE Backend UI found under Item > Category.",
    "category-name": "Category name",
    "category-description-1": "Category description 1",
    "category-description-2": "Category description 2",
    "short-description": "Short description",
    "show-subcategories-label": "Show direct subcategories",
    "show-subcategories-yes": "Yes",
    "show-subcategories-no": "No",
    "subcategories-source-label": "Subcategory source",
    "source-default": "Default",
    "source-manual": "Manual",
    "subcategory-item-label": "Subcategory",
    "show-brands-label": "Show brands",
    "brands-source-label": "Brand source",
    "brand-item-label": "Brand",
    "link-name-placeholder": "Name",
    "link-url-placeholder": "Link",
    "add-subcategory-link-label": "Add subcategory",
    "add-brand-link-label": "Add brand",
    "remove-link-label": "Remove",
    "image-label": "Image",
    "display-category-image-label": "Display category image",
    "off": "Off",
    "image-1": "Image 1",
    "image-2": "Image 2",
    "image-scalling-label": "Image scaling",
    "image-scalling-fit-label": "Fit",
    "image-scalling-fill-label": "Fill",
    "image-brightness-label": "Brightness",
    "image-alt-label": "Alt text",
    "image-alt-hint": "Alternative image text",
    "field-empty-hint-prefix": "The field {field} has no content",
    "fields-empty-hint-prefix": "The fields {fields} have no content",
    "image-slot-empty-hint-prefix": "The selected image slot does not have a linked image",
    "learn-more": "learn more"
  },
  "de": {
    "layout-label": "Layout",
    "item-card-label": "Kategorietext",
    "item-card-text": "Textanzeige und Reihenfolge",
    "item-card-tooltip": "Du kannst die Beschreibungen der Kategorien in der PlentyONE Backend UI unter Artikel > Kategorie verwalten.",
    "category-name": "Kategoriename",
    "category-description-1": "Kategoriebeschreibung 1",
    "category-description-2": "Kategoriebeschreibung 2",
    "short-description": "Kurzbeschreibung",
    "show-subcategories-label": "Direkte Unterkategorien anzeigen",
    "show-subcategories-yes": "Ja",
    "show-subcategories-no": "Nein",
    "subcategories-source-label": "Quelle der Unterkategorien",
    "source-default": "Standard",
    "source-manual": "Manuell",
    "subcategory-item-label": "Unterkategorie",
    "show-brands-label": "Marken anzeigen",
    "brands-source-label": "Markenquelle",
    "brand-item-label": "Marke",
    "link-name-placeholder": "Name",
    "link-url-placeholder": "Link",
    "add-subcategory-link-label": "Unterkategorie hinzufuegen",
    "add-brand-link-label": "Marke hinzufuegen",
    "remove-link-label": "Entfernen",
    "image-label": "Bild",
    "display-category-image-label": "Kategoriebild anzeigen",
    "off": "Aus",
    "image-1": "Bild 1",
    "image-2": "Bild 2",
    "image-scalling-label": "Bildskalierung",
    "image-scalling-fit-label": "Einpassen",
    "image-scalling-fill-label": "Fuellen",
    "image-brightness-label": "Helligkeit",
    "image-alt-label": "Alt-Text",
    "image-alt-hint": "Alternativer Bildtext",
    "field-empty-hint-prefix": "Das Feld {field} enthaelt keinen Inhalt",
    "fields-empty-hint-prefix": "Die Felder {fields} enthalten keinen Inhalt",
    "image-slot-empty-hint-prefix": "Der ausgewaehlte Bild-Slot hat kein verknuepftes Bild",
    "learn-more": "Mehr erfahren"
  }
}
</i18n>
