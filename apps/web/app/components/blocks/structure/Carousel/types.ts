import type { Block } from '@plentymarkets/shop-api';

export type SlideBlock = Block & {
  configuration?: {
    visible?: boolean;
  };
};

export type CarouselStructureProps = {
  name: string;
  type: string;
  content: SlideBlock[];
  configuration: {
    controls: {
      color: string;
      displayArrows: boolean;
      displayIndicators?: boolean;
      autoplay?: boolean;
      autoplayDelay?: number;
      loop?: boolean;
      transitionSpeed?: number;
      globalBackgroundColor?: string;
      globalTextColor?: string;
    };
    layout?: {
      fullWidth?: boolean;
    };
    visible?: boolean;
  };
  index: number;
  meta: {
    uuid: string;
  };
};
