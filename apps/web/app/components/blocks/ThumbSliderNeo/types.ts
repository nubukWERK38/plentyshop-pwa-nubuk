export type ThumbSliderNeoSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ThumbSliderNeoGradient = {
  enabled?: boolean;
  type?: 'linear' | 'radial';
  startColor?: string;
  endColor?: string;
  angle?: number;
  radius?: number;
  startX?: number;
  startY?: number;
};

export type ThumbSliderNeoHeader = {
  subline?: string;
  headline?: string;
  sublineColor?: string;
  headlineColor?: string;
  sublineFontSize?: number;
  headlineFontSize?: number;
  backgroundColor?: string;
  gradient?: ThumbSliderNeoGradient;
  margin?: ThumbSliderNeoSpacing;
  padding?: ThumbSliderNeoSpacing;
};

export type ThumbSliderNeoItem = {
  image: string;
  alt: string;
  link: string;
  text: string;
};

export type ThumbSliderNeoContent = {
  header: ThumbSliderNeoHeader;
  items: ThumbSliderNeoItem[];
  controls: {
    fullWidth: boolean;
    autoplay: boolean;
    autoplayDelay: number;
    speed: number;
    slidesPerViewDesktop: number;
    slidesPerViewMobile: number;
    slidesPerGroup: number;
    tileSkew: number;
    tileBackgroundColor: string;
    tileGradient?: ThumbSliderNeoGradient;
    margin?: ThumbSliderNeoSpacing;
    padding?: ThumbSliderNeoSpacing;
  };
};

export type ThumbSliderNeoProps = {
  name: string;
  type: string;
  content: ThumbSliderNeoContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ThumbSliderNeoFormProps = {
  uuid?: string;
};
