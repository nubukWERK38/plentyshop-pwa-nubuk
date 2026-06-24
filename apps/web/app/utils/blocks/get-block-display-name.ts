const blockTypeNames: Record<string, string> = {
  Carousel: 'Carousel',
  NewsletterSubscribe: 'Newsletter',
  ProductRecommendedProducts: 'Product Gallery',
  TextCard: 'Rich Text',
  Tabs: 'Tabs',
  AnnouncementBar: 'Announcement Bar',
  CustomerReview: 'Customer reviews',
  ProductLegalInformation: 'Legal Information',
  MultiGrid: 'Layout',
  ColumnLayout: 'Columns',
  Footer: 'Footer',
  ItemText: 'Item Details',
  CategoryData: 'Category Data',
  TechnicalData: 'Technical Data',
  ItemData: 'Item Data',
  Banner: 'Image Banner',
  ImageTextBox: 'Image Text Box',
  ImageBannerNeo: 'Image Banner Neo',
  ThumbSliderNeo: 'Thumb Slider Neo',
  BigMenueNeo: 'Big-Menue Neo',
  UtilityBar: 'Utility Bar',
  HeaderContainer: 'Header Container',
  BreadcrumbsWidget: 'Breadcrumbs',
};

export const getBlockDisplayName = (blockName: string): string => {
  return blockTypeNames[blockName] ?? blockName;
};
