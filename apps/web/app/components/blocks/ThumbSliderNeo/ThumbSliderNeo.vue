<template>
  <section class="thumb-slider-neo w-full" :style="wrapperStyle" data-testid="thumb-slider-neo">
    <div class="thumb-slider-neo__inner" :class="controls.fullWidth ? 'w-full' : 'w-full'">
      <header v-if="headerVisible" class="thumb-slider-neo__header" :style="headerStyle">
        <p v-if="contentHeader.subline" class="thumb-slider-neo__subline" :style="sublineStyle">{{ contentHeader.subline }}</p>
        <h2 v-if="contentHeader.headline" class="thumb-slider-neo__headline" :style="headlineStyle">{{ contentHeader.headline }}</h2>
      </header>

      <Swiper
        :modules="modules"
        :slides-per-view="controls.slidesPerViewMobile"
        :breakpoints="breakpoints"
        :space-between="16"
        :slides-per-group="controls.slidesPerGroup"
        :speed="controls.speed"
        :autoplay="autoplayConfig"
        :loop="normalizedItems.length > controls.slidesPerViewDesktop"
      >
        <SwiperSlide v-for="(item, index) in normalizedItems" :key="`thumb-${index}`">
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
            <p v-if="item.text" class="thumb-slider-neo__text">{{ item.text }}</p>
          </component>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import type { CSSProperties } from 'vue';
import type { ThumbSliderNeoContent, ThumbSliderNeoProps } from './types';
import 'swiper/css';

const props = defineProps<ThumbSliderNeoProps>();

const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');

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
    slidesPerViewDesktop: raw.slidesPerViewDesktop ?? 5,
    slidesPerViewMobile: raw.slidesPerViewMobile ?? 2,
    slidesPerGroup: raw.slidesPerGroup ?? 1,
    tileSkew: raw.tileSkew ?? -8,
    tileBackgroundColor: raw.tileBackgroundColor ?? '#111827',
    tileGradient: ensureGradient(raw.tileGradient),
    margin: ensureSpacing(raw.margin),
    padding: ensureSpacing(raw.padding),
  };
});

const contentHeader = computed(() => {
  const raw = props.content?.header ?? {};
  return {
    subline: raw.subline ?? '',
    headline: raw.headline ?? '',
    sublineColor: raw.sublineColor ?? '#64748b',
    headlineColor: raw.headlineColor ?? '#0f172a',
    sublineFontSize: raw.sublineFontSize ?? 16,
    headlineFontSize: raw.headlineFontSize ?? 46,
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

const modules = [Autoplay];

const autoplayConfig = computed(() => {
  if (!controls.value.autoplay) return false;
  return {
    delay: controls.value.autoplayDelay,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  };
});

const breakpoints = computed(() => ({
  768: {
    slidesPerView: controls.value.slidesPerViewDesktop,
  },
}));

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
  color: contentHeader.value.sublineColor,
  fontSize: `${contentHeader.value.sublineFontSize}px`,
}));

const headlineStyle = computed<CSSProperties>(() => ({
  color: contentHeader.value.headlineColor,
  fontSize: `${contentHeader.value.headlineFontSize}px`,
}));

const tileStyle = computed<CSSProperties>(() => ({
  background: gradientToCss(controls.value.tileGradient),
  backgroundColor: controls.value.tileGradient.enabled ? undefined : controls.value.tileBackgroundColor,
  transform: `skewX(${controls.value.tileSkew}deg)`,
}));
</script>

<style scoped>
.thumb-slider-neo__header {
  margin-bottom: 1rem;
}

.thumb-slider-neo__subline {
  margin-bottom: 0.35rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
}

.thumb-slider-neo__headline {
  margin: 0;
  line-height: 1.1;
  font-weight: 700;
}

.thumb-slider-neo__tile {
  border-radius: 0.25rem;
  overflow: hidden;
  padding: 0.5rem;
  transform-origin: center;
}

.thumb-slider-neo__image {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: contain;
  transform: skewX(calc(var(--tw-skew-x, 0deg) * -1));
}

.thumb-slider-neo__text {
  margin-top: 0.45rem;
  color: #ffffff;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transform: skewX(calc(var(--tw-skew-x, 0deg) * -1));
}
</style>
