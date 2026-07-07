import { mount } from '@vue/test-utils';
import CategoryData from '../CategoryData.vue';
import type { CategoryDataProps } from '../types';
import { CategoryMock } from '../../../../../__tests__/__mocks__/category.mock';
import type { CategoryDetails } from '@plentymarkets/shop-api';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const { useEditorStateMock, useProductsMock, useRouteMock } = vi.hoisted(() => ({
  useEditorStateMock: vi.fn(),
  useProductsMock: vi.fn(),
  useRouteMock: vi.fn(),
}));

mockNuxtImport('useEditorState', () => useEditorStateMock);
mockNuxtImport('useProducts', () => useProductsMock);
mockNuxtImport('useRoute', () => useRouteMock);

vi.mock('@plentymarkets/shop-api', () => {
  return {
    categoryGetters: {
      getCategoryName: (category: CategoryDetails) => category?.name ?? 'Category name',
      getCategoryDescription1: (category: CategoryDetails) => category?.description ?? '',
      getCategoryDescription2: (category: CategoryDetails) => category?.description2 ?? '',
      getCategoryShortDescription: (category: CategoryDetails) => category?.shortDescription ?? '',
      getCategoryDetails: (category: CategoryDetails) => category,
      getId: (category: { id?: number }) => category?.id ?? 0,
    },
    categoryTreeGetters: {
      generateBreadcrumbFromCategory: () => [],
      findCategoryById: () => null,
    },
    facetGetters: {
      getType: (facet: { type?: string }) => facet?.type ?? '',
      getFilters: (facet: { values?: unknown[] }) => facet?.values ?? [],
    },
  };
});

const mockProps: CategoryDataProps = {
  name: 'CategoryData',
  type: 'content',
  content: {
    name: 'Category name',
    showSubcategories: true,
    fields: {
      name: true,
      description1: false,
      description2: false,
      shortDescription: false,
    },
    fieldsOrder: ['name', 'description1', 'description2', 'shortDescription'],
    fieldsDisabled: [],
    layout: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      narrowContainer: false,
    },
    displayCategoryImage: 'off',
    text: {
      bgColor: '#fff',
      bgOpacity: 1,
      background: true,
    },
    image: {},
    subcategoryMode: 'default',
    subcategories: [],
    showBrands: true,
    brandMode: 'default',
    brands: [],
  },
  category: CategoryMock,
  meta: {
    uuid: 'test-uuid',
  },
  index: 0,
};

describe('CategoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: CategoryMock.details[0],
        facets: [],
      })),
    });
    useEditorStateMock.mockReturnValue({
      isEditMode: ref(true),
      isPreviewMode: ref(false),
      isLiveMode: ref(false),
    });
    useRouteMock.mockReturnValue({
      path: '/',
    });
  });

  it('should render category name', () => {
    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        shouldLoad: false,
      },
    });

    expect(wrapper.find('[data-testid="category-data"]').exists()).toBe(true);
  });

  it('should hide subcategories in image header on brand world page', () => {
    useRouteMock.mockReturnValue({
      path: '/markenwelt/',
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          displayCategoryImage: 'image-1',
          showSubcategories: true,
          image: {
            alt: '',
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="category-subcategories"]').exists()).toBe(false);
  });

  it('uses the category name as image alt text when no manual alt text is set', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          ...CategoryMock.details[0],
          name: 'E-Bikes',
          imagePath: 'category/e-bikes.jpg',
        },
      })),
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          displayCategoryImage: 'image-1',
          image: {
            alt: '',
          },
        },
      },
      global: {
        stubs: {
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt'],
          },
        },
      },
    });

    expect(wrapper.find('img').attributes('alt')).toBe('E-Bikes');
  });

  it('uses manual image alt text when set', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          ...CategoryMock.details[0],
          name: 'E-Bikes',
          imagePath: 'category/e-bikes.jpg',
        },
      })),
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          displayCategoryImage: 'image-1',
          image: {
            alt: 'Trail rider on e-bike',
          },
        },
      },
      global: {
        stubs: {
          NuxtImg: {
            template: '<img :src="src" :alt="alt" />',
            props: ['src', 'alt'],
          },
        },
      },
    });

    expect(wrapper.find('img').attributes('alt')).toBe('Trail rider on e-bike');
  });

  it('renders brand links from producer facet by default', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: CategoryMock.details[0],
        facets: [
          {
            type: 'producer',
            values: [
              { id: 11, name: 'Specialized' },
              { id: 12, name: 'Merida' },
            ],
          },
        ],
      })),
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    const brands = wrapper.findAll('[data-testid="category-brand-item"]');
    expect(brands).toHaveLength(2);
    expect(brands[0]!.text()).toBe('Specialized');
    expect(brands[0]!.find('a').attributes('href')).toBe('/?facets=11');
  });

  it('renders manual subcategory and brand links when configured', () => {
    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          showSubcategories: true,
          subcategoryMode: 'manual',
          subcategories: [{ name: 'E-Mountainbikes', link: '/produkte/e-bikes/e-mountainbikes/' }],
          brandMode: 'manual',
          brands: [{ name: 'Haibike', link: '/marken/haibike/' }],
        },
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="category-subcategory-item"]').text()).toBe('E-Mountainbikes');
    expect(wrapper.find('[data-testid="category-subcategory-item"] a').attributes('href')).toBe(
      '/produkte/e-bikes/e-mountainbikes/',
    );
    expect(wrapper.find('[data-testid="category-brand-item"]').text()).toBe('Haibike');
    expect(wrapper.find('[data-testid="category-brand-item"] a').attributes('href')).toBe('/marken/haibike/');
  });
});
