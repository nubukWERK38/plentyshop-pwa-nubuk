export type ImageTextSliderSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ImageTextSliderSlide = {
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
  };
  desktop: {
    imagePosition: 'left' | 'right';
    textAlignment: 'left' | 'center' | 'right';
    margin: ImageTextSliderSpacing;
    padding: ImageTextSliderSpacing;
  };
  mobile: {
    textAlignment: 'left' | 'center' | 'right';
    margin: ImageTextSliderSpacing;
    padding: ImageTextSliderSpacing;
  };
};

export type ImageTextSliderContent = {
  slides: ImageTextSliderSlide[];
  controls: {
    showPagination: boolean;
    showArrows: boolean;
    arrowsOnHover: boolean;
  };
};

export type ImageTextSliderProps = {
  name: string;
  type: string;
  content: ImageTextSliderContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ImageTextSliderFormProps = {
  uuid?: string;
};
