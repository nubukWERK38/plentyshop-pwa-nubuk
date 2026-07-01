export type ProductDownloadEntry = {
  title: string;
  url: string;
  fileSize?: string;
  fileType?: string;
};

export type ProductDownloadsContent = {
  text: {
    title: string;
  };
  downloads: {
    items: ProductDownloadEntry[];
  };
  layout: {
    displayAsCollapsable: boolean;
    initiallyCollapsed: boolean;
    fullWidth?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
};

export type ProductDownloadsProps = {
  name?: string;
  type?: string;
  content: ProductDownloadsContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ProductDownloadsFormProps = {
  uuid?: string;
};
