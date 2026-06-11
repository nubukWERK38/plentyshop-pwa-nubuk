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
  gap?: string;
  fullWidth?: boolean;
}

export type ColumnLayoutProps = {
  name: string;
  type: string;
  content: Block[];
  configuration: {
    columns?: number;
    columnWidths: number[];
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
