import type { ImagesData } from '@plentymarkets/shop-api';

export type GradientSettings = {
  enabled?: boolean;
  type?: 'linear' | 'radial';
  startColor?: string;
  endColor?: string;
  angle?: number;
  radius?: number;
  startX?: number;
  startY?: number;
};

export type BoxSpacing = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type HeaderStyle = {
  subline?: string;
  headline?: string;
  sublineColor?: string;
  headlineColor?: string;
  sublineFontSize?: number;
  headlineFontSize?: number;
  backgroundColor?: string;
  gradient?: GradientSettings;
  margin?: BoxSpacing;
  padding?: BoxSpacing;
};

export type ImageGalleryContent = {
  index?: number;
  thumbnails: {
    showThumbnails?: boolean;
    thumbnailType?: string;
    enableHoverZoom?: boolean;
  };
  layout: {
    fullWidth?: boolean;
    backgroundColor?: string;
    gradient?: GradientSettings;
    margin?: BoxSpacing;
    padding?: BoxSpacing;
  };
  header?: HeaderStyle;
};

export type GalleryProps = {
  configuration?: ImageGalleryContent;
  images: ImagesData[];
};
