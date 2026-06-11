export type ImageTextBoxPosition = 'above' | 'below' | 'left' | 'right' | 'overlay' | 'inside';
export type ImageTextBoxAlignY = 'top' | 'center' | 'bottom';
export type ImageTextBoxAlignX = 'left' | 'center' | 'right';

export type ImageTextBoxProps = {
  name: string;
  type: string;
  content: ImageTextBoxContent;
  configuration?: object;
  index?: number;
  meta: {
    uuid: string;
  };
};

export type ImageTextBoxContent = {
  image: {
    desktop?: string;
    mobile?: string;
    alt?: string;
  };
  text: {
    html?: string;
    position?: ImageTextBoxPosition;
    alignY?: ImageTextBoxAlignY;
    alignX?: ImageTextBoxAlignX;
  };
  button: {
    label?: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
  };
};

export type ImageTextBoxFormProps = {
  uuid?: string;
};
