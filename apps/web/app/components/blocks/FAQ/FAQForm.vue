<template>
  <UiAccordionItem
    v-model="itemsOpen"
    data-testid="faq-items-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('items-group-label') }}</h2>
    </template>

    <div class="px-4 py-3">
      <UiFormLabel>{{ getEditorTranslation('title-label') }}</UiFormLabel>
      <SfInput v-model="faqBlock.text.title" type="text" data-testid="faq-title" />
    </div>

    <div class="px-4 py-3">
      <UiButton class="w-full" data-testid="faq-add-item" variant="secondary" @click="addItem">
        {{ getEditorTranslation('add-item-label') }}
      </UiButton>
    </div>

    <div v-for="(item, index) in faqBlock.items" :key="index" class="border-t border-neutral-200 px-4 py-3">
      <div class="mb-3 flex items-center justify-between gap-2">
        <UiFormLabel>{{ getEditorTranslation('item-label') }} {{ index + 1 }}</UiFormLabel>
        <div class="flex items-center gap-1">
          <UiButton
            size="sm"
            variant="tertiary"
            :disabled="index === 0"
            :data-testid="`faq-move-up-${index}`"
            @click="moveItem(index, index - 1)"
          >
            {{ getEditorTranslation('move-up-label') }}
          </UiButton>
          <UiButton
            size="sm"
            variant="tertiary"
            :disabled="index === faqBlock.items.length - 1"
            :data-testid="`faq-move-down-${index}`"
            @click="moveItem(index, index + 1)"
          >
            {{ getEditorTranslation('move-down-label') }}
          </UiButton>
          <UiButton
            v-if="faqBlock.items.length > 1"
            size="sm"
            variant="tertiary"
            :data-testid="`faq-remove-item-${index}`"
            @click="removeItem(index)"
          >
            {{ getEditorTranslation('remove-item-label') }}
          </UiButton>
        </div>
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('question-label') }}</UiFormLabel>
        <SfInput
          v-model="item.question"
          type="text"
          :data-testid="`faq-question-${index}`"
          :placeholder="getEditorTranslation('question-placeholder')"
        />
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('answer-label') }}</UiFormLabel>
        <EditorRichTextEditorForm
          :model-value="decodeHtmlEntities(item.answerHtml ?? '')"
          :placeholder="getEditorTranslation('answer-placeholder')"
          @update:model-value="updateAnswer(index, $event)"
        />
      </div>
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="layoutOpen"
    data-testid="faq-layout-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-group-label') }}</h2>
    </template>

    <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

    <div class="flex items-center justify-between px-4 py-3">
      <UiFormLabel for="faq-open-first" class="m-0">
        {{ getEditorTranslation('initially-open-first-label') }}
      </UiFormLabel>
      <SfSwitch id="faq-open-first" v-model="faqBlock.layout.initiallyOpenFirst" data-testid="faq-open-first" />
    </div>

    <div class="px-4 py-3">
      <UiFormLabel>{{ getEditorTranslation('padding-label') }}</UiFormLabel>
      <div class="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-gray-300">
        <div class="flex items-center justify-center gap-1 border-r bg-white px-2 py-1">
          <span><SfIconArrowUpward /></span>
          <input
            v-model.number="faqBlock.layout.paddingTop"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-top"
          />
        </div>
        <div class="flex items-center justify-center gap-1 border-r bg-white px-2 py-1">
          <span><SfIconArrowDownward /></span>
          <input
            v-model.number="faqBlock.layout.paddingBottom"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-bottom"
          />
        </div>
        <div class="flex items-center justify-center gap-1 border-r bg-white px-2 py-1">
          <span><SfIconArrowBack /></span>
          <input
            v-model.number="faqBlock.layout.paddingLeft"
            type="number"
            class="w-12 text-center outline-none"
            data-testid="padding-left"
          />
        </div>
        <div class="flex items-center justify-center gap-1 bg-white px-2 py-1">
          <span><SfIconArrowForward /></span>
          <input
            v-model.number="faqBlock.layout.paddingRight"
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
  SfIconArrowBack,
  SfIconArrowDownward,
  SfIconArrowForward,
  SfIconArrowUpward,
  SfInput,
  SfSwitch,
} from '@storefront-ui/vue';
import type { FAQContent, FAQFormProps } from './types';

const props = defineProps<FAQFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const createDefaultItem = () => ({
  question: '',
  answerHtml: '',
});

const faqBlock = computed<FAQContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<FAQContent>;

  if (!content.text) content.text = { title: '' };
  content.text.title = content.text.title ?? '';

  if (!Array.isArray(content.items) || content.items.length === 0) {
    content.items = [createDefaultItem()];
  }

  content.items.forEach((item, index) => {
    if (!item) {
      content.items![index] = createDefaultItem();
      return;
    }

    item.question = item.question ?? '';
    item.answerHtml = item.answerHtml ?? '';
  });

  if (!content.layout) content.layout = {};
  content.layout.fullWidth = content.layout.fullWidth ?? false;
  content.layout.initiallyOpenFirst = content.layout.initiallyOpenFirst ?? true;
  content.layout.paddingTop = content.layout.paddingTop ?? 0;
  content.layout.paddingBottom = content.layout.paddingBottom ?? 0;
  content.layout.paddingLeft = content.layout.paddingLeft ?? 0;
  content.layout.paddingRight = content.layout.paddingRight ?? 0;

  return content as FAQContent;
});

const { isFullWidth } = useFullWidthToggleForContent(faqBlock);

const updateAnswer = (index: number, value: string) => {
  const item = faqBlock.value.items[index];
  if (!item) return;
  item.answerHtml = value ?? '';
};

const addItem = () => {
  faqBlock.value.items.push(createDefaultItem());
};

const removeItem = (index: number) => {
  if (faqBlock.value.items.length <= 1) return;
  faqBlock.value.items.splice(index, 1);
};

const moveItem = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= faqBlock.value.items.length || fromIndex === toIndex) return;
  const item = faqBlock.value.items[fromIndex];
  if (!item) return;

  faqBlock.value.items.splice(fromIndex, 1);
  faqBlock.value.items.splice(toIndex, 0, item);
};

const itemsOpen = ref(true);
const layoutOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "items-group-label": "FAQ",
    "title-label": "Title",
    "add-item-label": "Add question",
    "item-label": "Question",
    "move-up-label": "Up",
    "move-down-label": "Down",
    "remove-item-label": "Remove",
    "question-label": "Question",
    "question-placeholder": "Enter question",
    "answer-label": "Answer",
    "answer-placeholder": "Enter answer",
    "layout-group-label": "Layout",
    "initially-open-first-label": "Open first question",
    "padding-label": "Padding"
  },
  "de": {
    "items-group-label": "FAQ",
    "title-label": "Titel",
    "add-item-label": "Frage hinzufuegen",
    "item-label": "Frage",
    "move-up-label": "Hoch",
    "move-down-label": "Runter",
    "remove-item-label": "Entfernen",
    "question-label": "Frage",
    "question-placeholder": "Frage eingeben",
    "answer-label": "Antwort",
    "answer-placeholder": "Antwort eingeben",
    "layout-group-label": "Layout",
    "initially-open-first-label": "Erste Frage geoeffnet",
    "padding-label": "Padding"
  }
}
</i18n>
