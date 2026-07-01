<template>
  <div :style="inlineStyle" data-testid="item-text-block">
    <div v-if="displayAsCollapsable">
      <UiAccordionItem
        v-if="text"
        v-model="initiallyCollapsed"
        summary-class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3 flex justify-between items-center select-none"
        data-testid="item-text"
      >
        <template #summary>
          <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
            {{ content.text.title }}
          </h2>
        </template>
        <div
          v-if="text"
          data-testid="item-text-innertext"
          class="no-preflight [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
          v-html="text"
        />
      </UiAccordionItem>
      <UiDivider v-if="initiallyCollapsed && text?.length" class="mb-2 mt-2" />
    </div>
    <div v-else>
      <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
        {{ content.text.title }}
      </h2>
      <div v-if="text" class="no-preflight [&>p:first-child]:mt-0 [&>p:last-child]:mb-0" v-html="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import type { ItemTextProps } from './types';

const props = defineProps<ItemTextProps>();
const initiallyCollapsed = computed(() => !props.content?.layout.initiallyCollapsed);
const displayAsCollapsable = computed(() => props.content?.layout.displayAsCollapsable);
const { currentProduct } = useProducts();
const content = computed(() => props.content);
const description = computed(() => productGetters.getDescription(currentProduct.value));
const productName = computed(() => productGetters.getName(currentProduct.value));
const startsWithH2 = (html: string) => /^(?:\s|<!--[\s\S]*?-->)*<h2(?:\s|>)/i.test(html);
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
const text = computed(() => {
  const html = description.value || '';
  const name = productName.value || '';

  if (!html || !name || startsWithH2(html)) return html;

  return `<h2 class="item-text__product-name-heading">${escapeHtml(name)}</h2>${html}`;
});
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
  text,
  (newText) => {
    registerBlockVisibility(props.meta.uuid, newText?.length > 0);
  },
  { immediate: true },
);
</script>

<style scoped>
.no-preflight :deep(.item-text__product-name-heading) {
  margin: 0 0 1rem;
  color: var(--ci-dark);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
}

@media (max-width: 767px) {
  .no-preflight :deep(.item-text__product-name-heading) {
    font-size: 1.5rem;
  }
}
</style>
