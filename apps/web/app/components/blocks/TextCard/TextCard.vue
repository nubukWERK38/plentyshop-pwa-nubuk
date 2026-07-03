<template>
  <div
    data-testid="text-card"
    :class="['w-full', 'flex', 'flex-col', 'space-y-4', textAlignmentClass]"
    :style="inlineStyle"
  >
    <TextContent :text="props.content.text" :button="props.content.button" :index="props.index" />
  </div>
</template>

<script setup lang="ts">
import type { TextCardProps } from './types';

const props = defineProps<TextCardProps>();

const getBackgroundGradient = (layout: TextCardProps['content']['layout']) => {
  const gradient = layout.backgroundGradient;
  if (!gradient?.enabled || layout.backgroundColor === 'transparent') return undefined;

  const startColor = gradient.startColor || layout.backgroundColor || '#ffffff';
  const endColor = gradient.endColor || '#f3f4f6';

  if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${startColor}, ${endColor})`;
  }

  return `linear-gradient(${gradient.angle ?? 180}deg, ${startColor}, ${endColor})`;
};

const textAlignmentClass = computed(() => {
  switch (props.content.text?.textAlignment) {
    case 'center':
      return 'text-center items-center';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-left items-start';
  }
});
const inlineStyle = computed(() => {
  const layout = props.content.layout || {};
  const backgroundImage = getBackgroundGradient(layout);

  return {
    backgroundImage,
    backgroundColor: backgroundImage ? undefined : (layout.backgroundColor ?? 'transparent'),
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
  };
});
</script>
