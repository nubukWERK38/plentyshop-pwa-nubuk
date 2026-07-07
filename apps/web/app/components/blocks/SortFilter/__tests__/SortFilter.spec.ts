import { mount } from '@vue/test-utils';
import SortFilter from '../../../../components/blocks/SortFilter/SortFilter.vue';
import type { SortFilterProps } from '../types';
import { computed } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const { useProductsMock } = vi.hoisted(() => ({
  useProductsMock: vi.fn(),
}));

mockNuxtImport('useProducts', () => useProductsMock);

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
  }),
}));

const mockProps: SortFilterProps = {
  name: 'SortFilter',
  type: 'content',
  content: {
    fields: {
      category: true,
      sortBy: true,
      perPage: true,
      itemRating: true,
      manufacturer: true,
      price: true,
      availability: true,
      customizedFilters: true,
    },
    filtersOrder: [
      'category',
      'sortBy',
      'perPage',
      'itemRating',
      'manufacturer',
      'price',
      'availability',
      'customizedFilters',
    ],
    filtersDisabled: [],
    showAllFiltersImmediately: true,
    numberOfFiltersToShowInitially: 0,
    layout: {
      fullWidth: false,
    },
  },
  meta: {
    uuid: 'test-uuid',
  },
  index: 0,
};

describe('SortFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: null,
        facets: [],
        pagination: {
          totals: 0,
        },
      })),
    });
  });

  it('should not render CategoryFilters when not visible', () => {
    const wrapper = mount(SortFilter, {
      props: mockProps,
    });

    expect(wrapper.find('[data-testid="category-filters"]').exists()).toBe(false);
  });

  it('should not render categories from CategoryTree', () => {
    const wrapper = mount(SortFilter, {
      props: mockProps,
    });

    expect(wrapper.find('[data-testid="categories"]').exists()).toBe(false);
  });

  it('should render category sort and filter', () => {
    const wrapper = mount(SortFilter, {
      props: mockProps,
    });

    expect(wrapper.find('[data-testid="category-sort-filter"]').exists()).toBe(true);
  });

  it('renders category tree for legacy configuration without category order key', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          id: 17,
          name: 'Schaltung',
        },
        facets: [],
        pagination: {
          totals: 0,
        },
      })),
    });

    const wrapper = mount(SortFilter, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          fields: {
            sortBy: false,
            perPage: false,
            itemRating: false,
            manufacturer: false,
            price: false,
            availability: false,
            customizedFilters: false,
          } as SortFilterProps['content']['fields'],
          filtersOrder: ['manufacturer', 'price', 'availability', 'customizedFilters'],
        },
      },
      global: {
        stubs: {
          CategoryTree: {
            template: '<div data-testid="category-tree" />',
            props: ['category'],
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="category-tree"]').exists()).toBe(true);
  });

  it('does not render category tree when category field is explicitly disabled', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          id: 17,
          name: 'Schaltung',
        },
        facets: [],
        pagination: {
          totals: 0,
        },
      })),
    });

    const wrapper = mount(SortFilter, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          fields: {
            ...mockProps.content.fields,
            category: false,
          },
        },
      },
      global: {
        stubs: {
          CategoryTree: {
            template: '<div data-testid="category-tree" />',
            props: ['category'],
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="category-tree"]').exists()).toBe(false);
  });
});
