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
            <div
              v-if="column?.description"
              class="footer-block__html"
              v-html="decorateFooterDescription(column.description)"
            />
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

const legacyContactIconClasses = {
  phone: ['fa-phone'],
  email: ['fa-envelope'],
  location: ['fa-map-marker', 'fa-map-marker-alt', 'fa-location-dot'],
};

const addContactIcon = (html: string, type: 'phone' | 'email' | 'location', pattern: RegExp) => {
  if (
    html.includes(`footer-block__contact-icon--${type}`) ||
    legacyContactIconClasses[type].some((iconClass) => html.includes(iconClass))
  ) {
    return html;
  }

  return html.replace(
    pattern,
    `$1<span class="footer-block__contact-icon footer-block__contact-icon--${type}" aria-hidden="true"></span>$2$3`,
  );
};

const decorateFooterDescription = (description: string) => {
  return addContactIcon(
    addContactIcon(
      addContactIcon(description, 'phone', /(<p[^>]*>\s*)((?:<a[^>]*>)?07171-929556(?:<\/a>)?)(\s*<\/p>)/i),
      'location',
      /(<p[^>]*>\s*)((?:<strong>)?Nubuk (?:Store|Lager)(?:<\/strong>)?)(\s*(?:<br\s*\/?>|<\/p>))/i,
    ),
    'email',
    /(<p[^>]*>\s*)((?:<a[^>]*>)?vertrieb@nubuk-bikes\.de(?:<\/a>)?)(\s*<\/p>)/i,
  );
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
  color: var(--ci-accent);
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

.footer-block__html :deep(p:has(.footer-block__contact-icon)) {
  display: flex;
  align-items: center;
  gap: 11px;
}

.footer-block__html :deep(a) {
  color: inherit;
}

.footer-block__html :deep(.footer-block__contact-icon) {
  display: inline-block;
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  background-color: var(--ci-accent);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  vertical-align: -2px;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

.footer-block__html :deep(.footer-block__contact-icon--phone) {
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.31-.31.76-.41 1.16-.28 1.27.42 2.64.65 4.03.65.63 0 1.13.5 1.13 1.13V20c0 .63-.5 1.13-1.13 1.13C10.83 21.13 2.87 13.17 2.87 3.4c0-.63.5-1.13 1.13-1.13h3.33c.63 0 1.13.5 1.13 1.13 0 1.39.23 2.76.65 4.03.12.4.03.85-.29 1.16l-2.2 2.2Z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.31-.31.76-.41 1.16-.28 1.27.42 2.64.65 4.03.65.63 0 1.13.5 1.13 1.13V20c0 .63-.5 1.13-1.13 1.13C10.83 21.13 2.87 13.17 2.87 3.4c0-.63.5-1.13 1.13-1.13h3.33c.63 0 1.13.5 1.13 1.13 0 1.39.23 2.76.65 4.03.12.4.03.85-.29 1.16l-2.2 2.2Z'/%3E%3C/svg%3E");
}

.footer-block__html :deep(.footer-block__contact-icon--email) {
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M3 5h18c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1Zm9 8.2L4.8 7H4v.8l8 6.9 8-6.9V7h-.8L12 13.2Z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M3 5h18c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1Zm9 8.2L4.8 7H4v.8l8 6.9 8-6.9V7h-.8L12 13.2Z'/%3E%3C/svg%3E");
}

.footer-block__html :deep(.footer-block__contact-icon--location) {
  align-self: flex-start;
  margin-top: 3px;
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z'/%3E%3C/svg%3E");
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
