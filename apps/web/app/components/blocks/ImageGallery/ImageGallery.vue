<template>
  <section class="grid-in-left-top md:h-full" :style="galleryWrapperStyle" data-testid="image-gallery-block">
    <header v-if="showHeader" class="image-gallery-block__header" :style="headerStyle">
      <p v-if="normalizedContent.header?.subline" :style="sublineStyle">
        {{ normalizedContent.header.subline }}
      </p>
      <h2 v-if="normalizedContent.header?.headline" :style="headlineStyle">
        {{ normalizedContent.header.headline }}
      </h2>
    </header>

    <Gallery
      :images="addModernImageExtensionForGallery(productGetters.getGallery(currentProduct))"
      :configuration="normalizedContent"
    />
  </section>
</template>

<script setup lang="ts">
import { productGetters } from '@plentymarkets/shop-api';
import type { CSSProperties } from 'vue';
import type { BoxSpacing, GradientSettings, ImageGalleryContent } from '~/components/Gallery/types';
import type { ImageGalleryProps } from '~/components/blocks/ImageGallery/types';

const { addModernImageExtensionForGallery } = useModernImage();

const props = defineProps<ImageGalleryProps>();
const { currentProduct } = useProducts();

const ensureSpacing = (spacing?: BoxSpacing) => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const ensureGradient = (gradient?: GradientSettings) => ({
  enabled: gradient?.enabled === true,
  type: gradient?.type ?? 'linear',
  startColor: gradient?.startColor ?? '#ffffff',
  endColor: gradient?.endColor ?? '#e2e8f0',
  angle: gradient?.angle ?? 180,
  radius: gradient?.radius ?? 100,
  startX: gradient?.startX ?? 50,
  startY: gradient?.startY ?? 50,
});

const normalizedContent = computed<ImageGalleryContent>(() => {
  const content = props.content ?? { thumbnails: {}, layout: {} };
  return {
    thumbnails: {
      showThumbnails: content.thumbnails?.showThumbnails !== false,
      thumbnailType: content.thumbnails?.thumbnailType ?? 'left-vertical',
      enableHoverZoom: content.thumbnails?.enableHoverZoom !== false,
    },
    layout: {
      fullWidth: content.layout?.fullWidth !== false,
      backgroundColor: content.layout?.backgroundColor ?? 'transparent',
      gradient: ensureGradient(content.layout?.gradient),
      margin: ensureSpacing(content.layout?.margin),
      padding: ensureSpacing(content.layout?.padding),
    },
    header: {
      subline: content.header?.subline ?? '',
      headline: content.header?.headline ?? '',
      sublineColor: content.header?.sublineColor ?? '#64748b',
      headlineColor: content.header?.headlineColor ?? '#0f172a',
      sublineFontSize: content.header?.sublineFontSize ?? 16,
      headlineFontSize: content.header?.headlineFontSize ?? 44,
      backgroundColor: content.header?.backgroundColor ?? 'transparent',
      gradient: ensureGradient(content.header?.gradient),
      margin: ensureSpacing(content.header?.margin),
      padding: ensureSpacing(content.header?.padding),
    },
  };
});

const gradientToCss = (gradient: ReturnType<typeof ensureGradient>) => {
  if (!gradient.enabled) return undefined;
  if (gradient.type === 'radial') {
    return `radial-gradient(circle ${gradient.radius}% at ${gradient.startX}% ${gradient.startY}%, ${gradient.startColor}, ${gradient.endColor})`;
  }
  return `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
};

const galleryWrapperStyle = computed<CSSProperties>(() => ({
  marginTop: `${normalizedContent.value.layout.margin?.top ?? 0}px`,
  marginRight: `${normalizedContent.value.layout.margin?.right ?? 0}px`,
  marginBottom: `${normalizedContent.value.layout.margin?.bottom ?? 0}px`,
  marginLeft: `${normalizedContent.value.layout.margin?.left ?? 0}px`,
  paddingTop: `${normalizedContent.value.layout.padding?.top ?? 0}px`,
  paddingRight: `${normalizedContent.value.layout.padding?.right ?? 0}px`,
  paddingBottom: `${normalizedContent.value.layout.padding?.bottom ?? 0}px`,
  paddingLeft: `${normalizedContent.value.layout.padding?.left ?? 0}px`,
  background: gradientToCss(normalizedContent.value.layout.gradient || ensureGradient()),
  backgroundColor: normalizedContent.value.layout.gradient?.enabled
    ? undefined
    : normalizedContent.value.layout.backgroundColor,
}));

const showHeader = computed(() => {
  return Boolean(normalizedContent.value.header?.subline || normalizedContent.value.header?.headline);
});

const headerStyle = computed<CSSProperties>(() => ({
  marginTop: `${normalizedContent.value.header?.margin?.top ?? 0}px`,
  marginRight: `${normalizedContent.value.header?.margin?.right ?? 0}px`,
  marginBottom: `${normalizedContent.value.header?.margin?.bottom ?? 0}px`,
  marginLeft: `${normalizedContent.value.header?.margin?.left ?? 0}px`,
  paddingTop: `${normalizedContent.value.header?.padding?.top ?? 0}px`,
  paddingRight: `${normalizedContent.value.header?.padding?.right ?? 0}px`,
  paddingBottom: `${normalizedContent.value.header?.padding?.bottom ?? 0}px`,
  paddingLeft: `${normalizedContent.value.header?.padding?.left ?? 0}px`,
  background: gradientToCss(normalizedContent.value.header?.gradient || ensureGradient()),
  backgroundColor: normalizedContent.value.header?.gradient?.enabled
    ? undefined
    : normalizedContent.value.header?.backgroundColor,
}));

const sublineStyle = computed<CSSProperties>(() => ({
  color: normalizedContent.value.header?.sublineColor,
  fontSize: `${normalizedContent.value.header?.sublineFontSize}px`,
}));

const headlineStyle = computed<CSSProperties>(() => ({
  color: normalizedContent.value.header?.headlineColor,
  fontSize: `${normalizedContent.value.header?.headlineFontSize}px`,
  lineHeight: '1.1',
}));
</script>

<style scoped>
.image-gallery-block__header p {
  margin: 0 0 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.image-gallery-block__header h2 {
  margin: 0;
  font-weight: 700;
}
</style>
