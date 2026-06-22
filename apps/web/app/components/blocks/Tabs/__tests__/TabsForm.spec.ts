import { defineComponent, ref } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import TabsForm from '../TabsForm.vue';

const {
  useBlocksMock,
  useSiteConfigurationMock,
  useBlockManagerMock,
  useBlocksListMock,
  useFullWidthToggleForContentMock,
  useNuxtAppMock,
  getBlockFormLoaderMock,
  getEditorTranslationMock,
  decodeHtmlEntitiesMock,
} = vi.hoisted(() => ({
  useBlocksMock: vi.fn(),
  useSiteConfigurationMock: vi.fn(),
  useBlockManagerMock: vi.fn(),
  useBlocksListMock: vi.fn(),
  useFullWidthToggleForContentMock: vi.fn(),
  useNuxtAppMock: vi.fn(),
  getBlockFormLoaderMock: vi.fn(),
  getEditorTranslationMock: vi.fn((key: string) => key),
  decodeHtmlEntitiesMock: vi.fn((value: string) => value),
}));

mockNuxtImport('useBlocks', () => useBlocksMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useBlocksList', () => useBlocksListMock);
mockNuxtImport('useFullWidthToggleForContent', () => useFullWidthToggleForContentMock);
mockNuxtImport('useNuxtApp', () => useNuxtAppMock);
mockNuxtImport('getBlockFormLoader', () => getBlockFormLoaderMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);
mockNuxtImport('decodeHtmlEntities', () => decodeHtmlEntitiesMock);

describe('TabsForm.vue', () => {
  let blockContent: {
    items: Array<{
      title: string;
      html: string;
      blocks?: Array<{ name: string; type: string; meta: { uuid: string }; content: object }>;
    }>;
    layout: {
      fullWidth?: boolean;
      additionalClasses?: string;
      htmlId?: string;
    };
  };

  const UiAccordionItemStub = defineComponent({
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    template: '<div><slot name="summary" /><slot /></div>',
  });

  const UiButtonStub = defineComponent({
    emits: ['click'],
    template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
  });

  const SfInputStub = defineComponent({
    props: {
      modelValue: {
        type: String,
        default: '',
      },
    },
    emits: ['update:modelValue'],
    template:
      '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  });

  beforeEach(() => {
    vi.clearAllMocks();

    blockContent = {
      items: [
        { title: 'Item A', html: '<p>A</p>' },
        { title: 'Item B', html: '<p>B</p>' },
      ],
      layout: {
        fullWidth: false,
        additionalClasses: '',
        htmlId: '',
      },
    };

    useBlocksMock.mockReturnValue({ allBlocks: ref([{ meta: { uuid: 'tabs-uuid' }, content: blockContent }]) });
    useSiteConfigurationMock.mockReturnValue({ blockUuid: ref('tabs-uuid') });
    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() => ({ content: blockContent })),
    });
    useBlocksListMock.mockReturnValue({
      blocksLists: ref({}),
      getBlocksLists: vi.fn().mockResolvedValue(undefined),
      getBlockTemplateByLanguage: vi.fn(),
      pageHasAccessToCategory: vi.fn(() => true),
    });
    useFullWidthToggleForContentMock.mockReturnValue({ isFullWidth: ref(false) });
    useNuxtAppMock.mockReturnValue({ $i18n: { locale: ref('en') } });
    getBlockFormLoaderMock.mockReturnValue(() =>
      Promise.resolve(
        defineComponent({
          props: {
            uuid: {
              type: String,
              required: true,
            },
          },
          template: '<div data-testid="nested-block-form">{{ uuid }}</div>',
        }),
      ),
    );
  });

  const mountForm = async () => {
    const wrapper = mount(
      defineComponent({
        components: { TabsForm },
        template: '<Suspense><TabsForm uuid="tabs-uuid" /></Suspense>',
      }),
      {
        global: {
          stubs: {
            UiAccordionItem: UiAccordionItemStub,
            UiButton: UiButtonStub,
            UiFormLabel: true,
            SfInput: SfInputStub,
            EditorRichTextEditorForm: true,
            EditorFullWidthToggle: true,
          },
        },
      },
    );

    await flushPromises();
    await wrapper.vm.$nextTick();
    return wrapper;
  };

  it('should add a new tab item', async () => {
    const wrapper = await mountForm();

    await wrapper.get('[data-testid="tabs-add-item"]').trigger('click');

    expect(blockContent.items).toHaveLength(3);
    expect(blockContent.items[2]?.title).toBe('Tab item');
  });

  it('should remove a tab item', async () => {
    const wrapper = await mountForm();

    await wrapper.get('[data-testid="tabs-remove-item-1"]').trigger('click');

    expect(blockContent.items).toHaveLength(1);
    expect(blockContent.items[0]?.title).toBe('Item A');
  });

  it('should move item down and up', async () => {
    const wrapper = await mountForm();

    await wrapper.get('[data-testid="tabs-move-down-0"]').trigger('click');
    expect(blockContent.items[0]?.title).toBe('Item B');
    expect(blockContent.items[1]?.title).toBe('Item A');

    await wrapper.get('[data-testid="tabs-move-up-1"]').trigger('click');
    expect(blockContent.items[0]?.title).toBe('Item A');
    expect(blockContent.items[1]?.title).toBe('Item B');
  });

  it('should render the selected nested block form', async () => {
    blockContent.items[0]!.blocks = [
      {
        name: 'ItemText',
        type: 'content',
        meta: { uuid: 'item-text-uuid' },
        content: {},
      },
    ];

    const wrapper = await mountForm();

    await wrapper.get('[data-testid="tabs-edit-block-0-0"]').trigger('click');
    await flushPromises();

    expect(wrapper.get('[data-testid="nested-block-form"]').text()).toBe('item-text-uuid');
  });
});
