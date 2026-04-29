import type { Block } from '@plentymarkets/shop-api';

interface MultiGridLayout {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  backgroundColor?: string;
  gap?: string;
  gradientEnabled?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientAngle?: number;
  gradientRadius?: number;
  gradientStartX?: number;
  gradientStartY?: number;
}

export type MultiGridProps = {
  name: string;
  type: string;
  content: Block[];
  configuration: {
    columnWidths: number[];
    layout?: MultiGridLayout;
    sticky?: number[];
  };
  meta: {
    uuid: string;
  };
  index?: number;
};

export type EmptyGridBlockProps = {
  name: string;
  type: string;
  content: [];
  meta: {
    uuid: string;
  };
};

export type AlignableBlock = Block & {
  content?: {
    imageAlignment?: string;
    alignment?: string;
    [key: string]: unknown;
  };
};

export type ColumnBlock = Block & {
  content?: Block[];
  configuration: {
    columnWidths: number[];
    sticky?: number[];
    layout?: {
      gap: string;
      marginTop?: number;
      marginRight?: number;
      marginBottom?: number;
      marginLeft?: number;
      paddingTop?: number;
      paddingRight?: number;
      paddingBottom?: number;
      paddingLeft?: number;
      backgroundColor?: string;
      gradientEnabled?: boolean;
      gradientType?: 'linear' | 'radial';
      gradientStartColor?: string;
      gradientEndColor?: string;
      gradientAngle?: number;
      gradientRadius?: number;
      gradientStartX?: number;
      gradientStartY?: number;
      fullWidth?: boolean;
    };
  };
};
