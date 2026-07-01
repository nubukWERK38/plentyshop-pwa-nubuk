<template>
  <div>
    <UiAccordionItem
      v-model="downloadSettings"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>Downloads</h2>
      </template>

      <div class="space-y-4 py-4">
        <label>
          <UiFormLabel>Titel</UiFormLabel>
          <SfInput v-model="productDownloads.text.title" type="text" />
        </label>

        <div v-for="(item, index) in productDownloads.downloads.items" :key="index" class="rounded-md border p-3">
          <div class="mb-3 flex items-center justify-between gap-3">
            <strong class="text-sm">Download {{ index + 1 }}</strong>
            <button type="button" class="text-sm font-semibold text-red-700" @click="removeDownload(index)">
              Entfernen
            </button>
          </div>
          <div class="space-y-3">
            <label>
              <UiFormLabel>Name</UiFormLabel>
              <SfInput v-model="item.title" type="text" placeholder="z. B. Bedienungsanleitung" />
            </label>
            <label>
              <UiFormLabel>URL</UiFormLabel>
              <SfInput v-model="item.url" type="text" placeholder="https://.../datei.pdf oder datei.pdf" />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label>
                <UiFormLabel>Dateityp</UiFormLabel>
                <SfInput v-model="item.fileType" type="text" placeholder="pdf, jpg, png" />
              </label>
              <label>
                <UiFormLabel>Dateigroesse</UiFormLabel>
                <SfInput v-model="item.fileSize" type="text" placeholder="z. B. 2.4 MB" />
              </label>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          @click="addDownload"
        >
          Download hinzufuegen
        </button>
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
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type { ProductDownloadEntry, ProductDownloadsContent, ProductDownloadsFormProps } from './types';

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();

const props = defineProps<ProductDownloadsFormProps>();

const createDownload = (): ProductDownloadEntry => ({
  title: '',
  url: '',
  fileType: '',
  fileSize: '',
});

const productDownloads = computed<ProductDownloadsContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<ProductDownloadsContent>;

  content.text = {
    title: content.text?.title ?? 'Downloads',
  };

  content.downloads = {
    items: Array.isArray(content.downloads?.items) ? content.downloads.items : [],
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

  return content as ProductDownloadsContent;
});

const { isFullWidth } = useFullWidthToggleForContent(productDownloads);

const downloadSettings = ref(true);
const layoutSettings = ref(false);
const isCollapsible = ref(productDownloads.value.layout.displayAsCollapsable);
const isInitiallyCollapsed = ref(productDownloads.value.layout.initiallyCollapsed);

const addDownload = () => productDownloads.value.downloads.items.push(createDownload());
const removeDownload = (index: number) => productDownloads.value.downloads.items.splice(index, 1);

watch(isCollapsible, (newValue) => {
  productDownloads.value.layout.displayAsCollapsable = newValue;
  if (!newValue) {
    isInitiallyCollapsed.value = false;
    productDownloads.value.layout.initiallyCollapsed = false;
  }
});

watch(isInitiallyCollapsed, (newValue) => {
  productDownloads.value.layout.initiallyCollapsed = newValue;
});
</script>
