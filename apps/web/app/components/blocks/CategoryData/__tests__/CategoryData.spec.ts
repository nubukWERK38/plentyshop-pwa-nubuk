import { mount } from '@vue/test-utils';
import CategoryData from '../CategoryData.vue';
import type { CategoryDataProps } from '../types';
import { CategoryMock } from '../../../../../__tests__/__mocks__/category.mock';
import type { CategoryDetails } from '@plentymarkets/shop-api';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const { findCategoryByIdMock, getCategoriesSearchMock, useEditorStateMock, useProductsMock, useRouteMock } = vi.hoisted(
  () => ({
    findCategoryByIdMock: vi.fn(),
    getCategoriesSearchMock: vi.fn(),
    useEditorStateMock: vi.fn(),
    useProductsMock: vi.fn(),
    useRouteMock: vi.fn(),
  }),
);

mockNuxtImport('useEditorState', () => useEditorStateMock);
mockNuxtImport('useProducts', () => useProductsMock);
mockNuxtImport('useRoute', () => useRouteMock);
mockNuxtImport('useSdk', () => () => ({
  plentysystems: {
    getCategoriesSearch: getCategoriesSearchMock,
  },
}));

vi.mock('@plentymarkets/shop-api', () => {
  return {
    categoryGetters: {
      getCategoryName: (category: CategoryDetails) => category?.name ?? 'Category name',
      getCategoryDescription1: (category: CategoryDetails) => category?.description ?? '',
      getCategoryDescription2: (category: CategoryDetails) => category?.description2 ?? '',
      getCategoryShortDescription: (category: CategoryDetails) => category?.shortDescription ?? '',
      getCategoryDetails: (category: CategoryDetails & { details?: CategoryDetails[] }) =>
        category?.details?.[0] ?? category,
      getId: (category: { id?: number }) => category?.id ?? 0,
    },
    categoryTreeGetters: {
      generateBreadcrumbFromCategory: () => [],
      findCategoryById: findCategoryByIdMock,
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
    findCategoryByIdMock.mockReturnValue(null);
    getCategoriesSearchMock.mockResolvedValue({ data: { entries: [] } });
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

  it('does not use the parent category image when the current category image is empty', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          ...CategoryMock.details[0],
          parentCategoryId: 16,
          name: 'Schaltung',
          imagePath: null,
        },
        facets: [],
      })),
    });
    findCategoryByIdMock.mockReturnValue({
      id: 16,
      details: [
        {
          name: 'Teile',
          imagePath: 'category/teile-header.jpg',
        },
      ],
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          displayCategoryImage: 'image-1',
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

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('[data-testid="text-card"]').exists()).toBe(true);
  });

  it('adds header spacing when no image is available', () => {
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          ...CategoryMock.details[0],
          name: 'Schaltung',
          imagePath: null,
        },
        facets: [],
      })),
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
        content: {
          ...mockProps.content,
          displayCategoryImage: 'image-1',
        },
      },
    });

    expect(wrapper.find('[data-testid="text-card"]').classes()).toContain('category-data-empty-image-header');
  });

  it('uses parent and current category as breadcrumb fallback when the category tree has no breadcrumb', () => {
    useRouteMock.mockReturnValue({
      path: '/produkte/teile/schaltung/',
    });
    useProductsMock.mockReturnValue({
      data: computed(() => ({
        category: {
          ...CategoryMock.details[0],
          id: 17,
          parentCategoryId: 16,
          name: 'Schaltung',
        },
        facets: [],
      })),
    });
    findCategoryByIdMock.mockReturnValue({
      id: 16,
      details: [
        {
          name: 'Teile',
        },
      ],
    });

    const wrapper = mount(CategoryData, {
      props: {
        ...mockProps,
      },
      global: {
        stubs: {
          UiBreadcrumbs: {
            template:
              '<nav data-testid="breadcrumbs"><span v-for="item in breadcrumbs" :key="item.name">{{ item.name }}</span></nav>',
            props: ['breadcrumbs'],
          },
        },
      },
    });

    const breadcrumbs = wrapper.find('[data-testid="breadcrumbs"]').text();
    expect(breadcrumbs).toContain('Home');
    expect(breadcrumbs).toContain('Teile');
    expect(breadcrumbs).toContain('Schaltung');
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
