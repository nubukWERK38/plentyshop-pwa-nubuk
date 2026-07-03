<template>
  <div class="relative w-full overflow-hidden" :style="wrapperStyle" data-testid="image-block">
    <component
      :is="linkTag"
      v-if="hasImage"
      :to="linkTarget"
      :aria-label="ariaLabel"
      :title="linkTitle"
      class="block"
      :style="imageFrameStyle"
      v-bind="isExternalLink(linkTarget) ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
      data-testid="image-link"
    >
      <NuxtImg
        :src="breakpointConfig.url"
        :alt="props.content.image.alt"
        class="block w-full h-full"
        :class="props.content.image.fillMode === 'fit' ? 'object-contain' : 'object-cover'"
        :style="imageInlineStyle"
        :width="breakpointConfig.dimensions.width"
        :height="breakpointConfig.dimensions.height"
        data-testid="image-block-image"
      />
    </component>

    <div
      class="absolute inset-0 px-4 flex flex-col"
      :class="[overlayAlignClasses, { 'pointer-events-none': linkTarget }]"
      data-testid="image-overlay-wrapper"
    >
      <div :class="{ 'pointer-events-auto': linkTarget }">
        <TextContent v-bind="textContentProps" :test-id="'image-overlay'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageProps, BreakpointEntry } from './types';
import { buildSeoLinkTitle } from '~/utils/seo';

const viewport = useViewport();
const NuxtLink = resolveComponent('NuxtLink');
const localePath = useLocalePath();

const props = defineProps<ImageProps>();

const hasImage = computed(() => !!props.content?.image);
const isExternalLink = (link: string | undefined) => !!link && /^(https?:)?\/\//.test(link);
const linkTarget = computed(() => {
  const target = props.content?.image?.linktarget?.trim();
  if (!target) return undefined;
  return isExternalLink(target) ? target : localePath(target);
});
const linkTag = computed(() => (linkTarget.value ? NuxtLink : 'div'));
const ariaLabel = computed(() => props.content?.image?.alt || 'Image link');
const linkTitle = computed(() =>
  linkTarget.value ? buildSeoLinkTitle(ariaLabel.value, 'Nubuk Bikes Shop') : undefined,
);

const textContentProps = computed(() =>
  mapToTextContentProps({
    htmlDescription: props.content?.text.textOverlay,
    color: props.content?.text.textOverlayColor || '#000',
    textAlignment: props.content?.text.textOverlayAlignX ?? 'center',
    buttonLabel: props.content?.button.label,
    buttonLink: props.content?.button.link,
    buttonVariant: props.content?.button.variant,
  }),
);

const breakpointConfig = computed(() => {
  const image = props.content?.image;

  const configs: Record<string, BreakpointEntry> = {
    '4xl': {
      aspectRatio: image?.aspectRatio || '16 / 9',
      url: image?.wideScreen,
      dimensions: { width: 696, height: 392 },
    },
    lg: {
      aspectRatio: image?.aspectRatio || '16 / 9',
      url: image?.desktop,
      dimensions: { width: 712, height: 474 },
    },
    md: {
      aspectRatio: image?.aspectRatio || '4 / 3',
      url: image?.tablet,
      dimensions: { width: 757, height: 483 },
    },
    fallback: {
      aspectRatio: image?.aspectRatio || '1 / 1',
      url: image?.mobile,
      dimensions: { width: 320, height: 320 },
    },
  };

  return (configs[viewport.breakpoint.value] ?? configs['fallback']) as BreakpointEntry;
});

const normalizeImageWidthUnit = (unit: ImageProps['content']['layout']['imageWidthUnit']) => (unit === 'px' ? 'px' : '%');
const normalizeHorizontalAlignment = (alignment: ImageProps['content']['layout']['imageHorizontalAlignment']) => {
  if (alignment === 'left' || alignment === 'right') return alignment;
  return 'center';
};
const normalizeVerticalAlignment = (alignment: ImageProps['content']['layout']['imageVerticalAlignment']) => {
  if (alignment === 'top' || alignment === 'bottom') return alignment;
  return 'center';
};

const imageWidthConfig = computed(() => {
  const layout = props.content.layout ?? {};
  const width = Number(layout.imageWidth);
  const unit = normalizeImageWidthUnit(layout.imageWidthUnit);
  const hasCustomWidth = Number.isFinite(width) && width > 0 && !(unit === '%' && width === 100);

  return {
    width,
    unit,
    hasCustomWidth,
  };
});

const wrapperStyle = computed(() => {
  const layout = props.content.layout ?? {};
  const horizontalAlignment = normalizeHorizontalAlignment(layout.imageHorizontalAlignment);
  const verticalAlignment = normalizeVerticalAlignment(layout.imageVerticalAlignment);

  if (imageWidthConfig.value.hasCustomWidth) {
    return {
      position: 'relative' as const,
      display: 'flex',
      justifyContent:
        horizontalAlignment === 'left' ? 'flex-start' : horizontalAlignment === 'right' ? 'flex-end' : 'center',
      alignItems: verticalAlignment === 'top' ? 'flex-start' : verticalAlignment === 'bottom' ? 'flex-end' : 'center',
    };
  }

  return {
    aspectRatio: breakpointConfig.value.aspectRatio,
    position: 'relative' as const,
  };
});

const imageFrameStyle = computed(() => {
  const layout = props.content.layout ?? {};
  const baseStyle = {
    backgroundColor: layout.backgroundColor ?? 'transparent',
    boxSizing: 'border-box',
    paddingTop: `${layout.paddingTop ?? 0}px`,
    paddingRight: `${layout.paddingRight ?? 0}px`,
    paddingBottom: `${layout.paddingBottom ?? 0}px`,
    paddingLeft: `${layout.paddingLeft ?? 0}px`,
  };

  if (!imageWidthConfig.value.hasCustomWidth) {
    return {
      ...baseStyle,
      position: 'absolute' as const,
      inset: '0',
      width: '100%',
      height: '100%',
    };
  }

  return {
    ...baseStyle,
    position: 'relative' as const,
    width: `${imageWidthConfig.value.width}${imageWidthConfig.value.unit}`,
    aspectRatio: breakpointConfig.value.aspectRatio,
  };
});

const overlayAlignClasses = computed(() => {
  const alignY = props.content?.text.textOverlayAlignY;

  if (alignY === 'top') return ['justify-start'];
  if (alignY === 'bottom') return ['justify-end'];
  return ['justify-center'];
});

const imageInlineStyle = computed(() => {
  const layout = props.content.layout ?? {};
  const horizontalAlignment = normalizeHorizontalAlignment(layout.imageHorizontalAlignment);
  const verticalAlignment = normalizeVerticalAlignment(layout.imageVerticalAlignment);

  return {
    filter:
      props.content.image.brightness !== null && props.content.image.brightness !== undefined
        ? `brightness(${props.content.image.brightness})`
        : '',
    objectPosition: `${horizontalAlignment} ${verticalAlignment}`,
  };
});
</script>
