import type { Block } from '@plentymarkets/shop-api';

export type HeaderContainerBlock = Block & {
  name: 'HeaderContainer';
  type: 'structure';
  meta: {
    uuid: string;
    isGlobalTemplate?: boolean;
    contactFlagsMigrated?: boolean;
  };
  content: Block[];
  configuration?: {
    visible: boolean;
    layout?: {
      sticky?: boolean;
    };
  };
};

export type HeaderContainerProps = {
  block?: HeaderContainerBlock;
  content: Block[];
};
