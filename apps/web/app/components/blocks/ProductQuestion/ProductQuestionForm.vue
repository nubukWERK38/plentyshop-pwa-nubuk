<template>
  <div>
    <UiAccordionItem
      v-model="textSettings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>Text</h2>
      </template>

      <div class="space-y-4 py-4">
        <label>
          <UiFormLabel>Titel</UiFormLabel>
          <SfInput v-model="productQuestion.text.title" type="text" />
        </label>
        <label>
          <UiFormLabel>Einleitung</UiFormLabel>
          <SfTextarea v-model="productQuestion.text.intro" class="w-full" />
        </label>
        <label>
          <UiFormLabel>Bestaetigungstext</UiFormLabel>
          <SfTextarea v-model="productQuestion.text.successText" class="w-full" />
        </label>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="layoutSettings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>Layout</h2>
      </template>

      <div class="flex justify-between my-5">
        <span>Als Accordion anzeigen</span>
        <SfSwitch v-model="isCollapsible" />
      </div>

      <div class="flex justify-between">
        <span>Anfangs geschlossen</span>
        <SfSwitch v-model="isInitiallyCollapsed" :disabled="!isCollapsible" />
      </div>

      <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch, SfTextarea } from '@storefront-ui/vue';
import type { ProductQuestionContent, ProductQuestionFormProps } from './types';

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const props = defineProps<ProductQuestionFormProps>();

const productQuestion = computed<ProductQuestionContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<ProductQuestionContent>;

  content.text = {
    title: content.text?.title ?? 'Noch Fragen?',
    intro:
      content.text?.intro ??
      'Wenn Du noch weitere Fragen zu diesem Artikel hast, kannst Du uns gerne ueber das folgende Formular benachrichtigen.',
    successText:
      content.text?.successText ?? 'Vielen Dank für Deine Anfrage. Wir melden uns schnellst möglich bei Dir. ',
  };

  content.layout = {
    displayAsCollapsable: content.layout?.displayAsCollapsable ?? false,
    initiallyCollapsed: content.layout?.initiallyCollapsed ?? false,
    fullWidth: content.layout?.fullWidth ?? false,
    paddingTop: content.layout?.paddingTop ?? 0,
    paddingBottom: content.layout?.paddingBottom ?? 0,
    paddingLeft: content.layout?.paddingLeft ?? 0,
    paddingRight: content.layout?.paddingRight ?? 0,
  };

  return content as ProductQuestionContent;
});

const { isFullWidth } = useFullWidthToggleForContent(productQuestion);

const textSettings = ref(true);
const layoutSettings = ref(false);
const isCollapsible = ref(productQuestion.value.layout.displayAsCollapsable);
const isInitiallyCollapsed = ref(productQuestion.value.layout.initiallyCollapsed);

watch(isCollapsible, (newValue) => {
  productQuestion.value.layout.displayAsCollapsable = newValue;
  if (!newValue) {
    isInitiallyCollapsed.value = false;
    productQuestion.value.layout.initiallyCollapsed = false;
  }
});

watch(isInitiallyCollapsed, (newValue) => {
  productQuestion.value.layout.initiallyCollapsed = newValue;
});
</script>
