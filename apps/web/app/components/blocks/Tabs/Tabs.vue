<template>
  <div
    v-bind="$attrs"
    :id="htmlId || undefined"
    :class="['tabs-block', content.layout?.additionalClasses]"
    :style="inlineStyle"
    data-testid="tabs-block"
  >
    <div
      v-if="normalizedItems.length > 0"
      class="flex gap-2 border-b border-b-neutral-200 p-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      role="tablist"
      aria-label="Tabs"
    >
      <UiButton
        v-for="(item, index) in normalizedItems"
        :id="`tabs-tab-${index}`"
        :key="index"
        type="button"
        role="tab"
        :variant="isActiveTab(index) ? 'primary' : 'secondary'"
        :aria-selected="isActiveTab(index)"
        :aria-controls="`tabs-panel-${index}`"
        :data-testid="`tabs-item-${index}`"
        @click="setActiveTab(index)"
      >
        {{ item.title }}
      </UiButton>
    </div>

    <div
      v-if="activeItem"
      :id="`tabs-panel-${activeTabIndex}`"
      role="tabpanel"
      :aria-labelledby="`tabs-tab-${activeTabIndex}`"
      class="px-4 py-3"
      :data-testid="`tabs-item-content-${activeTabIndex}`"
    >
      <div
        v-if="activeItem.html"
        class="no-preflight [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
        v-html="activeItem.html"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem, TabsProps } from './types';

const props = defineProps<TabsProps>();

const normalizedItems = computed<TabsItem[]>(() => {
  const items = props.content?.items ?? [];
  return items.map((item) => ({
    title: item?.title ?? '',
    html: item?.html ?? '',
  }));
});

const activeTabIndex = ref(0);

watch(
  normalizedItems,
  (items) => {
    if (items.length === 0) {
      activeTabIndex.value = 0;
      return;
    }

    if (activeTabIndex.value >= items.length) {
      activeTabIndex.value = items.length - 1;
    }
  },
  { immediate: true },
);

const activeItem = computed(() => normalizedItems.value[activeTabIndex.value]);

const isActiveTab = (index: number) => activeTabIndex.value === index;

const setActiveTab = (index: number) => {
  if (index < 0 || index >= normalizedItems.value.length) return;
  activeTabIndex.value = index;
};

const htmlId = computed(() => props.content?.layout?.htmlId?.trim() ?? '');

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
  normalizedItems,
  (items) => {
    registerBlockVisibility(props.meta.uuid, items.length > 0);
  },
  { immediate: true },
);
</script>
