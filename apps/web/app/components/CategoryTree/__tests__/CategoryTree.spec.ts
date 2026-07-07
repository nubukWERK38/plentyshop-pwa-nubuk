import { CategoryTree } from '#components';
import { CategoryTreeMock } from '../../../../__tests__/__mocks__/category-tree.mock';
import { CategoryMock } from '../../../../__tests__/__mocks__/category.mock';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';

describe('<CategoryTree/>', () => {
  mockNuxtImport('useCategoryTree', () => {
    return () => {
      return { data: computed(() => CategoryTreeMock) };
    };
  });

  it('should render component', () => {
    const { getByTestId } = mount(CategoryTree, {
      props: {
        category: CategoryMock,
      },
    });

    expect(getByTestId('category-tree'));
  });

  it('renders the parent category tree when current category is missing from the tree', () => {
    const wrapper = mount(CategoryTree, {
      props: {
        category: {
          ...CategoryMock,
          id: 999,
          parentCategoryId: 16,
        },
      },
      global: {
        stubs: {
          CategoryTreeItem: {
            template:
              '<li data-testid="category-tree-item"><span data-testid="list-item-menu-label">{{ name }}</span></li>',
            props: ['name'],
          },
        },
      },
    });

    const categoryLabels = wrapper.findAll('[data-testid="list-item-menu-label"]').map((item) => item.text());

    expect(categoryLabels).toContain('Wohnzimmer');
    expect(categoryLabels).toContain('Sofas');
    expect(categoryLabels).toContain('Sessel & Hocker');
    expect(categoryLabels).toContain('Artikelpaket');
  });
});
