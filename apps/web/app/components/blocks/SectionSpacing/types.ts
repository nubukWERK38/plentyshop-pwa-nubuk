export type SectionSpacingContent = {
  height?: number;
};

export type SectionSpacingProps = {
  name?: string;
  type?: string;
  content?: SectionSpacingContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type SectionSpacingFormProps = {
  uuid?: string;
};
