import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import ProductRecommendedProductsForm from '../ProductRecommendedProductsForm.vue';

const {
  useBlocksMock,
  useSiteConfigurationMock,
  useBlockManagerMock,
  useProductsMock,
  useCategoryTreeMock,
  useFullWidthToggleForContentMock,
  getEditorTranslationMock,
} = vi.hoisted(() => ({
  useBlocksMock: vi.fn(),
  useSiteConfigurationMock: vi.fn(),
  useBlockManagerMock: vi.fn(),
  useProductsMock: vi.fn(),
  useCategoryTreeMock: vi.fn(),
  useFullWidthToggleForContentMock: vi.fn(),
  getEditorTranslationMock: vi.fn((key: string) => key),
}));

mockNuxtImport('useBlocks', () => useBlocksMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useProducts', () => useProductsMock);
mockNuxtImport('useCategoryTree', () => useCategoryTreeMock);
mockNuxtImport('useFullWidthToggleForContent', () => useFullWidthToggleForContentMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);

describe('ProductRecommendedProductsForm', () => {
  const buildBlock = (content: Record<string, unknown>) => ({
    content,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    useBlocksMock.mockReturnValue({
      allBlocks: ref([]),
    });

    useSiteConfigurationMock.mockReturnValue({
      blockUuid: ref('recommended-block-uuid'),
    });

    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() =>
        buildBlock({
          text: {
            htmlDescription: '',
            textAlignment: 'left',
          },
          source: {
            type: 'category',
            categoryId: '12',
            itemId: '',
            crossSellingRelation: 'Similar',
          },
          layout: {
            fullWidth: false,
            gap: 16,
            marginLeft: 0,
            marginRight: 0,
            backgroundColor: 'transparent',
          },
          tabs: {
            enabled: false,
            items: [],
          },
        }),
      ),
    });

    useProductsMock.mockReturnValue({
      currentProduct: ref({}),
    });

    useCategoryTreeMock.mockReturnValue({
      data: ref([{ id: '12', type: 'item' }]),
    });

    useFullWidthToggleForContentMock.mockReturnValue({
      isFullWidth: ref(false),
    });
  });

  it('renders the editor settings for the block', () => {
    const wrapper = mount(ProductRecommendedProductsForm, {
      props: {
        uuid: 'recommended-block-uuid',
      },
      global: {
        stubs: {
          UiAccordionItem: {
            template: '<section><slot name="summary" /><slot /></section>',
          },
          EditorRichTextEditorForm: {
            template: '<div data-testid="rich-text-editor-stub" />',
          },
          EditorCategorySelect: {
            template: '<div data-testid="category-select-stub" />',
          },
          UiFormLabel: {
            template: '<label><slot /></label>',
          },
          SfInput: {
            template: '<input />',
          },
          SfSwitch: {
            template: '<input type="checkbox" />',
          },
          SfIconCheck: true,
          Multiselect: {
            template: '<div data-testid="multiselect-stub" />',
          },
          EditorFullWidthToggle: {
            template: '<div data-testid="full-width-toggle-stub" />',
          },
          EditorColorPicker: {
            template: '<div><slot name="trigger" :color="\'#ffffff\'" :toggle="() => {}" /></div>',
          },
        },
      },
    });

    expect(wrapper.find('[data-testid="rich-text-editor-stub"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('source-label');
    expect(wrapper.find('[data-testid="full-width-toggle-stub"]').exists()).toBe(true);
  });

  it('still renders settings when the block uses the product template shape', () => {
    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() =>
        buildBlock({
          source: {
            type: 'category',
            categoryId: '',
            itemId: '',
            crossSellingRelation: 'Similar',
          },
          layout: {
            fullWidth: false,
            gap: 16,
            marginLeft: 0,
            marginRight: 0,
            backgroundColor: 'transparent',
            gradient: {
              enabled: false,
              type: 'linear',
              startColor: '#ffffff',
              endColor: '#e2e8f0',
              angle: 180,
            },
          },
        }),
      ),
    });

    const wrapper = mount(ProductRecommendedProductsForm, {
      props: {
        uuid: 'recommended-block-uuid',
      },
      global: {
        stubs: {
          UiAccordionItem: {
            template: '<section><slot name="summary" /><slot /></section>',
          },
          EditorRichTextEditorForm: {
            template: '<div data-testid="rich-text-editor-stub" />',
          },
          EditorCategorySelect: {
            template: '<div data-testid="category-select-stub" />',
          },
          UiFormLabel: {
            template: '<label><slot /></label>',
          },
          SfInput: {
            template: '<input />',
          },
          SfSwitch: {
            template: '<input type="checkbox" />',
          },
          SfIconCheck: true,
          Multiselect: {
            template: '<div data-testid="multiselect-stub" />',
          },
          EditorFullWidthToggle: {
            template: '<div data-testid="full-width-toggle-stub" />',
          },
          EditorColorPicker: {
            template: '<div><slot name="trigger" :color="\'#ffffff\'" :toggle="() => {}" /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('source-label');
    expect(wrapper.find('[data-testid="full-width-toggle-stub"]').exists()).toBe(true);
  });

  it('adds a new tab when clicking add tab', async () => {
    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() =>
        buildBlock({
          text: {
            htmlDescription: '',
            textAlignment: 'left',
          },
          source: {
            type: 'category',
            categoryId: '12',
            itemId: '',
            crossSellingRelation: 'Similar',
          },
          layout: {
            fullWidth: false,
            gap: 16,
            marginLeft: 0,
            marginRight: 0,
            backgroundColor: 'transparent',
          },
          tabs: {
            enabled: true,
            items: [],
          },
        }),
      ),
    });

    const wrapper = mount(ProductRecommendedProductsForm, {
      props: {
        uuid: 'recommended-block-uuid',
      },
      global: {
        stubs: {
          UiAccordionItem: {
            template: '<section><slot name="summary" /><slot /></section>',
          },
          EditorRichTextEditorForm: {
            template: '<div data-testid="rich-text-editor-stub" />',
          },
          EditorCategorySelect: {
            template: '<div data-testid="category-select-stub" />',
          },
          UiFormLabel: {
            template: '<label><slot /></label>',
          },
          SfInput: {
            template: '<input />',
          },
          SfSwitch: {
            template: '<input type="checkbox" />',
          },
          SfIconCheck: true,
          Multiselect: {
            template: '<div data-testid="multiselect-stub" />',
          },
          EditorFullWidthToggle: {
            template: '<div data-testid="full-width-toggle-stub" />',
          },
          EditorColorPicker: {
            template: '<div><slot name="trigger" :color="\'#ffffff\'" :toggle="() => {}" /></div>',
          },
        },
      },
    });

    expect(wrapper.findAll('button').filter((button) => button.text() === 'remove-tab-label')).toHaveLength(0);

    const addTabButton = wrapper.findAll('button').find((button) => button.text() === 'add-tab-label');
    expect(addTabButton).toBeDefined();
    await addTabButton?.trigger('click');

    expect(wrapper.findAll('button').filter((button) => button.text() === 'remove-tab-label')).toHaveLength(1);
  });
});