<template>
  <section :style="inlineStyle" class="faq-block" data-testid="faq-block">
    <h2 v-if="content.text?.title" class="mb-4 text-2xl font-bold leading-8">
      {{ content.text.title }}
    </h2>

    <div v-if="visibleItems.length" class="divide-y divide-neutral-200 border-y border-neutral-200">
      <details
        v-for="(item, index) in visibleItems"
        :key="`${item.question}-${index}`"
        :open="index === 0 && content.layout?.initiallyOpenFirst"
        class="group"
        :data-testid="`faq-item-${index}`"
      >
        <summary
          class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden"
        >
          <span>{{ item.question }}</span>
          <span class="text-xl leading-none text-primary-700 transition-transform group-open:rotate-45">+</span>
        </summary>
        <div
          class="no-preflight pb-5 text-neutral-700 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
          :data-testid="`faq-answer-${index}`"
          v-html="item.answerHtml"
        />
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FAQItem, FAQProps } from './types';

const props = defineProps<FAQProps>();
const content = computed(() => props.content);

const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const hasAnswer = (item: FAQItem) => stripHtml(item.answerHtml ?? '').length > 0;

const visibleItems = computed(() =>
  (content.value.items ?? []).filter((item) => item?.question?.trim().length > 0 && hasAnswer(item)),
);

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: visibleItems.value.map((item) => ({
    '@type': 'Question',
    name: item.question.trim(),
    acceptedAnswer: {
      '@type': 'Answer',
      text: stripHtml(item.answerHtml ?? ''),
    },
  })),
}));

useHead(() => ({
  script: visibleItems.value.length
    ? [
        {
          key: `faq-structured-data-${props.meta.uuid}`,
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData.value),
        },
      ]
    : [],
}));

const inlineStyle = computed(() => {
  const layout = content.value.layout || {};
  return {
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
  };
});

const { registerBlockVisibility } = useBlocksVisibility();

watch(
  visibleItems,
  (items) => {
    registerBlockVisibility(props.meta.uuid, items.length > 0);
  },
  { immediate: true },
);
</script>
