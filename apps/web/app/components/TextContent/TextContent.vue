<template>
  <div
    :data-testid="props.testId ? 'text-content-' + props.testId : 'text-content'"
    class="w-full"
    :style="{ color: props.text?.color }"
    :class="['space-y-4', textAlignmentClass]"
  >
    <div
      v-if="props.text?.htmlDescription"
      class="rte-prose rte-prose--render"
      :data-testid="props.testId ? 'text-html-' + props.testId : 'text-html'"
      :class="`rte-prose--${props.text?.textAlignment ?? 'left'}`"
      v-html="renderedHtmlDescription"
    />

    <UiButton
      v-if="props.button?.label && props.button?.link"
      :tag="NuxtLink"
      :to="localePath(props.button.link)"
      :variant="props.button.variant ?? 'primary'"
      :data-testid="props.testId ? 'text-button-' + props.testId : 'text-button'"
      :class="[
        'mt-3 px-4 py-2 cursor-pointer text-content__button',
        { 'text-content__button--hover-text': !!props.button?.hoverTextColor },
        { 'text-content__button--hover-bg': !!props.button?.hoverBackgroundColor },
      ]"
      :style="buttonStyle"
    >
      {{ props.button.label }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import type { TextContentProps } from '~/components/TextContent/types';

const props = defineProps<TextContentProps>();

const renderedHtmlDescription = computed(() => decodeHtmlEntities(props.text?.htmlDescription));

const textAlignmentClass = computed(() => {
  switch (props.text?.textAlignment) {
    case 'center':
      return 'text-center items-center';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-left items-start';
  }
});

const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');

const resolveGradient = () => {
  const gradient = props.button?.backgroundGradient;
  if (!gradient?.enabled) return undefined;

  const start = gradient.startColor || '#2563eb';
  const end = gradient.endColor || '#1d4ed8';

  if (gradient.type === 'radial') {
    const radius = gradient.radius ?? 100;
    const x = gradient.startX ?? 50;
    const y = gradient.startY ?? 50;
    return `radial-gradient(circle ${radius}% at ${x}% ${y}%, ${start}, ${end})`;
  }

  return `linear-gradient(${gradient.angle ?? 135}deg, ${start}, ${end})`;
};

const buttonStyle = computed(() => ({
  color: props.button?.textColor || undefined,
  background: resolveGradient(),
  backgroundColor: props.button?.backgroundGradient?.enabled ? undefined : props.button?.backgroundColor || undefined,
  borderColor: props.button?.backgroundColor || props.button?.backgroundGradient?.enabled ? 'transparent' : undefined,
  '--text-content-button-hover-text-color': props.button?.hoverTextColor || undefined,
  '--text-content-button-hover-background-color': props.button?.hoverBackgroundColor || undefined,
}));
</script>

<style scoped>
.text-content__button--hover-text:hover {
  color: var(--text-content-button-hover-text-color) !important;
}

.text-content__button--hover-bg:hover {
  background: var(--text-content-button-hover-background-color) !important;
  background-color: var(--text-content-button-hover-background-color) !important;
  border-color: var(--text-content-button-hover-background-color) !important;
}
</style>
