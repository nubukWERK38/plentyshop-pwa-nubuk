import type { Block } from '@plentymarkets/shop-api';

interface ColumnLayoutAppearance {
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
  gap?: string;
  fullWidth?: boolean;
}

export type ColumnLayoutProps = {
  name: string;
  type: string;
  content?: Block[];
  configuration?: {
    columns?: number;
    columnWidths?: number[];
    layout?: ColumnLayoutAppearance;
  };
  meta: {
    uuid: string;
  };
  index?: number;
};

export type ColumnLayoutBlock = Block & {
  content?: Block[];
  configuration: {
    columns?: number;
    columnWidths: number[];
    layout?: ColumnLayoutAppearance;
  };
};
