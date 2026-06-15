<template>
  <UiAccordionItem
    v-model="itemsOpen"
    data-testid="tabs-items-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('items-group-label') }}</h2>
    </template>

    <div class="px-4 py-3">
      <UiButton class="w-full" data-testid="tabs-add-item" variant="secondary" @click="addItem">
        {{ getEditorTranslation('add-item-label') }}
      </UiButton>
    </div>

    <div v-for="(item, index) in tabsBlock.items" :key="index" class="px-4 py-3 border-t border-neutral-200">
      <div class="flex items-center justify-between mb-3">
        <UiFormLabel>{{ getEditorTranslation('item-label') }} {{ index + 1 }}</UiFormLabel>
        <div class="flex items-center gap-2">
          <UiButton
            size="sm"
            variant="tertiary"
            :data-testid="`tabs-move-up-${index}`"
            :disabled="index === 0"
            @click="moveItem(index, index - 1)"
          >
            {{ getEditorTranslation('move-up-label') }}
          </UiButton>
          <UiButton
            size="sm"
            variant="tertiary"
            :data-testid="`tabs-move-down-${index}`"
            :disabled="index === tabsBlock.items.length - 1"
            @click="moveItem(index, index + 1)"
          >
            {{ getEditorTranslation('move-down-label') }}
          </UiButton>
          <UiButton
            v-if="tabsBlock.items.length > 1"
            size="sm"
            variant="tertiary"
            :data-testid="`tabs-remove-item-${index}`"
            @click="removeItem(index)"
          >
            {{ getEditorTranslation('remove-item-label') }}
          </UiButton>
        </div>
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput
          v-model="item.title"
          type="text"
          :data-testid="`tabs-item-title-${index}`"
          :placeholder="getEditorTranslation('title-placeholder')"
        />
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('html-label') }}</UiFormLabel>
        <EditorRichTextEditorForm
          :model-value="decodeHtmlEntities(item.html ?? '')"
          :placeholder="getEditorTranslation('html-placeholder')"
          @update:model-value="updateItemHtml(index, $event)"
        />
      </div>
    </div>
  </UiAccordionItem>

  <UiAccordionItem
    v-model="layoutOpen"
    data-testid="tabs-layout-settings"
    summary-active-class="bg-neutral-100 border-t-0"
    summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
  >
    <template #summary>
      <h2>{{ getEditorTranslation('layout-group-label') }}</h2>
    </template>

    <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

    <div class="py-2 px-4">
      <UiFormLabel>{{ getEditorTranslation('additional-classes-label') }}</UiFormLabel>
      <SfInput
        v-model="tabsBlock.layout.additionalClasses"
        type="text"
        data-testid="tabs-additional-classes"
        :placeholder="getEditorTranslation('additional-classes-placeholder')"
      />
    </div>

    <div class="py-2 px-4">
      <UiFormLabel>{{ getEditorTranslation('html-id-label') }}</UiFormLabel>
      <SfInput
        v-model="tabsBlock.layout.htmlId"
        type="text"
        data-testid="tabs-html-id"
        :placeholder="getEditorTranslation('html-id-placeholder')"
      />
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import type { TabsContent, TabsFormProps } from './types';

const props = defineProps<TabsFormProps>();

const { allBlocks: data } = useBlocks();

const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const createDefaultItem = () => ({
  title: 'Tab item',
  html: '<p>Tab content</p>',
});

const tabsBlock = computed<TabsContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<TabsContent>;

  if (!Array.isArray(content.items) || content.items.length === 0) {
    content.items = [createDefaultItem()];
  }

  content.items.forEach((item, index) => {
    if (!item) {
      content.items![index] = { title: '', html: '' };
      return;
    }

    item.title = item.title ?? '';
    item.html = item.html ?? '';
  });

  if (!content.layout) {
    content.layout = {};
  }

  content.layout.fullWidth = content.layout.fullWidth ?? false;
  content.layout.additionalClasses = content.layout.additionalClasses ?? '';
  content.layout.htmlId = content.layout.htmlId ?? '';
  content.layout.paddingTop = content.layout.paddingTop ?? 0;
  content.layout.paddingBottom = content.layout.paddingBottom ?? 0;
  content.layout.paddingLeft = content.layout.paddingLeft ?? 0;
  content.layout.paddingRight = content.layout.paddingRight ?? 0;

  return content as TabsContent;
});

const updateItemHtml = (index: number, value: string) => {
  const item = tabsBlock.value.items[index];
  if (!item) return;
  item.html = value ?? '';
};

const addItem = () => {
  tabsBlock.value.items.push(createDefaultItem());
};

const removeItem = (index: number) => {
  if (tabsBlock.value.items.length <= 1) return;
  tabsBlock.value.items.splice(index, 1);
};

const moveItem = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= tabsBlock.value.items.length || fromIndex === toIndex) {
    return;
  }

  const items = tabsBlock.value.items;
  const movedItem = items[fromIndex];
  if (!movedItem) return;

  items.splice(fromIndex, 1);
  items.splice(toIndex, 0, movedItem);
};

const { isFullWidth } = useFullWidthToggleForContent(tabsBlock);

const itemsOpen = ref(true);
const layoutOpen = ref(true);
</script>

<i18n lang="json">
{
  "en": {
    "items-group-label": "Tabs",
    "add-item-label": "Add Item",
    "move-up-label": "Up",
    "move-down-label": "Down",
    "remove-item-label": "Remove",
    "item-label": "Item",
    "title-label": "Title",
    "title-placeholder": "Tab title",
    "html-label": "HTML Content",
    "html-placeholder": "Content that supports HTML formatting",
    "layout-group-label": "Layout",
    "additional-classes-label": "Additional Classes",
    "additional-classes-placeholder": "e.g. md:rounded-xl custom-tabs",
    "html-id-label": "HTML ID",
    "html-id-placeholder": "e.g. product-tabs"
  },
  "de": {
    "items-group-label": "Tabs",
    "add-item-label": "Element hinzufuegen",
    "move-up-label": "Hoch",
    "move-down-label": "Runter",
    "remove-item-label": "Entfernen",
    "item-label": "Element",
    "title-label": "Titel",
    "title-placeholder": "Tab Titel",
    "html-label": "HTML Inhalt",
    "html-placeholder": "Inhalt mit HTML-Formatierung",
    "layout-group-label": "Layout",
    "additional-classes-label": "Zusaetzliche Klassen",
    "additional-classes-placeholder": "z.B. md:rounded-xl custom-tabs",
    "html-id-label": "HTML-ID",
    "html-id-placeholder": "z.B. produkt-tabs"
  }
}
</i18n>
