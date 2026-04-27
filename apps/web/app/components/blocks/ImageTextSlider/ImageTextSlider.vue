<template>
  <div class="image-text-slider group relative w-full" data-testid="image-text-slider">
    <Swiper
      :modules="swiperModules"
      :slides-per-view="1"
      :loop="slides.length > 1"
      :pagination="paginationConfig"
      :navigation="navigationConfig"
      class="!z-0"
    >
      <SwiperSlide v-for="(slide, slideIndex) in slides" :key="slideIndex" class="!h-auto">
        <article class="image-text-slider__slide grid gap-0 md:grid-cols-2" :data-testid="`image-text-slide-${slideIndex}`">
          <div :class="getImageOrderClass(slide)">
            <NuxtImg
              :src="resolveSlideImage(slide)"
              :alt="slide.image.alt"
              class="h-full min-h-[250px] w-full object-cover md:min-h-[420px]"
              width="1024"
              height="576"
              :data-testid="`image-text-slide-image-${slideIndex}`"
            />
          </div>

          <div
            class="image-text-slider__text flex min-h-[250px] flex-col gap-4 md:min-h-[420px]"
            :class="getTextOrderClass(slide)"
            :style="getTextAreaStyle(slide)"
            :data-testid="`image-text-slide-text-${slideIndex}`"
          >
            <p v-if="slide.text.subline" class="text-sm font-medium tracking-[0.1em] uppercase opacity-80">
              {{ slide.text.subline }}
            </p>

            <h2 v-if="slide.text.headline" class="text-3xl font-bold leading-tight md:text-5xl">
              {{ slide.text.headline }}
            </h2>

            <UiButton
              v-if="slide.text.ctaLabel && slide.text.ctaLink"
              :variant="slide.text.ctaVariant"
              class="w-fit image-text-slider__cta"
              v-bind="getCtaProps(slide)"
              :data-testid="`image-text-slide-cta-${slideIndex}`"
            >
              {{ slide.text.ctaLabel }}
            </UiButton>
          </div>
        </article>
      </SwiperSlide>

      <div
        v-if="shouldShowPagination"
        :class="`swiper-pagination image-text-slider-pagination-${sliderId}`"
      />
    </Swiper>

    <button
      v-if="shouldShowArrows"
      type="button"
      :class="[
        `swiper-button-prev image-text-slider-prev-${sliderId}`,
        'image-text-slider__nav image-text-slider__nav--prev',
        arrowVisibilityClass,
      ]"
      :aria-label="t('homepage.banner.ariaLabelPreviousSlide')"
      :data-testid="`image-text-slider-prev-${sliderId}`"
    >
      <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
        <path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <button
      v-if="shouldShowArrows"
      type="button"
      :class="[
        `swiper-button-next image-text-slider-next-${sliderId}`,
        'image-text-slider__nav image-text-slider__nav--next',
        arrowVisibilityClass,
      ]"
      :aria-label="t('homepage.banner.ariaLabelNextSlide')"
      :data-testid="`image-text-slider-next-${sliderId}`"
    >
      <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.8">
        <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import type { CSSProperties } from 'vue';
import type { ImageTextSliderProps, ImageTextSliderSlide } from './types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const props = defineProps<ImageTextSliderProps>();

const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const viewport = useViewport();

const isMobile = computed(() => viewport.isLessThan('md'));

const sliderId = computed(() => (props.meta.uuid || 'image-text-slider').replace(/[^a-zA-Z0-9_-]/g, ''));

const ensureSpacing = (spacing?: { top?: number; right?: number; bottom?: number; left?: number }) => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const ensureSlide = (slide?: Partial<ImageTextSliderSlide>): ImageTextSliderSlide => ({
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
    backgroundImage: slide?.text?.backgroundImage || '',
    backgroundColor: slide?.text?.backgroundColor || 'transparent',
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
  return baseSlides.map((slide) => ensureSlide(slide));
});

const controls = computed(() => ({
  showPagination: props.content?.controls?.showPagination !== false,
  showArrows: props.content?.controls?.showArrows !== false,
  arrowsOnHover: props.content?.controls?.arrowsOnHover === true,
}));

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
    el: `.image-text-slider-pagination-${sliderId.value}`,
    clickable: true,
    bulletClass: 'image-text-slider__bullet',
    bulletActiveClass: 'image-text-slider__bullet--active',
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
    nextEl: `.image-text-slider-next-${sliderId.value}`,
    prevEl: `.image-text-slider-prev-${sliderId.value}`,
  };
});

const arrowVisibilityClass = computed(() => {
  if (!controls.value?.arrowsOnHover || isMobile.value) {
    return 'opacity-100';
  }
  return 'opacity-0 transition-opacity duration-300 group-hover:opacity-100';
});

const getImageOrderClass = (slide: ImageTextSliderSlide) => {
  return slide.desktop.imagePosition === 'left' ? 'order-1 md:order-1' : 'order-1 md:order-2';
};

const getTextOrderClass = (slide: ImageTextSliderSlide) => {
  return slide.desktop.imagePosition === 'left' ? 'order-2 md:order-2' : 'order-2 md:order-1';
};

const resolveSlideImage = (slide: ImageTextSliderSlide) => {
  return isMobile.value ? slide.image.mobile || slide.image.desktop : slide.image.desktop || slide.image.mobile;
};

const resolveTextAlign = (slide: ImageTextSliderSlide) => {
  return isMobile.value ? slide.mobile.textAlignment : slide.desktop.textAlignment;
};

const resolvePositionX = (slide: ImageTextSliderSlide) => {
  return isMobile.value ? slide.mobile.textPositionX : slide.desktop.textPositionX;
};

const resolvePositionY = (slide: ImageTextSliderSlide) => {
  return isMobile.value ? slide.mobile.textPositionY : slide.desktop.textPositionY;
};

const resolveAlignItems = (slide: ImageTextSliderSlide): CSSProperties['alignItems'] => {
  const x = resolvePositionX(slide);
  if (x === 'center') return 'center';
  if (x === 'end') return 'flex-end';
  return 'flex-start';
};

const resolveJustifyContent = (slide: ImageTextSliderSlide): CSSProperties['justifyContent'] => {
  const y = resolvePositionY(slide);
  if (y === 'center') return 'center';
  if (y === 'end') return 'flex-end';
  return 'flex-start';
};

const getTextAreaStyle = (slide: ImageTextSliderSlide): CSSProperties => {
  const spacing = isMobile.value ? slide.mobile : slide.desktop;

  return {
    alignItems: resolveAlignItems(slide),
    justifyContent: resolveJustifyContent(slide),
    textAlign: resolveTextAlign(slide),
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
    color: '#ffffff',
  };
};

const isExternalLink = (link: string) => /^(https?:)?\/\//.test(link);

const getCtaProps = (slide: ImageTextSliderSlide) => {
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
.image-text-slider :deep(.swiper-pagination) {
  position: static;
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.image-text-slider :deep(.image-text-slider__bullet) {
  width: 3.5rem;
  height: 0.14rem;
  border-radius: 999px;
  background: #cbd5e1;
  opacity: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-text-slider :deep(.image-text-slider__bullet--active) {
  background: #1f2937;
}

.image-text-slider__nav {
  position: absolute;
  bottom: 0.15rem;
  z-index: 10;
  transform: none;
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

.image-text-slider__nav--prev {
  left: 0;
}

.image-text-slider__nav--next {
  right: 0;
}

.image-text-slider__slide {
  background: #0f172a;
}

.image-text-slider__text {
  position: relative;
}

.image-text-slider__text::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.72));
  pointer-events: none;
}

.image-text-slider__text > * {
  position: relative;
  z-index: 1;
}

.image-text-slider__cta {
  --button-background: #d9ff00;
  --button-text: #0b1220;
}
</style>
