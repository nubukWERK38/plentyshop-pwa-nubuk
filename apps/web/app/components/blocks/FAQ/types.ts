export type FAQItem = {
  question: string;
  answerHtml: string;
};

export type FAQContent = {
  text: {
    title?: string;
  };
  items: FAQItem[];
  layout: {
    fullWidth?: boolean;
    initiallyOpenFirst?: boolean;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
};

export type FAQProps = {
  name?: string;
  type?: string;
  content: FAQContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type FAQFormProps = {
  uuid?: string;
};
