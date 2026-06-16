import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import ColumnLayoutForm from '../ColumnLayoutForm.vue';

const {
  useBlocksMock,
  useSiteConfigurationMock,
  useBlockManagerMock,
  useSiteSettingsMock,
  useFullWidthToggleForConfigMock,
  getEditorTranslationMock,
} = vi.hoisted(() => ({
  useBlocksMock: vi.fn(),
  useSiteConfigurationMock: vi.fn(),
  useBlockManagerMock: vi.fn(),
  useSiteSettingsMock: vi.fn(),
  useFullWidthToggleForConfigMock: vi.fn(),
  getEditorTranslationMock: vi.fn((key: string) => key),
}));

mockNuxtImport('useBlocks', () => useBlocksMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useSiteSettings', () => useSiteSettingsMock);
mockNuxtImport('useFullWidthToggleForConfig', () => useFullWidthToggleForConfigMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);

describe('ColumnLayoutForm', () => {
  const columnLayoutBlock = {
    name: 'ColumnLayout',
    type: 'structure',
    meta: {
      uuid: 'column-layout-uuid',
    },
    content: [
      {
        name: 'EmptyGridBlock',
        type: 'content',
        meta: {
          uuid: 'left-empty-uuid',
        },
        parent_slot: 0,
        content: [],
      },
      {
        name: 'EmptyGridBlock',
        type: 'content',
        meta: {
          uuid: 'right-empty-uuid',
        },
        parent_slot: 1,
        content: [],
      },
    ],
    configuration: {
      visible: true,
      columns: 2,
      columnWidths: [6, 6],
      layout: {
        gap: 'M',
        fullWidth: false,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useBlocksMock.mockReturnValue({
      allBlocks: ref([columnLayoutBlock]),
    });

    useSiteConfigurationMock.mockReturnValue({
      blockUuid: ref('column-layout-uuid'),
    });

    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() => columnLayoutBlock),
    });

    useSiteSettingsMock.mockReturnValue({
      getSetting: vi.fn(() => 'medium'),
    });

    useFullWidthToggleForConfigMock.mockReturnValue({
      isFullWidth: ref(false),
    });
  });

  it('renders settings without rewriting stable layout arrays on each render', async () => {
    const originalContent = columnLayoutBlock.content;
    const originalWidths = columnLayoutBlock.configuration.columnWidths;

    const wrapper = mount(ColumnLayoutForm, {
      props: {
        uuid: 'column-layout-uuid',
      },
      global: {
        stubs: {
          UiAccordionItem: {
            template: '<section><slot name="summary" /><slot /></section>',
          },
          UiFormLabel: {
            template: '<label><slot /></label>',
          },
          EditorFullWidthToggle: {
            template: '<div data-testid="full-width-toggle-stub" />',
          },
          SfIconArrowUpward: true,
          SfIconArrowDownward: true,
          SfIconArrowBack: true,
          SfIconArrowForward: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('columns-count-label');
    expect(wrapper.find('[data-testid="full-width-toggle-stub"]').exists()).toBe(true);
    expect(columnLayoutBlock.content).toBe(originalContent);
    expect(columnLayoutBlock.configuration.columnWidths).toBe(originalWidths);
  });
});
