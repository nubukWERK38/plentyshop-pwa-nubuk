import { mount } from '@vue/test-utils';
import CategoryData from '../CategoryData.vue';
import type { CategoryDataProps } from '../types';
import { CategoryMock } from '../../../../../__tests__/__mocks__/category.mock';
import type { CategoryDetails } from '@plentymarkets/shop-api';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

const { useEditorStateMock, useRouteMock } = vi.hoisted(() => ({
  useEditorStateMock: vi.fn(),
  useRouteMock: vi.fn(),
}));

mockNuxtImport('useEditorState', () => useEditorStateMock);
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
  };
});

const mockProps: CategoryDataProps = {
  name: 'CategoryData',
  type: 'content',
  content: {
    name: 'Category name',
    showSubcategories: false,
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
    useEditorStateMock.mockReturnValue({
      isEditMode: ref(true),
      isPreviewMode: ref(false),
      isLiveMode: ref(false),
    });
    useRouteMock.mockReturnValue({
      path: '/',
    });
  });

  mockNuxtImport('useProducts', () => {
    return () => {
      return { data: computed(() => ({ category: CategoryMock.details })) };
    };
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
});
