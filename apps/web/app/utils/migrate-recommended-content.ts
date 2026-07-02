import type { ProductRecommendedProductsContent } from '~/components/blocks/ProductRecommendedProducts/types';

export type OldContent = {
  index?: number;
  cacheKey?: string;
  categoryId: string;
  text: object;
};

function isNewContent(
  content: OldContent | ProductRecommendedProductsContent,
): content is ProductRecommendedProductsContent {
  const c = content as ProductRecommendedProductsContent;
  return typeof c?.source?.type === 'string';
}

export function migrateRecommendedContent(
  content: OldContent | ProductRecommendedProductsContent,
): ProductRecommendedProductsContent {
  if (isNewContent(content)) {
    const migratedContent = content as ProductRecommendedProductsContent;

    migratedContent.source = {
      ...migratedContent.source,
      itemIds: migratedContent.source.itemIds ?? migratedContent.source.itemId ?? '',
    };
    migratedContent.tabs?.items?.forEach((tab) => {
      tab.source = {
        ...tab.source,
        itemIds: tab.source.itemIds ?? tab.source.itemId ?? '',
      };
    });

    return migratedContent;
  }

  const old = content as OldContent;

  return {
    index: old.index,
    cacheKey: old.cacheKey,
    source: {
      type: 'category',
      categoryId: String(old.categoryId),
      itemId: '',
      itemIds: '',
      variationIds: '',
      crossSellingRelation: 'Similar',
    },
    text: (old.text || {}) as ProductRecommendedProductsContent['text'],
  };
}
