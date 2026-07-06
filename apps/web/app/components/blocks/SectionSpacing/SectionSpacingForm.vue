<template>
  <UiAccordionItem
    v-model="settingsOpen"
    data-testid="section-spacing-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('settings-group-label') }}</h2>
    </template>

    <div class="px-4 py-3">
      <UiFormLabel>{{ getEditorTranslation('height-label') }}</UiFormLabel>
      <SfInput
        v-model.number="sectionSpacingBlock.height"
        type="number"
        min="0"
        step="1"
        data-testid="section-spacing-height"
      />
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { SectionSpacingContent, SectionSpacingFormProps } from './types';

const props = defineProps<SectionSpacingFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const sectionSpacingBlock = computed<SectionSpacingContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<SectionSpacingContent>;

  if (typeof content.height !== 'number') content.height = 60;

  return content as SectionSpacingContent;
});

const settingsOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "settings-group-label": "Spacing",
    "height-label": "Height in px"
  },
  "de": {
    "settings-group-label": "Abstand",
    "height-label": "Hoehe in px"
  }
}
</i18n>
