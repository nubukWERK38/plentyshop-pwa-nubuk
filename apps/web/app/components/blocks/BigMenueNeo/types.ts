import type { CategoryTreeItem } from '@plentymarkets/shop-api';

export type BigMenueNeoCategoryLink = {
  linkType: 'category' | 'manualUrl';
  categoryId: number | null;
  manualUrl: string;
  customLabel: string;
};

export type BigMenueNeoLevel3Item = {
  id: string;
  category: BigMenueNeoCategoryLink;
};

export type BigMenueNeoLevel2Item = {
  id: string;
  category: BigMenueNeoCategoryLink;
  items: BigMenueNeoLevel3Item[];
};

export type BigMenueNeoSearchTerm = {
  id: string;
  label: string;
  link: string;
};

export type BigMenueNeoBrand = {
  id: string;
  image: string;
  alt: string;
  link: string;
};

export type BigMenueNeoTopMenu = {
  id: string;
  category: BigMenueNeoCategoryLink;
  columns: BigMenueNeoLevel2Item[];
  searchTerms: BigMenueNeoSearchTerm[];
  brands: BigMenueNeoBrand[];
};

export type BigMenueNeoLayout = {
  fullWidth: boolean;
  topMenuAlignment: 'left' | 'center' | 'right';
  backgroundColor: string;
  textColor: string;
  panelBackgroundColor: string;
  panelTitleColor: string;
  panelLinkColor: string;
  topLinkColor: string;
  submenuLinkColor: string;
  level3LinkColor: string;
  linkHoverColor: string;
  linkHoverBorderColor: string;
  searchTagBackgroundColor: string;
  searchTagTextColor: string;
  searchTagHoverBackgroundColor: string;
  searchTagHoverTextColor: string;
};

export type BigMenueNeoContent = {
  menus: BigMenueNeoTopMenu[];
  layout: BigMenueNeoLayout;
};

export type BigMenueNeoProps = {
  name: string;
  type: string;
  content: BigMenueNeoContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type BigMenueNeoFormProps = {
  uuid?: string;
};

export type FlattenedCategoryOption = {
  id: number;
  label: string;
};

export type CategoryLookupMap = Map<number, CategoryTreeItem>;
