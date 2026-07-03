import type { ImageProps } from '../types';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Image from '../../../../components/blocks/Image/Image.vue';

const imageBlockUuid = '45454545-4545-4455-8455-454545454545';

const mockImageBlock: ImageProps = {
  name: 'Image',
  type: 'content',
  meta: { uuid: imageBlockUuid },
  content: {
    image: {
      wideScreen: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/placeholder-image.png',
      desktop: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/placeholder-image.png',
      tablet: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/placeholder-image.png',
      mobile: 'https://cdn02.plentymarkets.com/v5vzmmmcb10k/frontend/PWA/placeholder-image.png',
      alt: 'Test alt',
      imageAlignment: 'right',
      fillMode: 'fill',
      aspectRatio: '16 / 9',
    },
    text: {
      textOverlay: '',
      textOverlayColor: '',
      textOverlayAlignY: 'center',
      textOverlayAlignX: 'center',
    },
    button: {
      label: '',
      link: '',
      variant: 'primary',
    },
    layout: {
      paddingTop: 10,
      paddingBottom: 20,
      paddingLeft: 30,
      paddingRight: 40,
      backgroundColor: '#abc123',
    },
  },
};

describe('Image block layout', () => {
  it('should apply layout padding as image insets and background color to the frame', () => {
    const wrapper = mount(Image, {
      props: mockImageBlock,
    });
    const img = wrapper.find('[data-testid="image-block-image"]');
    const imgStyle = img.attributes('style');
    const frameStyle = wrapper.find('[data-testid="image-link"]').attributes('style');

    expect(imgStyle).toContain('top: 10px');
    expect(imgStyle).toContain('right: 40px');
    expect(imgStyle).toContain('bottom: 20px');
    expect(imgStyle).toContain('left: 30px');
    expect(frameStyle).toContain('background-color: #abc123;');
  });

  it('should apply custom image width and frame alignment', () => {
    const block = {
      ...mockImageBlock,
      content: {
        ...mockImageBlock.content,
        layout: {
          ...mockImageBlock.content.layout,
          imageWidth: 320,
          imageWidthUnit: 'px' as const,
          imageHorizontalAlignment: 'right' as const,
          imageVerticalAlignment: 'bottom' as const,
        },
      },
    };

    const wrapper = mount(Image, {
      props: block,
    });
    const frameStyle = wrapper.find('[data-testid="image-link"]').attributes('style');

    expect(frameStyle).toContain('width: 320px');
    expect(frameStyle).toContain('height: 100%');
    expect(frameStyle).toContain('right: 0px');
    expect(frameStyle).toContain('bottom: 0px');
  });

  it('should keep percentage image widths visible', () => {
    const block = {
      ...mockImageBlock,
      content: {
        ...mockImageBlock.content,
        layout: {
          ...mockImageBlock.content.layout,
          imageWidth: 50,
          imageWidthUnit: '%' as const,
          imageHorizontalAlignment: 'center' as const,
          imageVerticalAlignment: 'center' as const,
        },
      },
    };

    const wrapper = mount(Image, {
      props: block,
    });
    const frameStyle = wrapper.find('[data-testid="image-link"]').attributes('style');

    expect(frameStyle).toContain('width: 50%');
    expect(frameStyle).toContain('height: 100%');
    expect(frameStyle).toContain('transform: translateX(-50%) translateY(-50%)');
  });

  it('should apply image object position from alignment settings', () => {
    const block = {
      ...mockImageBlock,
      content: {
        ...mockImageBlock.content,
        layout: {
          ...mockImageBlock.content.layout,
          imageHorizontalAlignment: 'left' as const,
          imageVerticalAlignment: 'top' as const,
        },
      },
    };

    const wrapper = mount(Image, {
      props: block,
    });
    const imgStyle = wrapper.find('[data-testid="image-block-image"]').attributes('style');

    expect(imgStyle).toContain('object-position: left top');
  });
});
