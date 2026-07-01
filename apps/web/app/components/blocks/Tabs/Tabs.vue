<template>
  <div
    ref="tabsBlockRef"
    v-bind="$attrs"
    :id="htmlId || undefined"
    :class="['tabs-block', content.layout?.additionalClasses]"
    :style="inlineStyle"
    data-testid="tabs-block"
  >
    <div
      v-if="normalizedItems.length > 0"
      class="flex gap-2 overflow-x-auto px-0 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      role="tablist"
      aria-label="Tabs"
    >
      <button
        v-for="(item, index) in normalizedItems"
        :id="`tabs-tab-${index}`"
        :key="index"
        type="button"
        role="tab"
        :class="[
          'min-w-[185px] border-b px-0 pb-4 pt-2 text-left text-sm font-semibold uppercase leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
          isActiveTab(index)
            ? 'border-neutral-900 text-neutral-900'
            : 'border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600',
        ]"
        :aria-selected="isActiveTab(index)"
        :aria-controls="`tabs-panel-${index}`"
        :data-testid="`tabs-item-${index}`"
        @click="setActiveTab(index)"
      >
        {{ item.title }}
      </button>
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
        v-if="activeItem.html && !isDefaultProductQuestionTab(activeItem)"
        class="no-preflight [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
        v-html="activeItem.html"
      />

      <div
        v-for="block in activeItem.blocks"
        :key="block.meta?.uuid"
        :data-uuid="block.meta?.uuid"
        class="group relative"
      >
        <ClientOnly>
          <button
            v-if="shouldEnableEditorFeatures"
            type="button"
            class="absolute right-2 top-2 z-20 rounded bg-white/95 border border-neutral-300 px-2 py-1 text-xs shadow opacity-0 group-hover:opacity-100 transition"
            @click.stop="openDrawerWithView('blocksSettings', block)"
          >
            Edit
          </button>
        </ClientOnly>

        <component :is="getBlockComponent(block.name)" v-if="getBlockComponent(block.name)" v-bind="block" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem, TabsProps } from './types';
import type { Block } from '@plentymarkets/shop-api';

const getBlockComponent = (name: string) => getCachedBlockComponent(name);

const props = defineProps<TabsProps>();
const { openDrawerWithView } = useSiteConfiguration();
const { shouldEnableEditorFeatures } = useEditorState();

const normalizedItems = computed<TabsItem[]>(() => {
  const items = props.content?.items ?? [];
  return items.map((item) => ({
    title: item?.title ?? '',
    html: item?.html ?? '',
    blocks: normalizeTabBlocks(item?.title ?? '', item?.html ?? '', item?.blocks ?? []),
  }));
});

const normalizeText = (value: string) => value.trim().toLowerCase();

const isProductQuestionTitle = (title: string) =>
  ['noch fragen?', 'noch fragen', 'any questions?'].includes(normalizeText(title));

const isDefaultProductQuestionHtml = (html: string) => {
  const normalizedHtml = normalizeText(html)
    .replace(/^<p>/, '')
    .replace(/<\/p>$/, '')
    .trim();
  return normalizedHtml === '' || normalizedHtml === 'tab content';
};

const createProductQuestionBlock = (): Block => ({
  name: 'ProductQuestion',
  type: 'content',
  meta: {
    uuid: `${props.meta.uuid}-product-question`,
    isGlobalTemplate: false,
  },
  content: {
    text: {
      title: '',
      intro:
        'Wenn Du noch weitere Fragen zu diesem Artikel hast, kannst Du uns gerne über das folgende Formular benachrichtigen.',
      successText: 'Vielen Dank für Deine Anfrage. Wir melden uns schnellst möglich bei Dir. ',
    },
    layout: {
      displayAsCollapsable: false,
      initiallyCollapsed: false,
      fullWidth: false,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
});

const normalizeTabBlocks = (title: string, html: string, blocks: Block[]) => {
  if (!isProductQuestionTitle(title) || !isDefaultProductQuestionHtml(html)) return blocks;
  if (blocks.some((block) => block.name === 'ProductQuestion')) return blocks;

  return [...blocks, createProductQuestionBlock()];
};

const isDefaultProductQuestionTab = (item: TabsItem) =>
  isProductQuestionTitle(item.title) && isDefaultProductQuestionHtml(item.html);

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
const tabsBlockRef = ref<HTMLElement | null>(null);

const isActiveTab = (index: number) => activeTabIndex.value === index;

const setActiveTab = (index: number) => {
  if (index < 0 || index >= normalizedItems.value.length) return;
  activeTabIndex.value = index;
};

const scrollToTabsBlock = async () => {
  await nextTick();

  const element = tabsBlockRef.value;
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - 140;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
};

const openProductQuestionTab = () => {
  const questionTabIndex = normalizedItems.value.findIndex((item) => isProductQuestionTitle(item.title));
  if (questionTabIndex < 0) return;

  setActiveTab(questionTabIndex);
  scrollToTabsBlock();
};

const handleProductQuestionLinkClick = (event: MouseEvent) => {
  const trigger = (event.target as HTMLElement | null)?.closest('a, button');
  if (!trigger) return;

  const label = normalizeText(`${trigger.textContent ?? ''} ${trigger.getAttribute('title') ?? ''}`);
  if (!label.includes('frage stellen')) return;

  event.preventDefault();
  openProductQuestionTab();
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

onMounted(() => {
  window.addEventListener('open-product-question-tab', openProductQuestionTab);
  document.addEventListener('click', handleProductQuestionLinkClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('open-product-question-tab', openProductQuestionTab);
  document.removeEventListener('click', handleProductQuestionLinkClick);
});
</script>
