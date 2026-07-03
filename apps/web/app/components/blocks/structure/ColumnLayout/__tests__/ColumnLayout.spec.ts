import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ColumnLayout from '../../../../../components/blocks/structure/ColumnLayout/ColumnLayout.vue';
import { mockColumnLayoutProps } from './columnLayout.mock';

describe('ColumnLayout block', () => {
  it('should render the configured number of columns', () => {
    const wrapper = mount(ColumnLayout, {
      props: {
        ...mockColumnLayoutProps,
      },
    });

    expect(wrapper.findAll('[data-testid="column-layout-column"]').length).toBe(2);
  });

  it('should render fallback columns when configuration is missing', () => {
    const wrapper = mount(ColumnLayout, {
      props: {
        ...mockColumnLayoutProps,
        configuration: undefined,
        content: [],
      },
    });

    expect(wrapper.findAll('[data-testid="column-layout-column"]').length).toBe(2);
  });

  it('should normalize column widths to 12 grid units', () => {
    const wrapper = mount(ColumnLayout, {
      props: {
        ...mockColumnLayoutProps,
        configuration: {
          ...mockColumnLayoutProps.configuration,
          columns: 3,
          columnWidths: [2, 8, 2],
        },
        content: [
          {
            name: 'TextCard',
            type: 'content',
            content: { text: { title: 'A' } },
            meta: { uuid: '31d0afad-a338-4964-9e99-8dcf2f00f76a' },
            parent_slot: 0,
          },
          {
            name: 'TextCard',
            type: 'content',
            content: { text: { title: 'B' } },
            meta: { uuid: '32df311a-e88e-4e48-87b3-7f9a67ed5948' },
            parent_slot: 1,
          },
          {
            name: 'TextCard',
            type: 'content',
            content: { text: { title: 'C' } },
            meta: { uuid: 'ba3a3726-a966-4ce2-95ef-f853fd79fcde' },
            parent_slot: 2,
          },
        ],
      },
    });

    const columns = wrapper.findAll('[data-testid="column-layout-column"]');
    expect(columns.length).toBe(3);
    expect(columns[0]?.classes()).toContain('col-span-2');
    expect(columns[1]?.classes()).toContain('col-span-8');
    expect(columns[2]?.classes()).toContain('col-span-2');
  });

  it('should render a linear gradient background when enabled', () => {
    const wrapper = mount(ColumnLayout, {
      props: {
        ...mockColumnLayoutProps,
        configuration: {
          ...mockColumnLayoutProps.configuration,
          layout: {
            ...mockColumnLayoutProps.configuration.layout,
            gradientEnabled: true,
            gradientType: 'linear',
            gradientStartColor: '#111111',
            gradientEndColor: '#eeeeee',
            gradientAngle: 90,
          },
        },
      },
    });

    expect(wrapper.get('[data-testid="column-layout-structure"]').attributes('style')).toContain(
      'background-image: linear-gradient(90deg, #111111, #eeeeee);',
    );
  });

  it('should render a radial gradient background when enabled', () => {
    const wrapper = mount(ColumnLayout, {
      props: {
        ...mockColumnLayoutProps,
        configuration: {
          ...mockColumnLayoutProps.configuration,
          layout: {
            ...mockColumnLayoutProps.configuration.layout,
            gradientEnabled: true,
            gradientType: 'radial',
            gradientStartColor: '#111111',
            gradientEndColor: '#eeeeee',
            gradientRadius: 80,
            gradientStartX: 25,
            gradientStartY: 75,
          },
        },
      },
    });

    expect(wrapper.get('[data-testid="column-layout-structure"]').attributes('style')).toContain(
      'background-image: radial-gradient(circle 80% at 25% 75%, #111111, #eeeeee);',
    );
  });
});
