<template>
  <section class="thumb-slider-neo w-full" :style="wrapperStyle" data-testid="thumb-slider-neo">
    <div class="thumb-slider-neo__inner">
      <header v-if="headerVisible" class="thumb-slider-neo__header" :style="headerStyle">
        <p v-if="contentHeader.subline" class="thumb-slider-neo__subline" :style="sublineStyle">
          {{ contentHeader.subline }}
        </p>
        <h2 v-if="contentHeader.headline" class="thumb-slider-neo__headline" :style="headlineStyle">
          {{ contentHeader.headline }}
        </h2>
      </header>

      <div class="thumb-slider-neo__slider" :style="sliderStyle">
        <span
          v-if="controls.accentBars"
          class="thumb-slider-neo__accent thumb-slider-neo__accent--top"
          :style="accentBarStyle"
          aria-hidden="true"
        />
        <span
          v-if="controls.accentBars"
          class="thumb-slider-neo__accent thumb-slider-neo__accent--bottom"
          :style="accentBarStyle"
          aria-hidden="true"
        />

        <Swiper
          :modules="modules"
          :slides-per-view="mobileSlidesPerView"
          :breakpoints="breakpoints"
          :space-between="controls.tileGap"
          :slides-per-group="controls.slidesPerGroup"
          :speed="controls.speed"
          :autoplay="autoplayConfig"
          :loop="loopEnabled"
          :rewind="rewindEnabled"
          :loop-additional-slides="loopAdditionalSlides"
          :centered-slides="controls.peekSlides"
          :navigation="navigationConfig"
          :watch-overflow="false"
          class="thumb-slider-neo__swiper"
        >
          <SwiperSlide v-for="(item, index) in renderedItems" :key="`thumb-${index}-${item.sourceIndex}`">
            <component
              :is="item.link ? NuxtLink : 'div'"
              :to="item.link ? localePath(item.link) : undefined"
              class="thumb-slider-neo__tile block"
              :style="tileStyle"
              :data-testid="`thumb-slider-neo-item-${index}`"
            >
              <NuxtImg
                v-if="item.image"
                :src="item.image"
                :alt="item.alt"
                class="thumb-slider-neo__image"
                width="400"
                height="220"
              />
              <p v-if="item.text" class="thumb-slider-neo__text" :style="tileTextStyle">{{ item.text }}</p>
            </component>
          </SwiperSlide>
        </Swiper>

        <button
          v-if="showNavigationArrows"
          type="button"
          :class="[`thumb-slider-neo-prev-${sliderId}`, 'thumb-slider-neo__nav thumb-slider-neo__nav--prev']"
          :style="arrowStyle"
          aria-label="Previous slide"
        >
          <SfIconChevronLeft />
        </button>
        <button
          v-if="showNavigationArrows"
          type="button"
          :class="[`thumb-slider-neo-next-${sliderId}`, 'thumb-slider-neo__nav thumb-slider-neo__nav--next']"
          :style="arrowStyle"
          aria-label="Next slide"
        >
          <SfIconChevronRight />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Navigation } from 'swiper/modules';
import { SfIconChevronLeft, SfIconChevronRight } from '@storefront-ui/vue';
import type { CSSProperties } from 'vue';
import type { ThumbSliderNeoContent, ThumbSliderNeoProps } from './types';
import 'swiper/css';
import 'swiper/css/navigation';

const props = defineProps<ThumbSliderNeoProps>();

const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');
const sliderId = computed(() => (props.meta?.uuid || 'thumb-slider-neo').replace(/[^a-zA-Z0-9_-]/g, ''));

const ensureSpacing = (spacing?: { top?: number; right?: number; bottom?: number; left?: number }) => ({
  top: spacing?.top ?? 0,
  right: spacing?.right ?? 0,
  bottom: spacing?.bottom ?? 0,
  left: spacing?.left ?? 0,
});

const ensureGradient = (gradient?: ThumbSliderNeoContent['controls']['tileGradient']) => ({
  enabled: gradient?.enabled === true,
  type: gradient?.type ?? 'linear',
  startColor: gradient?.startColor ?? '#1f2937',
  endColor: gradient?.endColor ?? '#0f172a',
  angle: gradient?.angle ?? 135,
  radius: gradient?.radius ?? 100,
  startX: gradient?.startX ?? 50,
  startY: gradient?.startY ?? 50,
});

const controls = computed(() => {
  const raw = props.content?.controls ?? {};
  return {
    fullWidth: raw.fullWidth !== false,
    autoplay: raw.autoplay === true,
    autoplayDelay: raw.autoplayDelay ?? 3500,
    speed: raw.speed ?? 600,
    loop: raw.loop !== false,
    showArrows: raw.showArrows !== false,
    arrowColor: raw.arrowColor ?? '#ffffff',
    accentBars: raw.accentBars !== false,
    accentBarColor: raw.accentBarColor ?? '#d7ff00',
    accentBarHeight: raw.accentBarHeight ?? 30,
    accentBarWidth: raw.accentBarWidth ?? 32,
    peekSlides: raw.peekSlides !== false,
    sidePeek: raw.sidePeek ?? 0.45,
    slidesPerViewDesktop: raw.slidesPerViewDesktop ?? 5,
    slidesPerViewMobile: raw.slidesPerViewMobile ?? 2,
    slidesPerGroup: raw.slidesPerGroup ?? 1,
    tileGap: raw.tileGap ?? 8,
    tileSkew: raw.tileSkew ?? -8,
    tileBackgroundColor: raw.tileBackgroundColor ?? '#111827',
    tileTextColor: raw.tileTextColor ?? '#ffffff',
    tileTextAlign: raw.tileTextAlign ?? 'left',
    tileGradient: ensureGradient(raw.tileGradient),
    tilePadding: ensureSpacing(raw.tilePadding),
    tileTextPadding: ensureSpacing(raw.tileTextPadding),
    margin: ensureSpacing(raw.margin),
    padding: ensureSpacing(raw.padding),
  };
});

const contentHeader = computed(() => {
  const raw = props.content?.header ?? {};
  return {
    subline: raw.subline ?? '',
    headline: raw.headline ?? '',
    sublineAlignment: raw.sublineAlignment ?? 'center',
    headlineAlignment: raw.headlineAlignment ?? 'center',
    sublineColor: raw.sublineColor ?? '#64748b',
    headlineColor: raw.headlineColor ?? '#0f172a',
    sublineBackgroundColor: raw.sublineBackgroundColor ?? 'transparent',
    headlineBackgroundColor: raw.headlineBackgroundColor ?? 'transparent',
    sublineFontSize: raw.sublineFontSize ?? 16,
    headlineFontSize: raw.headlineFontSize ?? 46,
    sublineFontWeight: raw.sublineFontWeight ?? 500,
    headlineFontWeight: raw.headlineFontWeight ?? 700,
    sublineMarginBottom: raw.sublineMarginBottom ?? 0,
    headlineMarginBottom: raw.headlineMarginBottom ?? 0,
    backgroundColor: raw.backgroundColor ?? 'transparent',
    gradient: ensureGradient(raw.gradient),
    margin: ensureSpacing(raw.margin),
    padding: ensureSpacing(raw.padding),
  };
});

const normalizedItems = computed(() => {
  const items = props.content?.items ?? [];
  return items.map((item) => ({
    image: item.image ?? '',
    alt: item.alt ?? '',
    link: item.link ?? '',
    text: item.text ?? '',
  }));
});

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const sidePeekDesktop = computed(() => (controls.value.peekSlides ? clampNumber(controls.value.sidePeek, 0, 1.5) : 0));
const sidePeekMobile = computed(() => (controls.value.peekSlides ? clampNumber(controls.value.sidePeek, 0, 0.75) : 0));

const desktopSlidesPerView = computed(() => controls.value.slidesPerViewDesktop + sidePeekDesktop.value);
const mobileSlidesPerView = computed(() => controls.value.slidesPerViewMobile + sidePeekMobile.value);

const minimumLoopSlides = computed(
  () => Math.ceil(Math.max(desktopSlidesPerView.value, mobileSlidesPerView.value)) + controls.value.slidesPerGroup * 2,
);

const renderedItems = computed(() => {
  const items = normalizedItems.value;
  if (!controls.value.loop || items.length <= 1 || items.length >= minimumLoopSlides.value) {
    return items.map((item, sourceIndex) => ({ ...item, sourceIndex }));
  }

  const repeats = Math.ceil(minimumLoopSlides.value / items.length);
  return Array.from({ length: repeats }).flatMap((_, repeatIndex) =>
    items.map((item, sourceIndex) => ({ ...item, sourceIndex, repeatIndex })),
  );
});

// Swiper loop and centered slides can conflict with small data sets; use rewind for reliable "back to start" behavior.
const loopEnabled = computed(() => false);
const rewindEnabled = computed(() => controls.value.loop && renderedItems.value.length > 1);
const loopAdditionalSlides = computed(() => (loopEnabled.value ? Math.ceil(desktopSlidesPerView.value) : 0));

const showNavigationArrows = computed(() => controls.value.showArrows && renderedItems.value.length > 1);

const modules = computed(() => {
  const activeModules: (typeof Autoplay | typeof Navigation)[] = [];
  if (controls.value.autoplay) activeModules.push(Autoplay);
  if (showNavigationArrows.value) activeModules.push(Navigation);
  return activeModules;
});

const autoplayConfig = computed(() => {
  if (!controls.value.autoplay || renderedItems.value.length <= 1) return false;
  return {
    delay: controls.value.autoplayDelay,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  };
});

const breakpoints = computed(() => ({
  768: {
    slidesPerView: desktopSlidesPerView.value,
    spaceBetween: controls.value.tileGap,
  },
}));

const navigationConfig = computed(() => {
  if (!showNavigationArrows.value) return false;

  return {
    nextEl: `.thumb-slider-neo-next-${sliderId.value}`,
    prevEl: `.thumb-slider-neo-prev-${sliderId.value}`,
  };
});

const gradientToCss = (gradient: ReturnType<typeof ensureGradient>) => {
  if (!gradient.enabled) return undefined;
  if (gradient.type === 'radial') {
    return `radial-gradient(circle ${gradient.radius}% at ${gradient.startX}% ${gradient.startY}%, ${gradient.startColor}, ${gradient.endColor})`;
  }
  return `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
};

const wrapperStyle = computed<CSSProperties>(() => ({
  marginTop: `${controls.value.margin.top}px`,
  marginRight: `${controls.value.margin.right}px`,
  marginBottom: `${controls.value.margin.bottom}px`,
  marginLeft: `${controls.value.margin.left}px`,
  paddingTop: `${controls.value.padding.top}px`,
  paddingRight: `${controls.value.padding.right}px`,
  paddingBottom: `${controls.value.padding.bottom}px`,
  paddingLeft: `${controls.value.padding.left}px`,
}));

const sliderStyle = computed<CSSProperties>(() => ({
  // Background matches tile color so nav clip-path areas and gaps between tiles appear consistent
  backgroundColor: controls.value.tileBackgroundColor,
}));

const headerVisible = computed(() => Boolean(contentHeader.value.subline || contentHeader.value.headline));

const headerStyle = computed<CSSProperties>(() => ({
  marginTop: `${contentHeader.value.margin.top}px`,
  marginRight: `${contentHeader.value.margin.right}px`,
  marginBottom: `${contentHeader.value.margin.bottom}px`,
  marginLeft: `${contentHeader.value.margin.left}px`,
  paddingTop: `${contentHeader.value.padding.top}px`,
  paddingRight: `${contentHeader.value.padding.right}px`,
  paddingBottom: `${contentHeader.value.padding.bottom}px`,
  paddingLeft: `${contentHeader.value.padding.left}px`,
  background: gradientToCss(contentHeader.value.gradient),
  backgroundColor: contentHeader.value.gradient.enabled ? undefined : contentHeader.value.backgroundColor,
}));

const sublineStyle = computed<CSSProperties>(() => ({
  textAlign: contentHeader.value.sublineAlignment,
  color: contentHeader.value.sublineColor,
  backgroundColor: contentHeader.value.sublineBackgroundColor,
  fontSize: `${contentHeader.value.sublineFontSize}px`,
  fontWeight: contentHeader.value.sublineFontWeight,
  marginBottom: `${contentHeader.value.sublineMarginBottom}px`,
}));

const headlineStyle = computed<CSSProperties>(() => ({
  textAlign: contentHeader.value.headlineAlignment,
  color: contentHeader.value.headlineColor,
  backgroundColor: contentHeader.value.headlineBackgroundColor,
  fontSize: `${contentHeader.value.headlineFontSize}px`,
  fontWeight: contentHeader.value.headlineFontWeight,
  marginBottom: `${contentHeader.value.headlineMarginBottom}px`,
}));

const tileStyle = computed<CSSProperties>(() => ({
  background: gradientToCss(controls.value.tileGradient),
  backgroundColor: controls.value.tileGradient.enabled ? undefined : controls.value.tileBackgroundColor,
  transform: `skewX(${controls.value.tileSkew}deg)`,
  paddingTop: `${controls.value.tilePadding.top}px`,
  paddingRight: `${controls.value.tilePadding.right}px`,
  paddingBottom: `${controls.value.tilePadding.bottom}px`,
  paddingLeft: `${controls.value.tilePadding.left}px`,
}));

const tileTextStyle = computed<CSSProperties>(() => ({
  color: controls.value.tileTextColor,
  textAlign: controls.value.tileTextAlign,
  paddingTop: `${controls.value.tileTextPadding.top}px`,
  paddingRight: `${controls.value.tileTextPadding.right}px`,
  paddingBottom: `${controls.value.tileTextPadding.bottom}px`,
  paddingLeft: `${controls.value.tileTextPadding.left}px`,
}));

const arrowStyle = computed<CSSProperties>(() => ({
  color: controls.value.arrowColor,
}));

const accentBarStyle = computed<CSSProperties>(() => ({
  height: `${Math.max(0, controls.value.accentBarHeight)}px`,
  width: `${clampNumber(controls.value.accentBarWidth, 0, 100)}%`,
  backgroundColor: controls.value.accentBarColor,
}));
</script>

<style scoped>
.thumb-slider-neo {
  overflow: hidden;
}

.thumb-slider-neo__header {
  margin-bottom: 3.5rem;
}

.thumb-slider-neo__subline {
  margin-bottom: 0.35rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.thumb-slider-neo__headline {
  margin: 0;
  line-height: 1.1;
}

.thumb-slider-neo__slider {
  position: relative;
}

.thumb-slider-neo__swiper {
  position: relative;
  z-index: 1;
  width: 100%;
}

.thumb-slider-neo__accent {
  position: absolute;
  z-index: 2;
  display: block;
  pointer-events: none;
}

.thumb-slider-neo__accent--top {
  top: 0;
  right: 24px;
}

.thumb-slider-neo__accent--bottom {
  bottom: 4px;
  left: 0;
}

.thumb-slider-neo__tile {
  border-radius: 0.25rem;
  overflow: hidden;
  transform-origin: center;
}

.thumb-slider-neo__image {
  display: block;
  width: 100%;
  height: 185px;
  object-fit: contain;
  transform: skewX(calc(var(--tw-skew-x, 0deg) * -1));
}

.thumb-slider-neo__text {
  margin-top: 0.45rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transform: skewX(calc(var(--tw-skew-x, 0deg) * -1));
}

.thumb-slider-neo__nav {
  position: absolute;
  top: 0;
  z-index: 2;
  display: inline-flex;
  width: 8%;
  min-width: 2.5rem;
  height: 173px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: #252525;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s;
}

.thumb-slider-neo__nav:hover {
  opacity: 0.75;
}

.thumb-slider-neo__nav--prev {
  left: 0;
  clip-path: polygon(0 0, 65% 0, 77% 100%, 0 100%);
}

.thumb-slider-neo__nav--next {
  right: 0;
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);
}

.thumb-slider-neo__nav :deep(svg) {
  width: 2rem;
  height: 2rem;
}
</style>
