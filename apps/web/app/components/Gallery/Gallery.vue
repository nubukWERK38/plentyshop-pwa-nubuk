<template>
  <div :class="['h-full flex scroll-smooth relative', galleryDirClass, galleryGapClass]" data-testid="gallery">
    <div
      ref="mainBox"
      class="after:block after:pt-[100%] flex-1 min-w-0 relative overflow-hidden w-full max-h-[600px]"
      data-testid="gallery-images"
    >
      <Swiper
        :modules="mainModules"
        :slides-per-view="1"
        :loop="false"
        :keyboard="{ enabled: true }"
        :thumbs="{ swiper: thumbsSwiper || null }"
        class="!absolute top-0 left-0 w-full h-full"
        @swiper="onMainInit"
        @slide-change="onMainSlideChange"
      >
        <SwiperSlide
          v-for="(image, index) in images"
          :key="`main-${index}`"
          class="!h-full !w-full flex items-center justify-center"
        >
          <ZoomableImage
            :images="images"
            :image="image"
            :index="index"
            :active-index="activeIndex"
            :is-first-image="index === 0"
            :product-name="productName"
            :disable-zoom="shouldEnableEditorFeatures || configuration.thumbnails.enableHoverZoom === false"
            class="cursor-zoom-in"
            @click="openLightbox(index)"
          />
        </SwiperSlide>
      </Swiper>
    </div>

    <div
      v-show="configuration.thumbnails.showThumbnails"
      :class="['md:relative', thumbContainerClass, isSide ? 'md:self-stretch' : 'md:w-full']"
    >
      <div class="hidden md:block md:relative md:h-full md:overflow-hidden">
        <Swiper
          :modules="thumbsModules"
          :direction="thumbsDirection"
          :slides-per-view="thumbsSlidesPerView"
          :space-between="4"
          :free-mode="true"
          :watch-slides-progress="true"
          :centered-slides="false"
          :class="thumbsSwiperClass"
          :style="isSide ? { height: `${thumbsHeight}px` } : {}"
          @swiper="onThumbsInit"
        >
          <SwiperSlide
            v-for="(image, index) in images"
            :key="`thumb-${index}`"
            :class="thumbSlideClass(index)"
            @click="slideTo(index)"
          >
            <NuxtImg
              :alt="getImageAlt(image, index)"
              :title="productImageGetters.getImageName(image) ? productImageGetters.getImageName(image) : null"
              class="rounded h-full w-full object-contain"
              :class="activeIndex === index ? 'border-primary-500' : ''"
              :width="productImageGetters.getImageWidth(image) ?? 80"
              :height="productImageGetters.getImageHeight(image) ?? 80"
              :src="productImageGetters.getImageUrlPreview(image)"
              :quality="80"
              loading="lazy"
            />
          </SwiperSlide>
        </Swiper>

        <template v-if="hasMoreImages">
          <button
            v-if="showNav && mainSwiper"
            :disabled="atStart"
            :class="prevThumbBtnClass"
            aria-label="Previous"
            @click="mainSwiper?.slidePrev()"
          >
            <SfIconChevronLeft />
          </button>
          <button
            v-if="showNav && mainSwiper"
            :disabled="atEnd"
            :class="nextThumbBtnClass"
            aria-label="Next"
            @click="mainSwiper?.slideNext()"
          >
            <SfIconChevronRight />
          </button>
        </template>
      </div>

      <div v-if="hasMoreImages" class="flex md:hidden gap-0.5" v-bind="carouselProps">
        <button
          v-for="(image, index) in images"
          :key="productImageGetters.getImageUrl(image)"
          type="button"
          :aria-current="activeIndex === index"
          class="relative shrink-0 pb-1 border-b-4 cursor-pointer transition-colors flex-grow"
          :class="[activeIndex === index ? 'border-primary-500' : 'border-neutral-200']"
          @click="slideTo(index)"
        />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isLightboxOpen" class="product-lightbox" role="dialog" aria-modal="true" @click.self="closeLightbox">
      <div class="product-lightbox__shell">
        <div class="product-lightbox__toolbar">
          <div class="product-lightbox__counter">{{ lightboxIndex + 1 }} / {{ images.length }}</div>
          <div class="product-lightbox__actions">
            <button
              type="button"
              class="product-lightbox__control"
              :disabled="zoomLevel <= minZoom"
              aria-label="Bild verkleinern"
              @click="zoomOut"
            >
              <SfIconRemove />
            </button>
            <span class="product-lightbox__zoom">{{ Math.round(zoomLevel * 100) }}%</span>
            <button
              type="button"
              class="product-lightbox__control"
              :disabled="zoomLevel >= maxZoom"
              aria-label="Bild vergroessern"
              @click="zoomIn"
            >
              <SfIconAdd />
            </button>
            <button
              type="button"
              class="product-lightbox__control"
              aria-label="Lightbox schliessen"
              @click="closeLightbox"
            >
              <SfIconClose />
            </button>
          </div>
        </div>

        <div class="product-lightbox__viewer">
          <button
            v-if="hasMoreImages"
            type="button"
            class="product-lightbox__nav product-lightbox__nav--prev"
            :disabled="lightboxIndex === 0"
            aria-label="Vorheriges Bild"
            @click="showPreviousImage"
          >
            <SfIconChevronLeft />
          </button>

          <div class="product-lightbox__stage">
            <NuxtImg
              v-if="lightboxImage"
              :key="`lightbox-${lightboxIndex}`"
              class="product-lightbox__image"
              :style="{ transform: `scale(${zoomLevel})` }"
              :alt="getImageAlt(lightboxImage, lightboxIndex)"
              :title="getImageTitle(lightboxImage) || null"
              :src="getImageSrc(lightboxImage)"
              :width="productImageGetters.getImageWidth(lightboxImage) || undefined"
              :height="productImageGetters.getImageHeight(lightboxImage) || undefined"
              quality="90"
              loading="eager"
              draggable="false"
            />
          </div>

          <button
            v-if="hasMoreImages"
            type="button"
            class="product-lightbox__nav product-lightbox__nav--next"
            :disabled="lightboxIndex === images.length - 1"
            aria-label="Naechstes Bild"
            @click="showNextImage"
          >
            <SfIconChevronRight />
          </button>
        </div>

        <div v-if="hasMoreImages" class="product-lightbox__thumbs" role="list">
          <button
            v-for="(image, index) in images"
            :key="`lightbox-thumb-${index}`"
            type="button"
            class="product-lightbox__thumb"
            :class="{ 'product-lightbox__thumb--active': lightboxIndex === index }"
            :aria-current="lightboxIndex === index"
            :aria-label="`Bild ${index + 1} anzeigen`"
            role="listitem"
            @click="selectLightboxImage(index)"
          >
            <NuxtImg
              class="product-lightbox__thumb-image"
              :alt="getImageAlt(image, index)"
              :src="productImageGetters.getImageUrlPreview(image) || getImageSrc(image)"
              :width="productImageGetters.getImageWidth(image) || 96"
              :height="productImageGetters.getImageHeight(image) || 96"
              quality="75"
              loading="lazy"
            />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Thumbs, FreeMode, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SfIconAdd, SfIconChevronLeft, SfIconChevronRight, SfIconClose, SfIconRemove } from '@storefront-ui/vue';
import { productImageGetters } from '@plentymarkets/shop-api';
import type { ImagesData } from '@plentymarkets/shop-api';
import type { GalleryProps } from '~/components/Gallery/types';
import { getProductImageAlt } from '~/utils/productImageAlt';

const props = withDefaults(defineProps<GalleryProps>(), {
  configuration: () => ({
    thumbnails: {
      showThumbnails: true,
      thumbnailType: 'left-vertical',
      enableHoverZoom: true,
    },
    layout: {
      fullWidth: false,
    },
  }),
});

const { shouldEnableEditorFeatures } = useEditorState();

const configuration = computed(() => props.configuration);
const { images } = toRefs(props);
const productName = computed(() => props.productName ?? '');
const activeIndex = ref(0);
const isLightboxOpen = ref(false);
const lightboxIndex = ref(0);
const zoomLevel = ref(1);
const minZoom = 1;
const maxZoom = 3;
const zoomStep = 0.25;

const viewport = useViewport();
const showNav = computed(() => !viewport.isLessThan('md'));

const type = computed(() => configuration.value.thumbnails.thumbnailType);
const isSide = computed(() => type.value === 'left-vertical' || type.value === 'right-vertical');
const isLeft = computed(() => type.value === 'left-vertical');

const galleryDirClass = computed(() => (isSide.value ? 'flex-col md:flex-row' : 'flex-col md:flex-col'));
const galleryGapClass = computed(() => (isSide.value ? 'md:gap-4' : 'md:gap-2'));
const thumbContainerClass = computed(() => [isLeft.value ? 'md:order-first' : 'md:order-last']);
const hasMoreImages = computed(() => images.value.length > 1);

const thumbsDirection = computed(() => (isSide.value ? 'vertical' : 'horizontal'));
const thumbsSlidesPerView = computed(() => (isSide.value ? 'auto' : Math.min(images.value.length, 6)));
const thumbsSwiperClass = computed(() =>
  isSide.value ? 'hidden md:block md:h-full md:w-[5.5rem]' : 'hidden md:block md:w-full md:min-h-[5.5rem]',
);

const thumbSlideClass = (index: number) =>
  isSide.value
    ? [
        '!w-[5rem] !h-[5rem] flex items-center justify-center cursor-pointer snap-start',
        activeIndex.value === index ? 'opacity-100' : 'opacity-80 hover:opacity-100',
      ]
    : [
        '!w-[5rem] !h-[5rem] inline-flex items-center justify-center cursor-pointer snap-start',
        activeIndex.value === index ? 'opacity-100' : 'opacity-80 hover:opacity-100',
      ];

const prevThumbBtnClass = computed(() =>
  [
    'hidden md:flex items-center justify-center absolute z-[1] rounded-full p-2 bg-white ring-1 ring-neutral-300 disabled:opacity-40',
    isSide.value ? 'left-1/2 -translate-x-1/2 top-2 rotate-90' : 'left-2 top-1/2 -translate-y-1/2',
  ].join(' '),
);

const nextThumbBtnClass = computed(() =>
  [
    'hidden md:flex items-center justify-center absolute z-[1] rounded-full p-2 bg-white ring-1 ring-neutral-300 disabled:opacity-40',
    isSide.value ? 'left-1/2 -translate-x-1/2 bottom-2 rotate-90' : 'right-2 top-1/2 -translate-y-1/2',
  ].join(' '),
);

const mainBox = ref<HTMLElement | null>(null);
const thumbsHeight = ref(0);
const mainSwiperRef = ref<SwiperType | null>(null);
const thumbsSwiperRef = ref<SwiperType | null>(null);

const mainSwiper = computed(() => mainSwiperRef.value);
const thumbsSwiper = computed(() => thumbsSwiperRef.value as SwiperType | null);

const mainModules = [Thumbs, Keyboard, A11y];
const thumbsModules = [FreeMode, Thumbs];

const onMainInit = (swiper: SwiperType) => {
  mainSwiperRef.value = swiper;
  activeIndex.value = swiper.realIndex ?? 0;
};

const onThumbsInit = (swiper: SwiperType) => {
  thumbsSwiperRef.value = swiper;
};

const onMainSlideChange = (swiper: SwiperType) => {
  activeIndex.value = swiper.realIndex ?? 0;
};

const slideTo = (index: number) => {
  activeIndex.value = index;
  if (mainSwiper.value?.params.loop) mainSwiper.value.slideToLoop(index);
  else mainSwiper.value?.slideTo(index);
};

const atStart = computed(() => activeIndex.value === 0);
const atEnd = computed(() => activeIndex.value === images.value.length - 1);
const lightboxImage = computed(() => images.value[lightboxIndex.value]);

const carouselProps = computed(() => {
  return hasMoreImages.value ? { role: 'group' } : {};
});

const resetZoom = () => {
  zoomLevel.value = 1;
};

const getImageSrc = (image: ImagesData) =>
  productImageGetters.getImageUrl(image) ||
  productImageGetters.getImageUrlMiddle(image) ||
  productImageGetters.getImageUrlPreview(image) ||
  '';

const getImageAlt = (image: ImagesData, index: number) => getProductImageAlt(image, productName.value, index);

const getImageTitle = (image: ImagesData) =>
  productImageGetters.getImageName(image) || productImageGetters.getCleanImageName(image) || '';

const openLightbox = (index: number) => {
  if (shouldEnableEditorFeatures.value || images.value.length === 0) return;
  lightboxIndex.value = index;
  resetZoom();
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
  resetZoom();
};

const selectLightboxImage = (index: number) => {
  lightboxIndex.value = index;
  slideTo(index);
  resetZoom();
};

const showPreviousImage = () => {
  if (lightboxIndex.value <= 0) return;
  selectLightboxImage(lightboxIndex.value - 1);
};

const showNextImage = () => {
  if (lightboxIndex.value >= images.value.length - 1) return;
  selectLightboxImage(lightboxIndex.value + 1);
};

const zoomIn = () => {
  zoomLevel.value = Math.min(maxZoom, zoomLevel.value + zoomStep);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(minZoom, zoomLevel.value - zoomStep);
};

const onLightboxKeydown = (event: KeyboardEvent) => {
  if (!isLightboxOpen.value) return;

  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showPreviousImage();
  if (event.key === 'ArrowRight') showNextImage();
  if (event.key === '+' || event.key === '=') zoomIn();
  if (event.key === '-') zoomOut();
};

watch(isLightboxOpen, (open) => {
  if (!import.meta.client) return;
  document.body.classList.toggle('product-lightbox-open', open);
});

onMounted(() => {
  if (!mainBox.value) return;
  const ro = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const h = Math.floor(entry.contentRect.height);
    if (h && h !== thumbsHeight.value) thumbsHeight.value = h;
  });
  ro.observe(mainBox.value);
  onBeforeUnmount(() => ro.disconnect());
});

onMounted(() => {
  window.addEventListener('keydown', onLightboxKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onLightboxKeydown);
  if (import.meta.client) document.body.classList.remove('product-lightbox-open');
});
</script>

<style src="swiper/css"></style>

<style>
body.product-lightbox-open {
  overflow: hidden;
}
</style>

<style scoped>
.product-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  background: rgba(17, 20, 22, 0.82);
  backdrop-filter: blur(10px);
}

.product-lightbox__shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: clamp(16px, 2.5vw, 28px);
  width: min(90vw, 1440px);
  height: min(90vh, 940px);
  padding: clamp(18px, 3vw, 34px);
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
}

.product-lightbox__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.product-lightbox__counter {
  color: var(--ci-muted);
  font-size: 14px;
  font-weight: 700;
}

.product-lightbox__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-lightbox__control,
.product-lightbox__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ci-dark);
  background: #ffffff;
  border: 1px solid rgba(17, 20, 22, 0.14);
  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}

.product-lightbox__control {
  width: 42px;
  height: 42px;
}

.product-lightbox__control:hover:not(:disabled),
.product-lightbox__nav:hover:not(:disabled) {
  color: var(--ci-dark);
  background: var(--ci-accent);
  border-color: var(--ci-accent);
}

.product-lightbox__control:disabled,
.product-lightbox__nav:disabled {
  cursor: default;
  opacity: 0.35;
}

.product-lightbox__zoom {
  min-width: 52px;
  color: var(--ci-dark);
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}

.product-lightbox__viewer {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  min-height: 0;
}

.product-lightbox__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: auto;
  background: #f7f8f8;
}

.product-lightbox__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 180ms ease;
  transform-origin: center;
}

.product-lightbox__nav {
  width: clamp(44px, 5vw, 56px);
  height: clamp(44px, 5vw, 56px);
}

.product-lightbox__thumbs {
  display: flex;
  gap: 10px;
  max-width: 100%;
  padding-bottom: 2px;
  overflow-x: auto;
}

.product-lightbox__thumb {
  flex: 0 0 auto;
  width: clamp(68px, 8vw, 96px);
  height: clamp(68px, 8vw, 96px);
  padding: 6px;
  background: #ffffff;
  border: 2px solid transparent;
  opacity: 0.72;
  transition:
    border-color 150ms ease,
    opacity 150ms ease,
    transform 150ms ease;
}

.product-lightbox__thumb:hover,
.product-lightbox__thumb--active {
  border-color: var(--ci-accent);
  opacity: 1;
}

.product-lightbox__thumb--active {
  background: var(--ci-dark);
}

.product-lightbox__thumb-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 767px) {
  .product-lightbox {
    padding: 0;
  }

  .product-lightbox__shell {
    width: 100vw;
    height: 100dvh;
    padding: 16px;
  }

  .product-lightbox__toolbar {
    align-items: flex-start;
  }

  .product-lightbox__actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .product-lightbox__viewer {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .product-lightbox__nav {
    position: absolute;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
  }

  .product-lightbox__nav--prev {
    left: 20px;
  }

  .product-lightbox__nav--next {
    right: 20px;
  }
}
</style>
