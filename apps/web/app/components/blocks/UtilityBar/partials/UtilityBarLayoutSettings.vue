<template>
  <UiAccordionItem
    v-model="isOpen"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2 data-testid="utility-bar-layout-title">{{ getEditorTranslation('layout-label') }}</h2>
    </template>

    <div class="space-y-4 py-4">
      <div class="flex items-center justify-between">
        <UiFormLabel class="mb-1">{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
        <SfSwitch v-model="fullWidth" />
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('logo-height-label') }}</UiFormLabel>
        <input
          v-model.number="logoHeight"
          type="number"
          min="20"
          max="120"
          class="w-full rounded border border-gray-300 px-2 py-2"
          data-testid="logo-height"
        />
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('search-width-label') }}</UiFormLabel>
        <input
          v-model.number="searchWidth"
          type="number"
          min="200"
          max="1200"
          class="w-full rounded border border-gray-300 px-2 py-2"
          data-testid="search-width"
        />
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('header-bg-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="headerBackgroundColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="headerBackgroundColor" type="text">
              <template #suffix>
                <div
                  class="w-6 h-6 rounded border cursor-pointer"
                  :style="{ backgroundColor: color }"
                  @click="toggle"
                />
              </template>
            </SfInput>
          </template>
        </EditorColorPicker>
      </div>

      <div>
        <UiFormLabel class="mb-1">{{ getEditorTranslation('icon-color-label') }}</UiFormLabel>
        <EditorColorPicker v-model="iconColor" class="w-full">
          <template #trigger="{ color, toggle }">
            <SfInput v-model="iconColor" type="text" @click="toggle">
              <template #suffix>
                <div
                  class="w-6 h-6 rounded border cursor-pointer"
                  :style="{ backgroundColor: color }"
                  @click="toggle"
                />
              </template>
            </SfInput>
          </template>
        </EditorColorPicker>
      </div>
    </div>

    <div class="py-2">
      <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
      <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowUpward /></span>
          <input
            v-model.number="paddingTop"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-top"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowDownward /></span>
          <input
            v-model.number="paddingBottom"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-bottom"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowBack /></span>
          <input
            v-model.number="paddingLeft"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-left"
          />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
          <span><SfIconArrowForward /></span>
          <input
            v-model.number="paddingRight"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-right"
          />
        </div>
      </div>
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import {
  SfInput,
  SfSwitch,
  SfIconArrowDownward,
  SfIconArrowUpward,
  SfIconArrowBack,
  SfIconArrowForward,
} from '@storefront-ui/vue';
import type { UtilityBarFormProps } from '../types';

const props = defineProps<UtilityBarFormProps>();

const isOpen = defineModel<boolean>('open', { default: true });

const { content } = useUtilityBarState(props.uuid);

const headerBackgroundColor = computed({
  get: () => content.value.color?.backgroundColor ?? '',
  set: (newColor: string) => {
    content.value = {
      ...content.value,
      color: {
        ...content.value.color,
        backgroundColor: newColor,
      },
    };
  },
});

const iconColor = computed({
  get: () => content.value.color?.iconColor ?? '',
  set: (newColor: string) => {
    content.value = {
      ...content.value,
      color: {
        ...content.value.color,
        iconColor: newColor,
      },
    };
  },
});

const fullWidth = computed({
  get: () => content.value.layout?.fullWidth !== false,
  set: (newValue: boolean) => {
    content.value = { ...content.value, layout: { ...content.value.layout, fullWidth: newValue } };
  },
});

const logoHeight = computed({
  get: () => content.value.layout?.logoHeight ?? 40,
  set: (newValue: number) => {
    const next = Number.isFinite(newValue) ? Math.max(20, Math.min(120, newValue)) : 40;
    content.value = { ...content.value, layout: { ...content.value.layout, logoHeight: next } };
  },
});

const searchWidth = computed({
  get: () => content.value.layout?.searchWidth ?? 620,
  set: (newValue: number) => {
    const next = Number.isFinite(newValue) ? Math.max(200, Math.min(1200, newValue)) : 620;
    content.value = { ...content.value, layout: { ...content.value.layout, searchWidth: next } };
  },
});

const paddingTop = computed({
  get: () => content.value.layout?.paddingTop ?? 0,
  set: (newValue: number) => {
    content.value = { ...content.value, layout: { ...content.value.layout, paddingTop: newValue } };
  },
});

const paddingBottom = computed({
  get: () => content.value.layout?.paddingBottom ?? 0,
  set: (newValue: number) => {
    content.value = { ...content.value, layout: { ...content.value.layout, paddingBottom: newValue } };
  },
});

const paddingLeft = computed({
  get: () => content.value.layout?.paddingLeft ?? 0,
  set: (newValue: number) => {
    content.value = { ...content.value, layout: { ...content.value.layout, paddingLeft: newValue } };
  },
});

const paddingRight = computed({
  get: () => content.value.layout?.paddingRight ?? 0,
  set: (newValue: number) => {
    content.value = { ...content.value, layout: { ...content.value.layout, paddingRight: newValue } };
  },
});
</script>

<i18n lang="json">
{
  "en": {
    "layout-label": "Layout",
    "full-width-label": "Use Full Width",
    "logo-height-label": "Logo Height (px)",
    "search-width-label": "Search Width (px)",
    "header-bg-color-label": "Header Background Color",
    "icon-color-label": "Icon Color",
    "padding-label": "Padding (px)"
  },
  "de": {
    "layout-label": "Layout",
    "full-width-label": "Volle Breite nutzen",
    "logo-height-label": "Logo-Hoehe (px)",
    "search-width-label": "Suchbreite (px)",
    "header-bg-color-label": "Header Background Color",
    "icon-color-label": "Icon Color",
    "padding-label": "Padding (px)"
  }
}
</i18n>
