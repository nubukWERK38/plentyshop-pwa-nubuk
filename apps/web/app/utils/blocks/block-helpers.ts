import type { Block, GetBlocksResponse } from '@plentymarkets/shop-api';

const FOOTER_BLOCK_NAME = 'Footer';
const HEADER_BLOCK_NAME = 'Header';

export const isFooterBlock = (block: Block | null | undefined): boolean => block?.name === FOOTER_BLOCK_NAME;
export const isHeaderBlock = (block: Block | null | undefined): boolean => block?.name === HEADER_BLOCK_NAME;
export const isGlobalBlock = (block: Block | null | undefined): boolean =>
  isFooterBlock(block) || isHeaderContainerBlock(block);

const isBlockEmpty = (block: Block | null | undefined): boolean => {
  if (!block) return true;
  return !Array.isArray(block.content) || block.content.length === 0;
};

export const normalizeFooter = (block: Block): Block => {
  const defaultBlock = createFooter();
  const defaults = defaultBlock.content as Record<string, Record<string, unknown>>;
  const content = (block.content ?? {}) as Record<string, Record<string, unknown>>;
  const legacyColumns = [content.column1, content.column2, content.column3, content.column4].map((column, index) => ({
    ...((defaults[`column${index + 1}`] as Record<string, unknown>) ?? {}),
    ...(column ?? {}),
  }));
  const columns = Array.isArray(content.columns) && content.columns.length > 0 ? content.columns : legacyColumns;

  return {
    ...block,
    meta: { ...defaultBlock.meta, ...block.meta },
    content: {
      ...defaults,
      ...content,
      column1: { ...defaults.column1, ...content.column1 },
      column2: { ...defaults.column2, ...content.column2 },
      column3: { ...defaults.column3, ...content.column3 },
      column4: { ...defaults.column4, ...content.column4 },
      columns,
      layout: { ...defaults.layout, ...content.layout },
      colors: { ...defaults.colors, ...content.colors },
    },
  };
};

const getDefaultPageBlocks = (type: string, identifier: string | number): Block[] => {
  switch (type) {
    case 'immutable':
      return createHomepage();
    case 'category':
      if (typeof identifier === 'number' && identifier > 0) {
        return [];
      }
      return createCategory();
    case 'product':
      return createProduct();
    default:
      return [];
  }
};

export const assembleBlocks = (
  raw: GetBlocksResponse,
  type: string,
  identifier: string | number,
): GetBlocksResponse => {
  const HeaderContainer = isBlockEmpty(raw?.HeaderContainer)
    ? createDefaultHeaderContainerBlock()
    : raw?.HeaderContainer;

  const Footer = raw?.Footer ? normalizeFooter(raw.Footer) : normalizeFooter(createFooter());

  const pageBlocks =
    Array.isArray(raw?.blocks) && raw?.blocks.length > 0 ? raw?.blocks : getDefaultPageBlocks(type, identifier);

  migrateAllBlocks(pageBlocks);

  return { HeaderContainer, blocks: pageBlocks, Footer } as GetBlocksResponse;
};
