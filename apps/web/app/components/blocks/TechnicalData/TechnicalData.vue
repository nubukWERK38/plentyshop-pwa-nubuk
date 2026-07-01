<template>
  <div :style="inlineStyle" data-testid="technical-data-block">
    <div v-if="displayAsCollapsable">
      <UiAccordionItem
        v-if="hasContent"
        v-model="initiallyCollapsed"
        summary-class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3 flex justify-between items-center select-none"
        data-testid="technical-data"
      >
        <template #summary>
          <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
            {{ content.text.title }}
          </h2>
        </template>
        <div v-if="technicalPropertyGroups.length" class="technical-info" data-testid="technical-data-properties">
          <div v-for="group in technicalPropertyGroups" :key="group.id" class="technical-info__group group">
            <p class="technical-info__heading h4">{{ group.name }}</p>
            <ul class="technical-info__list">
              <li v-for="property in group.properties" :key="property.id" class="technical-info__item">
                <strong>{{ property.name }}</strong
                ><span>: {{ property.value }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div v-else-if="text" data-testid="technical-data-innertext" class="no-preflight" v-html="text" />
      </UiAccordionItem>
      <UiDivider v-if="initiallyCollapsed && hasContent" class="mb-2 mt-2" />
    </div>
    <div v-else>
      <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
        {{ content.text.title }}
      </h2>
      <div v-if="technicalPropertyGroups.length" class="technical-info" data-testid="technical-data-properties">
        <div v-for="group in technicalPropertyGroups" :key="group.id" class="technical-info__group group">
          <p class="technical-info__heading h4">{{ group.name }}</p>
          <ul class="technical-info__list">
            <li v-for="property in group.properties" :key="property.id" class="technical-info__item">
              <strong>{{ property.name }}</strong
              ><span>: {{ property.value }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="text" class="no-preflight" v-html="text" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TechnicalDataProps } from './types';

const props = defineProps<TechnicalDataProps>();

const content = computed(() => props.content);
const initiallyCollapsed = computed(() => !props.content?.layout.initiallyCollapsed);
const displayAsCollapsable = computed(() => props.content?.layout.displayAsCollapsable);
const { text, technicalPropertyGroups, hasContent } = useTechnicalData();
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
  hasContent,
  (isVisible) => {
    registerBlockVisibility(props.meta.uuid, isVisible);
  },
  { immediate: true },
);
</script>
