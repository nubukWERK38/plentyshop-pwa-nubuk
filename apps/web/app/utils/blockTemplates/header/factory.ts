import type { HeaderContainerBlock } from '~/components/blocks/structure/HeaderContainer/types';
import type { Block } from '@plentymarkets/shop-api';
import { v4 as uuid } from 'uuid';

export const HEADER_CONTAINER_BLOCK_NAME = 'HeaderContainer' as const;

export const isHeaderContainerBlock = (block: Block | null | undefined): block is HeaderContainerBlock =>
  block?.name === HEADER_CONTAINER_BLOCK_NAME;

export function createHeaderContainerBlock(
  content: Block[],
  meta?: { uuid?: string; isGlobalTemplate?: boolean },
): HeaderContainerBlock {
  return {
    name: HEADER_CONTAINER_BLOCK_NAME,
    type: 'structure',
    meta: {
      uuid: meta?.uuid || uuid(),
      isGlobalTemplate: meta?.isGlobalTemplate ?? true,
    },
    content,
    configuration: {
      visible: true,
      layout: {
        sticky: false,
      },
    },
  };
}

export function createDefaultHeaderContainerBlock(): HeaderContainerBlock {
  return createHeaderContainerBlock([createUtilityBar(), createNavigation()]);
}

export function createUtilityBar(): Block {
  return {
    name: 'UtilityBar',
    type: 'content',
    meta: {
      uuid: uuid(),
      isGlobalTemplate: true,
    },
    content: {
      layout: {
        paddingTop: 38,
        paddingBottom: 17,
        paddingLeft: 226,
        paddingRight: 226,
        fullWidth: true,
        logoHeight: 41,
        searchWidth: 471,
      },
      sectionOrder: {
        sections: ['logo', 'search', 'actions'],
      },
      sectionVisibility: {
        logo: true,
        search: true,
        actions: true,
      },
      color: {
        iconColor: '#2d5d83',
        backgroundColor: '#ffffff',
      },
      search: {
        displayMode: 'full',
      },
      actions: {
        order: ['account', 'cart', 'language', 'wishlist'],
        visibility: {
          language: false,
          wishlist: false,
          cart: true,
          account: true,
        },
      },
    },
  };
}

export function createNavigation(): Block {
  return {
    name: 'Navigation',
    type: 'content',
    meta: {
      uuid: uuid(),
      isGlobalTemplate: true,
    },
    content: {
      layout: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
      text: {
        textAlignment: 'center',
      },
      color: {
        backgroundColor: '#ffffff',
        textColor: '#161A16',
        hoverBackgroundColor: '#f5f5f5',
      },
    },
  };
}
