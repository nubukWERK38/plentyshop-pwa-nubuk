import { categoryGetters, type Category } from '@plentymarkets/shop-api';
import { paths } from '~/utils/paths';

const normalizePath = (path?: string) => (path || '').replace(/\/+$/, '') || '/';

export const getCategoryBlocksIdentifier = (category?: Category | null, routePath?: string): number => {
  if (normalizePath(routePath) === normalizePath(paths.globalItemCategory)) {
    return 0;
  }

  return Number(category ? categoryGetters.getId(category) : 0) || 0;
};

export const isSpecificCategoryBlocksIdentifier = (identifier: string | number, type: string): boolean =>
  type === 'category' && typeof identifier === 'number' && identifier > 0;
