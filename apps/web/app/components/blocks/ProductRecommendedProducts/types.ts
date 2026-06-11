export type CrossSellingRelationType = 'Accessory' | 'ReplacementPart' | 'Similar' | 'Bundle';

export type ProductRecommendedProductsSource = {
  type: 'category' | 'cross_selling';
  categoryId: string;
  itemId: string;
  crossSellingRelation: CrossSellingRelationType;
};

export type ProductRecommendedProductsGradient = {
  enabled?: boolean;
  type?: 'linear' | 'radial';
  startColor?: string;
  endColor?: string;
  angle?: number;
  radius?: number;
  startX?: number;
  startY?: number;
};

export type ProductRecommendedProductsTab = {
  label: string;
  source: ProductRecommendedProductsSource;
};

export type ProductRecommendedProductsProps = {
  name: string;
  type: string;
  content: ProductRecommendedProductsContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
  shouldLoad?: boolean;
};

export type ProductRecommendedProductsContent = {
  index?: number;
  cacheKey?: string;
  source: ProductRecommendedProductsSource;
  text: {
    pretitle?: string;
    title?: string;
    subtitle?: string;
    htmlDescription?: string;
    color?: string;
    textAlignment?: 'left' | 'center' | 'right';
  };
  layout?: {
    fullWidth?: boolean;
    gap?: number;
    marginLeft?: number;
    marginRight?: number;
    backgroundColor?: string;
    gradient?: ProductRecommendedProductsGradient;
    visibleItems?: number;
  };
  tabs?: {
    enabled?: boolean;
    items?: ProductRecommendedProductsTab[];
  };
};
