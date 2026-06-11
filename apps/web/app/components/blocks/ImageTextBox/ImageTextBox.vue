<template>
  <section class="image-text-box" data-testid="image-text-box">
    <div v-if="isSideBySide" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div :class="imageOrderClass">
        <div v-if="hasImage" class="w-full overflow-hidden rounded-md bg-neutral-100">
          <NuxtImg
            v-if="content.image.mobile"
            :src="content.image.mobile"
            :alt="content.image.alt"
            class="block md:hidden w-full h-auto"
            width="640"
            height="360"
          />
          <NuxtImg
            :src="content.image.desktop || content.image.mobile"
            :alt="content.image.alt"
            class="hidden md:block w-full h-auto"
            width="1280"
            height="720"
          />
        </div>
      </div>
      <div :class="textOrderClass">
        <div class="space-y-4">
          <div v-if="hasText" class="prose max-w-none" v-html="content.text.html"></div>
          <component
            :is="buttonTag"
            v-if="hasButton"
            v-bind="buttonProps"
            class="inline-flex items-center rounded px-4 py-2 font-medium"
            :style="buttonStyle"
          >
            {{ content.button.label }}
          </component>
        </div>
      </div>
    </div>

    <div v-else-if="isInside" class="relative">
      <div v-if="hasImage" class="w-full overflow-hidden rounded-md bg-neutral-100">
        <NuxtImg
          v-if="content.image.mobile"
          :src="content.image.mobile"
          :alt="content.image.alt"
          class="block md:hidden w-full h-auto"
          width="640"
          height="360"
        />
        <NuxtImg
          :src="content.image.desktop || content.image.mobile"
          :alt="content.image.alt"
          class="hidden md:block w-full h-auto"
          width="1280"
          height="720"
        />
      </div>
      <div class="absolute inset-0 p-5 flex" :class="insideAlignClasses">
        <div class="space-y-4 max-w-full bg-white/90 p-4 rounded-md shadow-sm">
          <div v-if="hasText" class="prose max-w-none" v-html="content.text.html"></div>
          <component
            :is="buttonTag"
            v-if="hasButton"
            v-bind="buttonProps"
            class="inline-flex items-center rounded px-4 py-2 font-medium"
            :style="buttonStyle"
          >
            {{ content.button.label }}
          </component>
        </div>
      </div>
    </div>

    <div v-else-if="isOverlay" class="relative pb-10">
      <div v-if="hasImage" class="w-full overflow-hidden rounded-md bg-neutral-100">
        <NuxtImg
          v-if="content.image.mobile"
          :src="content.image.mobile"
          :alt="content.image.alt"
          class="block md:hidden w-full h-auto"
          width="640"
          height="360"
        />
        <NuxtImg
          :src="content.image.desktop || content.image.mobile"
          :alt="content.image.alt"
          class="hidden md:block w-full h-auto"
          width="1280"
          height="720"
        />
      </div>
      <div class="relative z-10 -mt-10 mx-4 md:mx-8 bg-white p-4 md:p-6 rounded-md shadow-md">
        <div class="space-y-4">
          <div v-if="hasText" class="prose max-w-none" v-html="content.text.html"></div>
          <component
            :is="buttonTag"
            v-if="hasButton"
            v-bind="buttonProps"
            class="inline-flex items-center rounded px-4 py-2 font-medium"
            :style="buttonStyle"
          >
            {{ content.button.label }}
          </component>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="isAbove" class="space-y-4 mb-4">
        <div v-if="hasText" class="prose max-w-none" v-html="content.text.html"></div>
        <component
          :is="buttonTag"
          v-if="hasButton"
          v-bind="buttonProps"
          class="inline-flex items-center rounded px-4 py-2 font-medium"
          :style="buttonStyle"
        >
          {{ content.button.label }}
        </component>
      </div>

      <div v-if="hasImage" class="w-full overflow-hidden rounded-md bg-neutral-100">
        <NuxtImg
          v-if="content.image.mobile"
          :src="content.image.mobile"
          :alt="content.image.alt"
          class="block md:hidden w-full h-auto"
          width="640"
          height="360"
        />
        <NuxtImg
          :src="content.image.desktop || content.image.mobile"
          :alt="content.image.alt"
          class="hidden md:block w-full h-auto"
          width="1280"
          height="720"
        />
      </div>

      <div v-if="isBelow" class="space-y-4 mt-4">
        <div v-if="hasText" class="prose max-w-none" v-html="content.text.html"></div>
        <component
          :is="buttonTag"
          v-if="hasButton"
          v-bind="buttonProps"
          class="inline-flex items-center rounded px-4 py-2 font-medium"
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
    };
  }
  return { to: resolvedButtonLink.value };
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
