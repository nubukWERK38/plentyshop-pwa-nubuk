export type ImageBannerNeoSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ImageBannerNeoSlide = {
  image: {
    desktop: string;
    mobile: string;
    alt: string;
  };
  text: {
    subline: string;
    headline: string;
    ctaLabel: string;
    ctaLink: string;
    ctaVariant: 'primary' | 'secondary';
    backgroundImage: string;
    backgroundColor: string;
    sublineColor: string;
    headlineColor: string;
  };
  desktop: {
    imagePosition: 'left' | 'right';
    textAlignment: 'left' | 'center' | 'right';
    textPositionX: 'start' | 'center' | 'end';
    textPositionY: 'start' | 'center' | 'end';
    margin: ImageBannerNeoSpacing;
    padding: ImageBannerNeoSpacing;
  };
  mobile: {
    textAlignment: 'left' | 'center' | 'right';
    textPositionX: 'start' | 'center' | 'end';
    textPositionY: 'start' | 'center' | 'end';
    margin: ImageBannerNeoSpacing;
    padding: ImageBannerNeoSpacing;
  };
};

export type ImageBannerNeoContent = {
  slides: ImageBannerNeoSlide[];
  controls: {
    showPagination: boolean;
    showArrows: boolean;
    arrowsOnHover: boolean;
    height: number;
    fullWidth: boolean;
  };
};

export type ImageBannerNeoProps = {
  name: string;
  type: string;
  content: ImageBannerNeoContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ImageBannerNeoFormProps = {
  uuid?: string;
};
