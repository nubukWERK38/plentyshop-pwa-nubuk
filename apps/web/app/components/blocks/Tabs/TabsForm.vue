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
          <UiButton size="sm" variant="tertiary" :data-testid="`tabs-move-up-${index}`" :disabled="index === 0" @click="moveItem(index, index - 1)">
            {{ getEditorTranslation('move-up-label') }}
          </UiButton>
          <UiButton size="sm" variant="tertiary" :data-testid="`tabs-move-down-${index}`" :disabled="index === tabsBlock.items.length - 1" @click="moveItem(index, index + 1)">
            {{ getEditorTranslation('move-down-label') }}
          </UiButton>
          <UiButton v-if="tabsBlock.items.length > 1" size="sm" variant="tertiary" :data-testid="`tabs-remove-item-${index}`" @click="removeItem(index)">
            {{ getEditorTranslation('remove-item-label') }}
          </UiButton>
        </div>
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('title-label') }}</UiFormLabel>
        <SfInput v-model="item.title" type="text" :data-testid="`tabs-item-title-${index}`" :placeholder="getEditorTranslation('title-placeholder')" />
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('html-label') }}</UiFormLabel>
        <EditorRichTextEditorForm :model-value="decodeHtmlEntities(item.html ?? '')" :placeholder="getEditorTranslation('html-placeholder')" @update:model-value="updateItemHtml(index, $event)" />
      </div>

      <div class="py-2">
        <UiFormLabel>{{ getEditorTranslation('blocks-label') }}</UiFormLabel>
        <div v-if="item.blocks && item.blocks.length > 0" class="mb-2 space-y-1">
          <div v-for="(block, blockIndex) in item.blocks" :key="block.meta?.uuid" class="flex items-center justify-between px-3 py-2 border border-neutral-200 rounded bg-neutral-50">
            <span class="text-sm text-neutral-700">{{ block.name }}</span>
            <div class="flex items-center gap-1">
              <UiButton size="sm" variant="tertiary" :disabled="blockIndex === 0" @click="moveTabBlock(index, blockIndex, blockIndex - 1)">{{ getEditorTranslation('move-up-label') }}</UiButton>
              <UiButton size="sm" variant="tertiary" :disabled="blockIndex === item.blocks!.length - 1" @click="moveTabBlock(index, blockIndex, blockIndex + 1)">{{ getEditorTranslation('move-down-label') }}</UiButton>
              <UiButton size="sm" variant="tertiary" @click="removeTabBlock(index, blockIndex)">{{ getEditorTranslation('remove-item-label') }}</UiButton>
            </div>
          </div>
        </div>
        <div v-if="blockPickerTabIndex === index" class="mb-2 border border-neutral-200 rounded bg-white max-h-60 overflow-y-auto">
          <button v-for="(category, catKey) in blocksLists" :key="catKey" type="button" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 border-b border-neutral-100 last:border-b-0" @click="addBlockFromCategory(index, category.category, 0)">
            {{ category.title }}
          </button>
        </div>
        <UiButton class="w-full" variant="secondary" :data-testid="`tabs-add-block-${index}`" @click="toggleBlockPicker(index)">
          {{ blockPickerTabIndex === index ? getEditorTranslation('cancel-label') : getEditorTranslation('add-block-label') }}
        </UiButton>
      </div>
    </div>
  </UiAccordionItem>

  <UiAccordionItem v-model="layoutOpen" data-testid="tabs-layout-settings" summary-active-class="bg-neutral-100 border-t-0" summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b">
    <template #summary>
      <h2>{{ getEditorTranslation('layout-group-label') }}</h2>
    </template>

    <EditorFullWidthToggle v-model="isFullWidth" :block-uuid="blockUuid" />

    <div class="py-2 px-4">
      <UiFormLabel>{{ getEditorTranslation('additional-classes-label') }}</UiFormLabel>
      <SfInput v-model="tabsBlock.layout.additionalClasses" type="text" data-testid="tabs-additional-classes" :placeholder="getEditorTranslation('additional-classes-placeholder')" />
    </div>

    <div class="py-2 px-4">
      <UiFormLabel>{{ getEditorTranslation('html-id-label') }}</UiFormLabel>
      <SfInput v-model="tabsBlock.layout.htmlId" type="text" data-testid="tabs-html-id" :placeholder="getEditorTranslation('html-id-placeholder')" />
    </div>
  </UiAccordionItem>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import { v4 as uuidv4 } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { TabsContent, TabsFormProps } from './types';

const props = defineProps<TabsFormProps>();

const { allBlocks: data } = useBlocks();

const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { blocksLists, getBlocksLists, getBlockTemplateByLanguage } = useBlocksList();
const { $i18n } = useNuxtApp();

await getBlocksLists();

const createDefaultItem = () => ({
  title: 'Tab item',
  html: '<p>Tab content</p>',
  blocks: [] as Block[],
});

const tabsBlock = computed<TabsContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<TabsContent>;

  if (!Array.isArray(content.items) || content.items.length === 0) {
    content.items = [createDefaultItem()];
  }

  content.items.forEach((item, index) => {
    if (!item) {
      content.items![index] = { title: '', html: '', blocks: [] };
      return;
    }

    item.title = item.title ?? '';
    item.html = item.html ?? '';
    if (!Array.isArray(item.blocks)) {
      item.blocks = [];
    }
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
  if (toIndex < 0 || toIndex >= tabsBlock.value.items.length || fromIndex === toIndex) return;
  const items = tabsBlock.value.items;
  const movedItem = items[fromIndex];
  if (!movedItem) return;
  items.splice(fromIndex, 1);
  items.splice(toIndex, 0, movedItem);
};

const moveTabBlock = (tabIndex: number, fromBlockIndex: number, toBlockIndex: number) => {
  const item = tabsBlock.value.items[tabIndex];
  if (!item || !item.blocks) return;
  if (toBlockIndex < 0 || toBlockIndex >= item.blocks.length) return;
  const block = item.blocks[fromBlockIndex];
  if (!block) return;
  item.blocks.splice(fromBlockIndex, 1);
  item.blocks.splice(toBlockIndex, 0, block);
};

const removeTabBlock = (tabIndex: number, blockIndex: number) => {
  const item = tabsBlock.value.items[tabIndex];
  if (!item || !item.blocks) return;
  item.blocks.splice(blockIndex, 1);
};

const blockPickerTabIndex = ref<number | null>(null);

const toggleBlockPicker = (tabIndex: number) => {
  blockPickerTabIndex.value = blockPickerTabIndex.value === tabIndex ? null : tabIndex;
};

const addBlockFromCategory = async (tabIndex: number, category: string, variationIndex: number) => {
  const item = tabsBlock.value.items[tabIndex];
  if (!item) return;
  if (!Array.isArray(item.blocks)) item.blocks = [];
  const template = await getBlockTemplateByLanguage(category, variationIndex, $i18n.locale.value);
  template.meta = { ...template.meta, uuid: uuidv4() };
  item.blocks.push(template);
  blockPickerTabIndex.value = null;
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
    "blocks-label": "Nested Blocks",
    "add-block-label": "Add Block",
    "cancel-label": "Cancel",
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
    "blocks-label": "Verschachtelte Bloecke",
    "add-block-label": "Block hinzufuegen",
    "cancel-label": "Abbrechen",
    "layout-group-label": "Layout",
    "additional-classes-label": "Zusaetzliche Klassen",
    "additional-classes-placeholder": "z.B. md:rounded-xl custom-tabs",
    "html-id-label": "HTML-ID",
    "html-id-placeholder": "z.B. produkt-tabs"
  }
}
</i18n>
