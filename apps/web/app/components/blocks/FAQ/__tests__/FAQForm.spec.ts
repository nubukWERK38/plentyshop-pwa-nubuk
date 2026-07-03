import { defineComponent, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import FAQForm from '../FAQForm.vue';

const {
  useBlocksMock,
  useSiteConfigurationMock,
  useBlockManagerMock,
  useFullWidthToggleForContentMock,
  getEditorTranslationMock,
  decodeHtmlEntitiesMock,
} = vi.hoisted(() => ({
  useBlocksMock: vi.fn(),
  useSiteConfigurationMock: vi.fn(),
  useBlockManagerMock: vi.fn(),
  useFullWidthToggleForContentMock: vi.fn(),
  getEditorTranslationMock: vi.fn((key: string) => key),
  decodeHtmlEntitiesMock: vi.fn((value: string) => value),
}));

mockNuxtImport('useBlocks', () => useBlocksMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useFullWidthToggleForContent', () => useFullWidthToggleForContentMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);
mockNuxtImport('decodeHtmlEntities', () => decodeHtmlEntitiesMock);

describe('FAQForm.vue', () => {
  let blockContent: {
    text: { title: string };
    items: Array<{ question: string; answerHtml: string }>;
    layout: { fullWidth?: boolean; initiallyOpenFirst?: boolean };
  };

  const UiAccordionItemStub = defineComponent({
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
      text: { title: 'FAQ' },
      items: [
        { question: 'A', answerHtml: '<p>A</p>' },
        { question: 'B', answerHtml: '<p>B</p>' },
      ],
      layout: {
        fullWidth: false,
        initiallyOpenFirst: true,
      },
    };

    useBlocksMock.mockReturnValue({ allBlocks: ref([{ meta: { uuid: 'faq-uuid' }, content: blockContent }]) });
    useSiteConfigurationMock.mockReturnValue({ blockUuid: ref('faq-uuid') });
    useBlockManagerMock.mockReturnValue({
      findOrDeleteBlockByUuid: vi.fn(() => ({ content: blockContent })),
    });
    useFullWidthToggleForContentMock.mockReturnValue({ isFullWidth: ref(false) });
  });

  const mountForm = () =>
    mount(FAQForm, {
      props: { uuid: 'faq-uuid' },
      global: {
        stubs: {
          UiAccordionItem: UiAccordionItemStub,
          UiButton: UiButtonStub,
          UiFormLabel: true,
          SfInput: SfInputStub,
          SfSwitch: true,
          SfIconArrowUpward: true,
          SfIconArrowDownward: true,
          SfIconArrowBack: true,
          SfIconArrowForward: true,
          EditorRichTextEditorForm: true,
          EditorFullWidthToggle: true,
        },
      },
    });

  it('adds and removes FAQ items', async () => {
    const wrapper = mountForm();

    await wrapper.get('[data-testid="faq-add-item"]').trigger('click');
    expect(blockContent.items).toHaveLength(3);

    await wrapper.get('[data-testid="faq-remove-item-1"]').trigger('click');
    expect(blockContent.items).toHaveLength(2);
  });

  it('moves FAQ items', async () => {
    const wrapper = mountForm();

    await wrapper.get('[data-testid="faq-move-down-0"]').trigger('click');
    expect(blockContent.items[0]?.question).toBe('B');
    expect(blockContent.items[1]?.question).toBe('A');
  });
});
