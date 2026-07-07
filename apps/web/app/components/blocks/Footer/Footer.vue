<template>
  <footer v-if="resolvedContent" class="footer-block" :style="footerStyle" data-testid="footer">
    <div class="footer-block__inner">
      <div class="footer-block__content" :style="contentPanelStyle">
        <div class="footer-block__content-bg" :style="contentBackgroundStyle" />
        <div class="footer-block__columns" :style="columnsStyle">
          <div v-for="(column, i) in visibleColumns" :key="i" class="footer-block__column">
            <div v-if="column?.title" class="footer-block__title">
              {{ column.title }}
            </div>
            <ul v-if="getColumnSwitches(column).length" class="footer-block__links">
              <SfListItem
                v-for="switchConfig in getColumnSwitches(column)"
                :key="switchConfig.id"
                class="footer-block__link-item !bg-transparent typography-text-sm"
              >
                <SfLink
                  :tag="NuxtLink"
                  :style="{ color: resolvedContent.colors?.text || undefined }"
                  class="footer-block__link no-underline hover:underline active:underline"
                  variant="secondary"
                  :to="localePath(switchConfig.link)"
                >
                  {{ switchConfig.translationKey }}
                </SfLink>
              </SfListItem>
            </ul>
            <div v-if="column?.description" class="footer-block__html" v-html="column.description" />
            <div v-if="hasColumnButton(column)" class="pt-2 flex">
              <UiButton
                :tag="NuxtLink"
                :to="localePath(paths.cancellationForm)"
                size="sm"
                class="text-xs leading-5"
                data-testid="footer-cancellation-button"
              >
                {{ t('legal.withdrawButton') }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="resolvedContent.footnote && resolvedContent.footnote.trim() !== ''"
        class="footer-block__footnote no-preflight"
        :class="{
          'text-left': resolvedContent.footnoteAlign === 'left',
          'text-center': resolvedContent.footnoteAlign === 'center',
          'text-right': resolvedContent.footnoteAlign === 'right',
        }"
        :style="footnoteStyle"
        v-html="resolvedContent.footnote"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SfLink, SfListItem } from '@storefront-ui/vue';
import type { FooterProps, FooterContent, FooterColumn } from './types';
import { FOOTER_SWITCH_DEFINITIONS } from './constants';

const props = defineProps<FooterProps>();
const route = useRoute();
const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const { footer } = useBlocks();

const { t } = useI18n();
const { enableContractWithdrawalButton } = useRuntimeConfig().public;
const shouldRender = computed(() => {
  if (route.meta.isBlockified) return !!props.content;
  return true;
});

const resolvedContent = computed(() => {
  if (!shouldRender.value) return null;

  const content = props.content ?? footer.value?.content;
  return (content ?? null) as FooterContent | null;
});
const footerStyle = computed(() => ({
  backgroundColor: resolvedContent.value?.colors?.background,
  backgroundImage: resolvedContent.value?.layout?.backgroundImage
    ? `url(${resolvedContent.value.layout.backgroundImage})`
    : undefined,
  color: resolvedContent.value?.colors?.text,
}));

const legacyColumns = computed(() => {
  if (!resolvedContent.value) return [];
  return [
    resolvedContent.value.column1,
    resolvedContent.value.column2,
    resolvedContent.value.column3,
    resolvedContent.value.column4,
  ];
});

const columns = computed(() =>
  resolvedContent.value?.columns?.length ? resolvedContent.value.columns : legacyColumns.value,
);

const visibleColumns = computed(() =>
  columns.value.filter((column) => {
    if (!column) return false;
    return Boolean(column.title || column.description || getColumnSwitches(column).length || hasColumnButton(column));
  }),
);

const columnsStyle = computed(() => ({
  gridTemplateColumns: visibleColumns.value.map((column) => column.width?.trim() || '1fr').join(' '),
}));

const contentPanelStyle = computed(() => ({
  color: resolvedContent.value?.colors?.text,
}));

const contentBackgroundStyle = computed(() => ({
  backgroundColor: resolvedContent.value?.layout?.contentBackground || 'transparent',
  opacity: `${Math.max(0, Math.min(1, Number(resolvedContent.value?.layout?.contentOpacity ?? 1)))}`,
}));

const footnoteStyle = computed(() => ({
  color: resolvedContent.value?.colors?.footnoteText,
  backgroundColor: resolvedContent.value?.colors?.footnoteBackground,
}));

const hasColumnButton = (column: FooterColumn) => {
  return !!(enableContractWithdrawalButton && column?.showCancellationForm);
};

const getColumnSwitches = (column: FooterColumn) => {
  return FOOTER_SWITCH_DEFINITIONS.filter((switchConfig) => {
    if (column[switchConfig.key] !== true) return false;

    return !(enableContractWithdrawalButton && switchConfig.key === 'showCancellationForm');
  }).map((switchConfig) => ({
    id: `${switchConfig.key}-switch`,
    translationKey: t(switchConfig.shopTranslationKey),
    link: switchConfig.link,
    state: true,
  }));
};
</script>

<style scoped>
.footer-block {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 72px 100px 0;
  max-width: 1540px;
  margin: 0 auto;
}

.footer-block__inner {
  width: min(100%, 1470px);
  margin: 0 auto;
}

.footer-block__content {
  position: relative;
  overflow: hidden;
  padding: 34px 42px 30px;
  color: #fff !important;
}

.footer-block__content-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.footer-block__columns {
  position: relative;
  display: grid;
  gap: 36px;
}

.footer-block__column {
  min-width: 0;
  overflow-wrap: anywhere;
}

.footer-block__title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.08em;
  min-height: 22px;
}

.footer-block__links {
  margin: 0 0 14px;
  padding: 0;
}

.footer-block__link-item {
  padding: 2px 0 !important;
}

.footer-block__link {
  color: inherit;
  font-size: 14px;
}

.footer-block__html {
  font-size: 14px;
  line-height: 1.55;
}

.footer-block__html :deep(a) {
  color: inherit;
}

.footer-block__footnote {
  margin-top: 34px;
  padding: 14px 16px;
  font-size: 14px;
}

@media (max-width: 767px) {
  .footer-block {
    padding: 32px 16px 0;
    max-width: 100%;
  }

  .footer-block__content {
    padding: 28px 20px;
  }

  .footer-block__columns {
    grid-template-columns: 1fr !important;
  }
}
</style>
