<template>
  <div
    class="image-banner-neo group relative"
    :class="controls.fullWidth ? 'w-full' : 'max-w-screen-xl mx-auto w-full'"
    data-testid="image-banner-neo"
  >
    <Swiper
      :modules="swiperModules"
      :slides-per-view="1"
      :loop="slides.length > 1"
      :pagination="paginationConfig"
      :navigation="navigationConfig"
      class="!z-0"
    >
      <SwiperSlide v-for="(slide, slideIndex) in slides" :key="slideIndex" class="!h-auto">
        <article
          class="image-banner-neo__slide grid gap-0 md:grid-cols-2"
          :style="{ minHeight: sliderHeight }"
          :data-testid="`image-banner-neo-slide-${slideIndex}`"
        >
          <div :class="getImageOrderClass(slide)">
            <NuxtImg
              :src="resolveSlideImage(slide)"
              :alt="slide.image.alt"
              class="h-full w-full object-cover"
              :style="{ minHeight: sliderHeight }"
              width="1024"
              height="576"
              :data-testid="`image-banner-neo-image-${slideIndex}`"
            />
          </div>

          <div
            class="image-banner-neo__text flex flex-col gap-4"
            :class="getTextOrderClass(slide)"
            :style="getTextAreaStyle(slide)"
            :data-testid="`image-banner-neo-text-${slideIndex}`"
          >
            <p
              v-if="slide.text.subline"
              class="text-sm font-medium tracking-[0.1em] uppercase"
              :style="{ color: slide.text.sublineColor || '#ffffff' }"
            >
              {{ slide.text.subline }}
            </p>

            <h2
              v-if="slide.text.headline"
              class="text-3xl font-bold leading-tight md:text-5xl"
              :style="{ color: slide.text.headlineColor || '#ffffff' }"
            >
              {{ slide.text.headline }}
            </h2>

            <UiButton
              v-if="slide.text.ctaLabel && slide.text.ctaLink"
              :variant="slide.text.ctaVariant"
              :class="['w-fit image-banner-neo__cta', { 'image-banner-neo__cta--custom': hasCustomCtaColors(slide) }]"
              :style="getCtaStyle(slide)"
              v-bind="getCtaProps(slide)"
              :data-testid="`image-banner-neo-cta-${slideIndex}`"
            >
              {{ slide.text.ctaLabel }}
              <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="ml-2 h-4 w-4" />
            </UiButton>
          </div>
        </article>
      </SwiperSlide>
    </Swiper>

    <div v-if="shouldShowPagination || shouldShowArrows" class="image-banner-neo__controls">
      <button
        v-if="shouldShowArrows"
        type="button"
        :class="[
          `image-banner-neo-prev-${sliderId}`,
          'image-banner-neo__nav image-banner-neo__nav--prev',
          arrowVisibilityClass,
        ]"
        :aria-label="t('homepage.banner.ariaLabelPreviousSlide')"
        :data-testid="`image-banner-neo-prev-${sliderId}`"
      >
        <FontAwesomeIcon :icon="['fas', 'chevron-left']" class="h-4 w-4" />
      </button>
      <span v-else class="image-banner-neo__nav-spacer" aria-hidden="true" />

      <div
        v-if="shouldShowPagination"
        :class="`swiper-pagination image-banner-neo__pagination image-banner-neo-pagination-${sliderId}`"
      />
      <span v-else class="image-banner-neo__pagination-spacer" aria-hidden="true" />

      <button
        v-if="shouldShowArrows"
        type="button"
        :class="[
          `image-banner-neo-next-${sliderId}`,
          'image-banner-neo__nav image-banner-neo__nav--next',
          arrowVisibilityClass,
        ]"
        :aria-label="t('homepage.banner.ariaLabelNextSlide')"
        :data-testid="`image-banner-neo-next-${sliderId}`"
      >
        <FontAwesomeIcon :icon="['fas', 'chevron-right']" class="h-4 w-4" />
      </button>
      <span v-else class="image-banner-neo__nav-spacer" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import type { CSSProperties } from 'vue';
import type { ImageBannerNeoProps, ImageBannerNeoSlide } from './types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const props = defineProps<ImageBannerNeoProps>();

const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const viewport = useViewport();

const isMobile = computed(() => viewport.isLessThan('md'));

const sliderId = computed(() => (props.meta.uuid || 'image-banner-neo').replace(/[^a-zA-Z0-9_-]/g, ''));

const ensureSpacing = (spacing?: { top?: number; right?: number; bottom?: number; left?: number }) => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const ensureSlide = (slide?: Partial<ImageBannerNeoSlide>): ImageBannerNeoSlide => ({
  image: {
    desktop: slide?.image?.desktop || '',
    mobile: slide?.image?.mobile || '',
    alt: slide?.image?.alt || '',
  },
  text: {
    subline: slide?.text?.subline || '',
    headline: slide?.text?.headline || '',
    ctaLabel: slide?.text?.ctaLabel || '',
    ctaLink: slide?.text?.ctaLink || '',
    ctaVariant: slide?.text?.ctaVariant || 'primary',
    ctaColor: slide?.text?.ctaColor || '',
    ctaTextColor: slide?.text?.ctaTextColor || '',
    ctaHoverColor: slide?.text?.ctaHoverColor || '',
    backgroundImage: slide?.text?.backgroundImage || '',
    backgroundColor: slide?.text?.backgroundColor || 'transparent',
    sublineColor: slide?.text?.sublineColor || '#ffffff',
    headlineColor: slide?.text?.headlineColor || '#ffffff',
  },
  desktop: {
    imagePosition: slide?.desktop?.imagePosition || 'right',
    textAlignment: slide?.desktop?.textAlignment || 'left',
    textPositionX: slide?.desktop?.textPositionX || 'start',
    textPositionY: slide?.desktop?.textPositionY || 'center',
    margin: ensureSpacing(slide?.desktop?.margin),
    padding: ensureSpacing(slide?.desktop?.padding),
  },
  mobile: {
    textAlignment: slide?.mobile?.textAlignment || 'left',
    textPositionX: slide?.mobile?.textPositionX || 'start',
    textPositionY: slide?.mobile?.textPositionY || 'center',
    margin: ensureSpacing(slide?.mobile?.margin),
    padding: ensureSpacing(slide?.mobile?.padding),
  },
});

const slides = computed(() => {
  const baseSlides = props.content?.slides ?? [];
  return baseSlides.length > 0 ? baseSlides : [ensureSlide()];
});

const controls = computed(() => ({
  showPagination: props.content?.controls?.showPagination !== false,
  showArrows: props.content?.controls?.showArrows !== false,
  arrowsOnHover: props.content?.controls?.arrowsOnHover === true,
  height: props.content?.controls?.height ?? 420,
  fullWidth: props.content?.controls?.fullWidth !== false,
}));

const sliderHeight = computed(() => `${controls.value.height}px`);

const shouldShowPagination = computed(() => controls.value?.showPagination !== false && slides.value.length > 1);
const shouldShowArrows = computed(() => controls.value?.showArrows !== false && slides.value.length > 1);

const swiperModules = computed(() => {
  const modules = [];
  if (shouldShowPagination.value) {
    modules.push(Pagination);
  }
  if (shouldShowArrows.value) {
    modules.push(Navigation);
  }
  return modules;
});

const paginationConfig = computed(() => {
  if (!shouldShowPagination.value) {
    return false;
  }

  return {
    el: `.image-banner-neo-pagination-${sliderId.value}`,
    clickable: true,
    bulletClass: 'image-banner-neo__bullet',
    bulletActiveClass: 'image-banner-neo__bullet--active',
    renderBullet(index: number, className: string) {
      return `<span class="${className}" data-index="${index}"></span>`;
    },
  };
});

const navigationConfig = computed(() => {
  if (!shouldShowArrows.value) {
    return false;
  }

  return {
    nextEl: `.image-banner-neo-next-${sliderId.value}`,
    prevEl: `.image-banner-neo-prev-${sliderId.value}`,
  };
});

const arrowVisibilityClass = computed(() => {
  if (!controls.value?.arrowsOnHover || isMobile.value) {
    return 'opacity-100';
  }
  return 'opacity-0 transition-opacity duration-300 group-hover:opacity-100';
});

const getImageOrderClass = (slide: ImageBannerNeoSlide) => {
  return slide.desktop.imagePosition === 'left' ? 'order-1 md:order-1' : 'order-1 md:order-2';
};

const getTextOrderClass = (slide: ImageBannerNeoSlide) => {
  return slide.desktop.imagePosition === 'left' ? 'order-2 md:order-2' : 'order-2 md:order-1';
};

const resolveSlideImage = (slide: ImageBannerNeoSlide) => {
  return isMobile.value ? slide.image.mobile || slide.image.desktop : slide.image.desktop || slide.image.mobile;
};

const resolveTextAlign = (slide: ImageBannerNeoSlide) => {
  return isMobile.value ? slide.mobile.textAlignment : slide.desktop.textAlignment;
};

const resolvePositionX = (slide: ImageBannerNeoSlide) => {
  return isMobile.value ? slide.mobile.textPositionX : slide.desktop.textPositionX;
};

const resolvePositionY = (slide: ImageBannerNeoSlide) => {
  return isMobile.value ? slide.mobile.textPositionY : slide.desktop.textPositionY;
};

const resolveAlignItems = (slide: ImageBannerNeoSlide): CSSProperties['alignItems'] => {
  const x = resolvePositionX(slide);
  if (x === 'center') return 'center';
  if (x === 'end') return 'flex-end';
  return 'flex-start';
};

const resolveJustifyContent = (slide: ImageBannerNeoSlide): CSSProperties['justifyContent'] => {
  const y = resolvePositionY(slide);
  if (y === 'center') return 'center';
  if (y === 'end') return 'flex-end';
  return 'flex-start';
};

const getTextAreaStyle = (slide: ImageBannerNeoSlide): CSSProperties => {
  const spacing = isMobile.value ? slide.mobile : slide.desktop;

  return {
    alignItems: resolveAlignItems(slide),
    justifyContent: resolveJustifyContent(slide),
    textAlign: resolveTextAlign(slide),
    minHeight: sliderHeight.value,
    marginTop: `${spacing.margin.top}px`,
    marginRight: `${spacing.margin.right}px`,
    marginBottom: `${spacing.margin.bottom}px`,
    marginLeft: `${spacing.margin.left}px`,
    paddingTop: `${spacing.padding.top}px`,
    paddingRight: `${spacing.padding.right}px`,
    paddingBottom: `${spacing.padding.bottom}px`,
    paddingLeft: `${spacing.padding.left}px`,
    backgroundColor: slide.text.backgroundColor || '#1f2937',
    backgroundImage: slide.text.backgroundImage ? `url(${slide.text.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
};

const isExternalLink = (link: string) => /^(https?:)?\/\//.test(link);

const toRgb = (hexColor: string) => {
  const hex = hexColor.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
};

const getReadableTextColor = (color: string) => {
  const rgb = toRgb(color);
  if (!rgb) return '#ffffff';

  // Relative luminance approximation for choosing CTA text contrast.
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#111827' : '#ffffff';
};

const hasCustomCtaColors = (slide: ImageBannerNeoSlide) => {
  return Boolean(slide.text.ctaColor || slide.text.ctaTextColor || slide.text.ctaHoverColor);
};

const getCtaStyle = (slide: ImageBannerNeoSlide): CSSProperties => {
  if (!hasCustomCtaColors(slide)) {
    return {};
  }

  const isPrimary = slide.text.ctaVariant === 'primary';
  const baseColor = slide.text.ctaColor;
  const hoverColor = slide.text.ctaHoverColor;
  const explicitTextColor = slide.text.ctaTextColor;

  const baseTextColor = explicitTextColor || (baseColor ? getReadableTextColor(baseColor) : '#ffffff');
  const hoverTextColor = explicitTextColor || (hoverColor ? getReadableTextColor(hoverColor) : baseTextColor);

  return {
    '--ibn-cta-bg': isPrimary ? (baseColor || 'transparent') : 'transparent',
    '--ibn-cta-border': baseColor || 'currentColor',
    '--ibn-cta-text': isPrimary ? baseTextColor : explicitTextColor || baseColor || 'currentColor',
    '--ibn-cta-hover-bg': hoverColor || (isPrimary ? baseColor || 'transparent' : 'transparent'),
    '--ibn-cta-hover-border': hoverColor || baseColor || 'currentColor',
    '--ibn-cta-hover-text': isPrimary ? hoverTextColor : explicitTextColor || hoverColor || baseColor || 'currentColor',
  } as CSSProperties;
};

const getCtaProps = (slide: ImageBannerNeoSlide) => {
  if (isExternalLink(slide.text.ctaLink)) {
    return {
      tag: 'a',
      href: slide.text.ctaLink,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return {
    tag: NuxtLink,
    to: localePath(slide.text.ctaLink),
  };
};
</script>

<style scoped>
.image-banner-neo :deep(.swiper-pagination) {
  position: static;
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.image-banner-neo__controls {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 2rem 1fr 2rem;
  align-items: center;
  gap: 0.75rem;
}

.image-banner-neo__pagination {
  grid-column: 2;
}

.image-banner-neo :deep(.image-banner-neo__bullet) {
  width: 3.5rem;
  height: 0.14rem;
  border-radius: 999px;
  background: #cbd5e1;
  opacity: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-banner-neo :deep(.image-banner-neo__bullet--active) {
  background: #1f2937;
}

.image-banner-neo__nav {
  position: static;
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #1f2937;
}

.image-banner-neo__nav--prev {
  justify-self: start;
}

.image-banner-neo__nav--next {
  justify-self: end;
}

.image-banner-neo__nav-spacer {
  display: inline-block;
  width: 2rem;
  height: 2rem;
}

.image-banner-neo__slide {
  background: #0f172a;
}

.image-banner-neo__text {
  position: relative;
}

.image-banner-neo__cta--custom {
  background-color: var(--ibn-cta-bg) !important;
  border-color: var(--ibn-cta-border) !important;
  color: var(--ibn-cta-text) !important;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.image-banner-neo__cta--custom:hover {
  background-color: var(--ibn-cta-hover-bg) !important;
  border-color: var(--ibn-cta-hover-border) !important;
  color: var(--ibn-cta-hover-text) !important;
}
</style>
