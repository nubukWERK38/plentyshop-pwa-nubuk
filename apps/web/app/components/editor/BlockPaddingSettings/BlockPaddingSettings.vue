<template>
  <UiAccordionItem
    :model-value="true"
    summary-active-class="bg-neutral-100"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    content-padding-class="px-4 py-4"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-label') }}</h2>
    </template>

    <div class="py-2">
      <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
      <div class="grid grid-cols-4 gap-px rounded-md overflow-hidden border border-gray-300">
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowUpward /></span>
          <input v-model.number="paddingTop" type="number" class="w-12 text-center outline-none" />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowDownward /></span>
          <input v-model.number="paddingBottom" type="number" class="w-12 text-center outline-none" />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white border-r">
          <span><SfIconArrowBack /></span>
          <input v-model.number="paddingLeft" type="number" class="w-12 text-center outline-none" />
        </div>
        <div class="flex items-center justify-center gap-1 px-2 py-1 bg-white">
          <span><SfIconArrowForward /></span>
          <input v-model.number="paddingRight" type="number" class="w-12 text-center outline-none" />
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
import { SfIconArrowUpward, SfIconArrowDownward, SfIconArrowBack, SfIconArrowForward } from '@storefront-ui/vue';

type BlockPaddingSettings = {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

type PaddingKey = keyof BlockPaddingSettings;

const props = defineProps<{
  modelValue: BlockPaddingSettings;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: BlockPaddingSettings): void;
}>();

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const updatePadding = (key: PaddingKey, value: number) => {
  emit('update:modelValue', {
    paddingTop: toNumber(props.modelValue.paddingTop),
    paddingBottom: toNumber(props.modelValue.paddingBottom),
    paddingLeft: toNumber(props.modelValue.paddingLeft),
    paddingRight: toNumber(props.modelValue.paddingRight),
    [key]: toNumber(value),
  });
};

const createPaddingModel = (key: PaddingKey) =>
  computed({
    get: () => toNumber(props.modelValue[key]),
    set: (value: number) => updatePadding(key, value),
  });

const paddingTop = createPaddingModel('paddingTop');
const paddingBottom = createPaddingModel('paddingBottom');
const paddingLeft = createPaddingModel('paddingLeft');
const paddingRight = createPaddingModel('paddingRight');
</script>

<i18n lang="json">
{
  "en": {
    "layout-label": "Layout",
    "padding-label": "Padding",
    "spacing-around": "Spacing around the widget"
  },
  "de": {
    "layout-label": "Layout",
    "padding-label": "Padding",
    "spacing-around": "Abstand um das Widget"
  }
}
</i18n>
