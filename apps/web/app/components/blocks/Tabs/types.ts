export type TabsItem = {
  title: string;
  html: string;
};

export type TabsProps = {
  name?: string;
  type?: string;
  content: TabsContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type TabsContent = {
  items: TabsItem[];
  layout: {
    fullWidth?: boolean;
    additionalClasses?: string;
    htmlId?: string;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
};

export type TabsFormProps = {
  uuid?: string;
};
