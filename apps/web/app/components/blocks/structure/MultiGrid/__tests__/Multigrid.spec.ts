import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MultiGrid from '../../../../../components/blocks/structure/MultiGrid/MultiGrid.vue';
import { multiGridBlockUuid, mockMultiGridProps } from './multiGrid.mock';

describe('MultiGrid block', () => {
  it('should render the correct number of columns (2)', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        layout: {
          marginTop: 10,
          marginBottom: 10,
          backgroundColor: '#fff',
          gap: 'M',
        },
      },
    });
    const cols = wrapper.findAll('[data-testid="multi-grid-column"]');
    expect(cols.length).toBe(2);
  });

  it('should render the correct number of columns (3)', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        name: 'MultiGrid',
        type: 'structure',
        content: [
          {
            name: 'TextCard',
            type: 'text',
            content: { text: 'Test text' },
            meta: { uuid: '33333333-3333-4333-8333-333333333333' },
            parent_slot: 0,
          },
          {
            name: 'Image',
            type: 'image',
            content: { src: '/test.jpg', alt: 'Test image' },
            meta: { uuid: '44444444-4444-4444-8444-444444444444' },
            parent_slot: 1,
          },
          {
            name: 'TextCard',
            type: 'text',
            content: { text: 'Another text' },
            meta: { uuid: '55555555-5555-4555-8555-555555555555' },
            parent_slot: 2,
          },
        ],
        configuration: {
          columnWidths: [4, 4, 4],
        },
        layout: {
          marginTop: 10,
          marginBottom: 10,
          backgroundColor: '#fff',
          gap: 'M',
        },
        meta: {
          uuid: multiGridBlockUuid,
        },
      },
    });
    const cols = wrapper.findAll('[data-testid="multi-grid-column"]');
    expect(cols.length).toBe(3);
  });

  it('should render configured columns when content is empty', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        content: [],
      },
    });
    expect(wrapper.findAll('[data-testid="multi-grid-column"]').length).toBe(2);
  });

  it('should apply the correct gap class', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        configuration: {
          ...mockMultiGridProps.configuration,
          layout: { ...mockMultiGridProps.configuration.layout, gap: 'XL' },
        },
      },
    });
    expect(wrapper.find('[data-testid="multi-grid-structure"]').attributes('style')).toContain('gap: 20px');
  });

  it('should align column content horizontally and vertically', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        configuration: {
          ...mockMultiGridProps.configuration,
          layout: {
            ...mockMultiGridProps.configuration.layout,
            horizontalAlignment: 'right',
            verticalAlignment: 'bottom',
          },
        },
      },
    });

    const gridClasses = wrapper.find('[data-testid="multi-grid-structure"]').classes();
    const columnStyle = wrapper.find('[data-testid="multi-grid-column"]').attributes('style');

    expect(gridClasses).toContain('items-stretch');
    expect(columnStyle).toContain('align-items: flex-end');
    expect(columnStyle).toContain('justify-content: flex-end');
  });

  it('should use triple base gap for a 2x2 image teaser grid', () => {
    const teaserBlocks = Array.from({ length: 4 }, (_, index) => ({
      name: 'ImageTextBox',
      type: 'content',
      content: {},
      meta: { uuid: `teaser-${index}` },
      parent_slot: index % 2,
    }));

    const wrapper = mount(MultiGrid, {
      props: {
        name: 'MultiGrid',
        type: 'structure',
        content: teaserBlocks,
        configuration: {
          columnWidths: [6, 6],
          layout: {
            backgroundColor: '#ffffff',
            gap: 'M',
          },
        },
        meta: { uuid: 'teaser-grid' },
      },
    });

    const gridStyle = wrapper.find('[data-testid="multi-grid-structure"]').attributes('style');
    const gridClasses = wrapper.find('[data-testid="multi-grid-structure"]').classes();
    const columnClasses = wrapper.find('[data-testid="multi-grid-column"]').classes();

    expect(gridClasses).toContain('md:grid-cols-2');
    expect(gridClasses).toContain('lg:grid-cols-2');
    expect(columnClasses).not.toContain('col-span-6');
    expect(gridStyle).toContain('gap: var(--ci-teaser-grid-gap)');
    expect(gridStyle).toContain('padding: var(--ci-teaser-grid-gap) 0px');
    expect(wrapper.find('[data-testid="multi-grid-column"]').attributes('style')).toContain(
      'row-gap: var(--ci-teaser-grid-gap)',
    );
  });

  it('should apply layout styles (margin, background color) to the grid container', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        configuration: {
          ...mockMultiGridProps.configuration,
          layout: {
            marginTop: 20,
            marginBottom: 10,
            backgroundColor: '#ABCDEF',
            gap: 'M',
          },
        },
      },
    });

    const grid = wrapper.find('[data-testid="multi-grid-structure"]');
    const style = grid.attributes('style');
    expect(style).toContain('background-color: #ABCDEF');
    expect(style).toContain('margin: 20px 0px 10px');
  });

  it('should apply responsive grid classes for a two-column grid', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        configuration: {
          columnWidths: [6, 6],
        },
      },
    });

    const grid = wrapper.find('[data-testid="multi-grid-structure"]');
    const classes = grid.classes();
    expect(classes).toContain('md:grid-cols-12');
    expect(classes).toContain('lg:grid-cols-12');
  });

  it('should apply responsive grid classes for a three-column grid', () => {
    const wrapper = mount(MultiGrid, {
      props: {
        ...mockMultiGridProps,
        configuration: {
          columnWidths: [4, 4, 4],
        },
      },
    });

    const grid = wrapper.find('[data-testid="multi-grid-structure"]');
    const classes = grid.classes();
    expect(classes).toContain('md:grid-cols-12');
    expect(classes).toContain('lg:grid-cols-12');
  });

  it('should render a 2 columns multigrid with 2 blocks in the first column and 1 block in the second column', () => {
    const blocks = [
      { name: 'Text', type: 'text', content: { text: 'Test' }, meta: { uuid: 'a' }, parent_slot: 0 },
      {
        name: 'Image',
        type: 'image',
        content: { src: '/test.jpg', alt: 'Test image' },
        meta: { uuid: 'b' },
        parent_slot: 0,
      },
      { name: 'Text', type: 'text', content: { text: 'Test' }, meta: { uuid: 'c' }, parent_slot: 1 },
    ];

    const wrapper = mount(MultiGrid, {
      props: {
        name: 'MultiGrid',
        type: 'structure',
        content: blocks,
        configuration: { columnWidths: [6, 6] },
        layout: { marginTop: 0, marginBottom: 0, backgroundColor: '#fff', gap: 'M' },
        meta: { uuid: 'test-multigrid' },
      },
    });

    const columns = wrapper.findAll('[data-testid="multi-grid-column"]');
    expect(columns.length).toBe(2);
    if (!columns[0] || !columns[1]) {
      throw new Error('Expected two columns to be rendered');
    }

    expect(columns[0].findAll('.group\\/row').length).toBe(2);
    expect(columns[1].findAll('.group\\/row').length).toBe(1);

    const firstColBlocks = columns[0].findAll('.group\\/row');
    if (!firstColBlocks[0] || !firstColBlocks[1]) {
      throw new Error('Expected two blocks in the first column');
    }

    expect(firstColBlocks[0].attributes('data-uuid')).toBe('a');
    expect(firstColBlocks[1].attributes('data-uuid')).toBe('b');

    const secondColBlock = columns[1].find('.group\\/row');
    expect(secondColBlock.attributes('data-uuid')).toBe('c');
  });

  it('should not render a covering row overlay for nested structure blocks', () => {
    const wrapper = mount(MultiGrid, {
      attrs: {
        enableActions: true,
      },
      props: {
        name: 'MultiGrid',
        type: 'structure',
        content: [
          {
            name: 'ColumnLayout',
            type: 'structure',
            content: [
              {
                name: 'EmptyGridBlock',
                type: 'content',
                content: [],
                meta: { uuid: 'empty-column' },
                parent_slot: 0,
              },
            ],
            configuration: {
              visible: true,
              columns: 1,
              columnWidths: [12],
            },
            meta: { uuid: 'nested-column-layout' },
            parent_slot: 0,
          },
        ],
        configuration: {
          columnWidths: [6, 6],
        },
        meta: { uuid: 'test-multigrid' },
      },
      global: {
        stubs: {
          ClientOnly: {
            template: '<slot />',
          },
          UiBlockActions: {
            template: '<div data-testid="multigrid-actions-stub" />',
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="multigrid-actions-stub"]').exists()).toBe(false);
  });
});
