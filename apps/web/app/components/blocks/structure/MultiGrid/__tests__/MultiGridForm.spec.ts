import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import MultiGridForm from '../MultiGridForm.vue';

const {
  useBlocksMock,
  useSiteConfigurationMock,
  useBlockManagerMock,
  useFullWidthToggleForConfigMock,
  getEditorTranslationMock,
} = vi.hoisted(() => ({
  useBlocksMock: vi.fn(),
  useSiteConfigurationMock: vi.fn(),
  useBlockManagerMock: vi.fn(),
  useFullWidthToggleForConfigMock: vi.fn(),
  getEditorTranslationMock: vi.fn((key: string) => key),
}));

mockNuxtImport('useBlocks', () => useBlocksMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useFullWidthToggleForConfig', () => useFullWidthToggleForConfigMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);

describe('MultiGridForm', () => {
  const multiGridBlock = {
    name: 'MultiGrid',
    type: 'structure',
    meta: {
      uuid: 'multi-grid-uuid',
    },
    content: [
      {
        name: 'Image',
        type: 'content',
        meta: {
          uuid: 'image-uuid',
        },
        parent_slot: 0,
        content: {},
      },
      {
        name: 'TextCard',
        type: 'content',
        meta: {
          uuid: 'text-uuid',
        },
        parent_slot: 1,
        content: {},
      },
    ],
    configuration: {
      columnWidths: [3, 3, 3, 3],
      layout: {
        gap: 'M',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useBlocksMock.mockReturnValue({
      allBlocks: ref([multiGridBlock]),
    });

    useSiteConfigurationMock.mockReturnValue({
      blockUuid: ref('multi-grid-uuid'),
    });

    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() => multiGridBlock),
    });

    useFullWidthToggleForConfigMock.mockReturnValue({
      isFullWidth: ref(false),
    });
  });

  it('adds empty placeholders for newly configured empty columns', async () => {
    mount(MultiGridForm, {
      props: {
        uuid: 'multi-grid-uuid',
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
          EditorColorPicker: {
            template: '<div><slot name="trigger" :color="modelValue" :toggle="() => {}" /></div>',
            props: ['modelValue'],
          },
          ColumnWidthInput: true,
          SfInput: true,
          SfSwitch: true,
          SfIconArrowUpward: true,
          SfIconArrowDownward: true,
          SfIconArrowBack: true,
          SfIconArrowForward: true,
        },
      },
    });

    const placeholders = multiGridBlock.content.filter((block) => block.name === 'EmptyGridBlock');

    expect(multiGridBlock.content.length).toBe(4);
    expect(placeholders.map((block) => block.parent_slot)).toEqual([2, 3]);
  });
});
