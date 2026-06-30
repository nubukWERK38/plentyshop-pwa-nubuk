export type ProductQuestionProps = {
  name?: string;
  type?: string;
  content: ProductQuestionContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ProductQuestionContent = {
  text: {
    title: string;
    intro: string;
    successText: string;
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

export type ProductQuestionFormProps = {
  uuid?: string;
};
