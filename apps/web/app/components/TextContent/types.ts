export type TextContentProps = {
  index?: number;
  testId?: string;
  text?: {
    pretitle?: string;
    title?: string;
    subtitle?: string;
    htmlDescription?: string;
    color?: string;
    textAlignment?: 'left' | 'center' | 'right';
  };
  button?: {
    label?: string;
    link?: string;
    variant?: 'primary' | 'secondary';
    textColor?: string;
    backgroundColor?: string;
    hoverTextColor?: string;
    hoverBackgroundColor?: string;
    backgroundGradient?: {
      enabled?: boolean;
      type?: 'linear' | 'radial';
      startColor?: string;
      endColor?: string;
      angle?: number;
      radius?: number;
      startX?: number;
      startY?: number;
    };
  };
};
