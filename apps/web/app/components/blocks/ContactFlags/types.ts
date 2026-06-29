export type ContactFlag = {
  label: string;
  link: string;
  icon: string;
  visible: boolean;
};

export type ContactFlagsContent = {
  flags: ContactFlag[];
  top: number;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
};

export type ContactFlagsProps = {
  name: string;
  type: string;
  meta: {
    uuid: string;
    isGlobalTemplate?: boolean;
  };
  configuration?: {
    visible: boolean;
  };
  content: ContactFlagsContent;
};

export type ContactFlagsFormProps = {
  uuid?: string;
};
