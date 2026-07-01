<template>
  <div v-if="downloads.length" class="product-downloads" :style="inlineStyle" data-testid="product-downloads-block">
    <div v-if="displayAsCollapsable">
      <UiAccordionItem
        v-model="initiallyCollapsed"
        summary-class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3 flex justify-between items-center select-none"
      >
        <template #summary>
          <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
            {{ content.text.title }}
          </h2>
        </template>

        <div class="product-downloads__list">
          <div v-for="download in downloads" :key="download.url" class="product-downloads__item">
            <div class="product-downloads__icon" :class="`product-downloads__icon--${download.fileType}`">
              <FontAwesomeIcon :icon="getIcon(download.fileType)" />
            </div>
            <div class="product-downloads__content">
              <p class="product-downloads__title">{{ download.title }}</p>
              <p class="product-downloads__meta">
                {{ getTypeLabel(download.fileType) }}<span v-if="download.fileSize"> - {{ download.fileSize }}</span>
              </p>
            </div>
            <a class="product-downloads__button" :href="download.url" target="_blank" rel="noopener" download>
              <SfIconDownload size="sm" />
              <span>Jetzt herunterladen</span>
            </a>
          </div>
        </div>
      </UiAccordionItem>
      <UiDivider v-if="initiallyCollapsed" class="mb-2 mt-2" />
    </div>

    <div v-else>
      <h2 v-if="content.text.title" class="mb-6 font-bold text-lg leading-6 md:text-2xl">
        {{ content.text.title }}
      </h2>
      <div class="product-downloads__list">
        <div v-for="download in downloads" :key="download.url" class="product-downloads__item">
          <div class="product-downloads__icon" :class="`product-downloads__icon--${download.fileType}`">
            <FontAwesomeIcon :icon="getIcon(download.fileType)" />
          </div>
          <div class="product-downloads__content">
            <p class="product-downloads__title">{{ download.title }}</p>
            <p class="product-downloads__meta">
              {{ getTypeLabel(download.fileType) }}<span v-if="download.fileSize"> - {{ download.fileSize }}</span>
            </p>
          </div>
          <a class="product-downloads__button" :href="download.url" target="_blank" rel="noopener" download>
            <SfIconDownload size="sm" />
            <span>Jetzt herunterladen</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SfIconDownload } from '@storefront-ui/vue';
import { faFileImage, faFileLines, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import type { ProductDownloadsProps } from './types';
import { getProductDownloads } from '~/utils/productDownloads';

const props = defineProps<ProductDownloadsProps>();
const { currentProduct } = useProducts();

const content = computed(() => props.content);
const initiallyCollapsed = computed(() => !props.content?.layout.initiallyCollapsed);
const displayAsCollapsable = computed(() => props.content?.layout.displayAsCollapsable);
const downloads = computed(() => getProductDownloads(currentProduct.value, props.content));

const getIcon = (fileType: string) => {
  if (fileType === 'pdf') return faFilePdf;
  if (fileType === 'image') return faFileImage;
  return faFileLines;
};

const getTypeLabel = (fileType: string) => {
  if (fileType === 'pdf') return 'PDF';
  if (fileType === 'image') return 'Bild';
  return fileType.toUpperCase();
};

const inlineStyle = computed(() => {
  const layout = props.content?.layout || {};
  return {
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
  };
});

const { registerBlockVisibility } = useBlocksVisibility();

watch(
  downloads,
  (items) => {
    registerBlockVisibility(props.meta.uuid, items.length > 0);
  },
  { immediate: true },
);
</script>

<style scoped>
.product-downloads {
  color: var(--ci-dark);
}

.product-downloads__list {
  display: grid;
  gap: 1rem;
}

.product-downloads__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e3ebe7;
  border-radius: 8px;
  background: #fff;
  padding: 1rem;
}

.product-downloads__icon {
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eff4f1;
  color: var(--ci-dark);
  font-size: 1.35rem;
}

.product-downloads__icon--pdf {
  color: #b91c1c;
}

.product-downloads__icon--image {
  color: #206b52;
}

.product-downloads__title {
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 700;
  line-height: 1.35;
}

.product-downloads__meta {
  margin: 0.25rem 0 0;
  color: #69736f;
  font-size: 0.875rem;
}

.product-downloads__button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 6px;
  background: var(--ci-dark);
  color: #fff;
  padding: 0.75rem 1rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background-color 150ms ease,
    transform 150ms ease;
}

.product-downloads__button:hover {
  background: #206b52;
  transform: translateY(-1px);
}

@media (max-width: 767px) {
  .product-downloads__item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .product-downloads__button {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
