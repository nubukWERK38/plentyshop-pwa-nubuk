<template>
  <section class="image-text-box" data-testid="image-text-box">
    <div v-if="isSideBySide" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div :class="imageOrderClass">
        <div v-if="hasImage" class="w-full overflow-hidden bg-neutral-100">
          <NuxtImg
            v-if="content.image.mobile"
            :src="content.image.mobile"
            :alt="content.image.alt"
            class="block md:hidden w-full h-auto"
            width="640"
            height="360"
            sizes="100vw md:50vw"
          />
          <NuxtImg
            :src="content.image.desktop || content.image.mobile"
            :alt="content.image.alt"
            class="hidden md:block w-full h-auto"
            width="1280"
            height="720"
            sizes="100vw md:50vw"
          />
        </div>
      </div>
      <div :class="textOrderClass">
        <div class="space-y-4">
          <div v-if="hasText" class="max-w-none" v-html="content.text.html" />
          <component
            :is="buttonTag"
            v-if="hasButton"
            v-bind="buttonProps"
            class="image-text-box__button inline-flex items-center px-4 py-2 font-medium"
            :style="buttonStyle"
          >
            {{ content.button.label }}
          </component>
        </div>
      </div>
    </div>

    <template v-else-if="isInside">
      <div class="image-text-box__inside-layout relative">
        <div v-if="hasImage" class="w-full overflow-hidden bg-neutral-100">
          <NuxtImg
            v-if="content.image.mobile"
            :src="content.image.mobile"
            :alt="content.image.alt"
            class="block md:hidden w-full h-auto"
            width="640"
            height="360"
            sizes="100vw"
          />
          <NuxtImg
            :src="content.image.desktop || content.image.mobile"
            :alt="content.image.alt"
            class="hidden md:block w-full h-auto"
            width="1280"
            height="720"
            sizes="100vw"
          />
        </div>
        <div class="image-text-box__inside absolute inset-0 p-10 flex" :class="insideAlignClasses">
          <div class="image-text-box__text">
            <div v-if="hasText" class="max-w-none" v-html="content.text.html" />
            <component
              :is="buttonTag"
              v-if="hasButton"
              v-bind="buttonProps"
              class="image-text-box__button image-text-box__button--inside inline-flex items-center px-4 py-2 font-medium"
              :style="buttonStyle"
            >
              {{ content.button.label }}
            </component>
          </div>
        </div>
      </div>
      <component
        :is="buttonTag"
        v-if="hasButton"
        v-bind="buttonProps"
        class="image-text-box__button image-text-box__button--mobile-bar items-center px-4 py-2 font-medium"
        :style="buttonStyle"
      >
        {{ content.button.label }}
      </component>
    </template>

    <div v-else-if="isOverlay" class="relative pb-10">
      <div v-if="hasImage" class="w-full overflow-hidden bg-neutral-100">
        <NuxtImg
          v-if="content.image.mobile"
          :src="content.image.mobile"
          :alt="content.image.alt"
          class="block md:hidden w-full h-auto"
          width="640"
          height="360"
          sizes="100vw"
        />
        <NuxtImg
          :src="content.image.desktop || content.image.mobile"
          :alt="content.image.alt"
          class="hidden md:block w-full h-auto"
          width="1280"
          height="720"
          sizes="100vw"
        />
      </div>
      <div class="relative z-10 -mt-10 mx-4 md:mx-8 bg-white p-4 md:p-6 shadow-md">
        <div class="space-y-4">
          <div v-if="hasText" class="max-w-none" v-html="content.text.html" />
          <component
            :is="buttonTag"
            v-if="hasButton"
            v-bind="buttonProps"
            class="image-text-box__button inline-flex items-center px-4 py-2 font-medium"
            :style="buttonStyle"
          >
            {{ content.button.label }}
          </component>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="isAbove" class="space-y-4 mb-4">
        <div v-if="hasText" class="max-w-none" v-html="content.text.html" />
        <component
          :is="buttonTag"
          v-if="hasButton"
          v-bind="buttonProps"
          class="image-text-box__button inline-flex items-center px-4 py-2 font-medium"
          :style="buttonStyle"
        >
          {{ content.button.label }}
        </component>
      </div>

      <div v-if="hasImage" class="w-full overflow-hidden bg-neutral-100">
        <NuxtImg
          v-if="content.image.mobile"
          :src="content.image.mobile"
          :alt="content.image.alt"
          class="block md:hidden w-full h-auto"
          width="640"
          height="360"
          sizes="100vw"
        />
        <NuxtImg
          :src="content.image.desktop || content.image.mobile"
          :alt="content.image.alt"
          class="hidden md:block w-full h-auto"
          width="1280"
          height="720"
          sizes="100vw"
        />
      </div>

      <div v-if="isBelow" class="space-y-4 mt-4">
        <div v-if="hasText" class="max-w-none" v-html="content.text.html" />
        <component
          :is="buttonTag"
          v-if="hasButton"
          v-bind="buttonProps"
          class="image-text-box__button inline-flex items-center px-4 py-2 font-medium"
          :style="buttonStyle"
        >
          {{ content.button.label }}
        </component>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { ImageTextBoxAlignX, ImageTextBoxAlignY, ImageTextBoxPosition, ImageTextBoxProps } from './types';
import { buildSeoLinkTitle } from '~/utils/seo';

const props = defineProps<ImageTextBoxProps>();
const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');

const content = computed(() => ({
  image: {
    desktop: props.content?.image?.desktop || '',
    mobile: props.content?.image?.mobile || props.content?.image?.desktop || '',
    alt: props.content?.image?.alt || '',
  },
  text: {
    html: props.content?.text?.html || '',
    position: (props.content?.text?.position || 'below') as ImageTextBoxPosition,
    alignY: (props.content?.text?.alignY || 'center') as ImageTextBoxAlignY,
    alignX: (props.content?.text?.alignX || 'center') as ImageTextBoxAlignX,
  },
  button: {
    label: props.content?.button?.label || '',
    link: props.content?.button?.link || '',
    backgroundColor: props.content?.button?.backgroundColor || '#111827',
    textColor: props.content?.button?.textColor || '#ffffff',
  },
}));

const isExternalLink = (link: string | undefined) => !!link && /^(https?:)?\/\//.test(link);
const resolvedButtonLink = computed(() => {
  const link = content.value.button.link.trim();
  if (!link) return undefined;
  return isExternalLink(link) ? link : localePath(link);
});

const buttonTag = computed(() => (resolvedButtonLink.value ? NuxtLink : 'button'));
const buttonProps = computed(() => {
  if (!resolvedButtonLink.value) return {};
  if (isExternalLink(resolvedButtonLink.value)) {
    return {
      to: resolvedButtonLink.value,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: buildSeoLinkTitle(content.value.button.label, 'Nubuk Bikes Shop'),
    };
  }
  return { to: resolvedButtonLink.value, title: buildSeoLinkTitle(content.value.button.label, 'Nubuk Bikes Shop') };
});

const buttonStyle = computed<CSSProperties>(() => ({
  backgroundColor: content.value.button.backgroundColor,
  color: content.value.button.textColor,
}));

const hasImage = computed(() => !!(content.value.image.desktop || content.value.image.mobile));
const hasText = computed(() => !!content.value.text.html);
const hasButton = computed(() => !!content.value.button.label && !!resolvedButtonLink.value);

const position = computed(() => content.value.text.position);
const isSideBySide = computed(() => position.value === 'left' || position.value === 'right');
const isInside = computed(() => position.value === 'inside');
const isOverlay = computed(() => position.value === 'overlay');
const isAbove = computed(() => position.value === 'above');
const isBelow = computed(() => position.value === 'below');

const imageOrderClass = computed(() => (position.value === 'left' ? 'md:order-2' : 'md:order-1'));
const textOrderClass = computed(() => (position.value === 'left' ? 'md:order-1' : 'md:order-2'));

const insideAlignClasses = computed(() => {
  const y = content.value.text.alignY;
  const x = content.value.text.alignX;

  const classes: string[] = [];
  if (y === 'top') classes.push('items-start');
  else if (y === 'bottom') classes.push('items-end');
  else classes.push('items-center');

  if (x === 'left') classes.push('justify-start', 'text-left');
  else if (x === 'right') classes.push('justify-end', 'text-right');
  else classes.push('justify-center', 'text-center');

  return classes;
});
</script>

<style scoped>
.image-text-box__button {
  text-decoration: none;
}

.image-text-box__button::after {
  margin-left: 10px;
  content: '\2192';
}

.image-text-box__button--mobile-bar {
  display: none;
}

@media (max-width: 767px) {
  .image-text-box__inside {
    position: absolute !important;
    inset: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
    padding: 0 !important;
    text-align: left !important;
  }

  .image-text-box__button--inside {
    display: none;
  }

  .image-text-box__button--mobile-bar {
    display: flex;
  }

  .image-text-box__inside .image-text-box__text {
    display: flex;
    width: 100%;
    min-height: 100%;
    flex-direction: column;
    justify-content: flex-end;
  }

  .image-text-box__inside .image-text-box__text > .max-w-none {
    padding: 0 32px 24px;
    color: #ffffff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 35%);
  }

  .image-text-box__button--mobile-bar {
    width: 100%;
    min-height: 44px;
    justify-content: center;
    padding: 10px 16px;
    color: #000000 !important;
    font-size: 16px;
    line-height: 1.35;
    text-align: center;
  }
}
</style>
