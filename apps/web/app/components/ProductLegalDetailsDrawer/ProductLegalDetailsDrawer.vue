<template>
  <UiOverlay :visible="open" class="product-legal-details-overlay" style="z-index: 10000">
    <SfDrawer
      ref="productLegalDrawerRef"
      v-model="open"
      data-testid="product-legal-details-drawer"
      :placement="placement"
      :class="[
        'product-legal-details-drawer',
        'lg:w-128',
        'bg-white',
        'border',
        'border-[var(--ci-primary)]',
        'z-[10000]',
        { 'lg:min-w-[400px]': placement === 'left' || placement === 'right' },
      ]"
    >
      <header class="product-legal-details-drawer__header">
        <div class="product-legal-details-drawer__title">{{ title }}</div>

        <UiButton
          square
          variant="tertiary"
          data-testid="product-legal-details-close"
          class="text-white"
          :aria-label="t('common.navigation.closeDrawer')"
          @click="open = false"
        >
          <SfIconClose />
        </UiButton>
      </header>

      <div
        ref="tablistRef"
        role="tablist"
        aria-label="Select tab"
        aria-orientation="horizontal"
        class="product-legal-details-drawer__tabs"
      >
        <UiButton
          v-for="(tab, index) in tabs"
          :key="tab.label"
          type="button"
          role="tab"
          :data-testid="tab.component.__name"
          :variant="isActiveTab(index) ? 'primary' : 'secondary'"
          class="product-legal-details-drawer__tab"
          :aria-selected="isActiveTab(index)"
          :aria-controls="`tabpanel-${index}`"
          :disabled="tab.disabled"
          @click="setActiveTab(index)"
        >
          {{ tab.label }}
        </UiButton>
      </div>
      <div
        v-for="(tab, index) in tabs"
        v-show="isActiveTab(index)"
        :id="`tabpanel-${index}`"
        :key="tab.label"
        role="tabpanel"
        :aria-labelledby="`tab-${index}`"
        class="product-legal-details-drawer__panel"
      >
        <component :is="tab.component" :product="product" />
      </div>
    </SfDrawer>
  </UiOverlay>
</template>

<script setup lang="ts">
import type { SfDrawerPlacement } from '@storefront-ui/vue';
import { SfDrawer, SfIconClose, useTrapFocus } from '@storefront-ui/vue';
import type { ProductLegalDetailsProps } from '~/components/ProductLegalDetailsDrawer/types';
import ManufacturerResponsibleInfo from '~/components/ManufacturerResponsibleInfo/ManufacturerResponsibleInfo.vue';
import ManufacturerInformation from '~/components/ManufacturerInformation/ManufacturerInformation.vue';

defineProps<ProductLegalDetailsProps>();

const placement = ref<`${SfDrawerPlacement}`>('right');
const tabs = [
  { label: t('manufacturer.euResponsibleTabName'), component: ManufacturerResponsibleInfo, disabled: false },
  { label: t('manufacturer.manufacturerTabName'), component: ManufacturerInformation, disabled: false },
];

const activeTabIndex = ref(0);

const isActiveTab = (index: number) => activeTabIndex.value === index;
const setActiveTab = (index: number) => {
  activeTabIndex.value = index;
};

const productLegalDrawerRef = ref();
const { open, openedBlockUuid } = useProductLegalDetailsDrawer();
useTrapFocus(productLegalDrawerRef, { activeState: open });

const { allBlocks } = useBlocks();

const productLegalBlock = computed(() => {
  if (!openedBlockUuid.value) return null;
  return allBlocks.value
    .flatMap((block) => (Array.isArray(block.content) ? block.content : [block]))
    .find((block) => block.meta?.uuid === openedBlockUuid.value);
});

const title = computed(() => productLegalBlock.value?.content?.text?.title || t('product.legalDetails'));
</script>

<style scoped>
.product-legal-details-overlay {
  z-index: 10000;
  background: rgb(29 44 54 / 54%);
}

.product-legal-details-drawer {
  color: var(--ci-dark);
  box-shadow: -16px 0 36px rgb(0 0 0 / 22%);
}

.product-legal-details-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
  background: var(--ci-primary);
  color: #ffffff;
}

.product-legal-details-drawer__title {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 800;
  line-height: 1.25;
}

.product-legal-details-drawer__tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 1rem;
  border-bottom: 1px solid #cfe4ec;
  background: #f4f8fa;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.product-legal-details-drawer__tabs::-webkit-scrollbar {
  display: none;
}

.product-legal-details-drawer__tab[aria-selected='true'] {
  background: var(--ci-primary) !important;
  color: #ffffff !important;
}

.product-legal-details-drawer__tab[aria-selected='false'] {
  border-color: var(--ci-primary) !important;
  color: var(--ci-primary) !important;
}

.product-legal-details-drawer__panel {
  padding: 1.25rem;
}

.product-legal-details-drawer__panel :deep(h4) {
  color: var(--ci-primary);
}

.product-legal-details-drawer__panel :deep(a) {
  color: var(--ci-primary);
}
</style>
