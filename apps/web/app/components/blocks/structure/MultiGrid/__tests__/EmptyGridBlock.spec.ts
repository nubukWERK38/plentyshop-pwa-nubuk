import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import EmptyGridBlock from '../EmptyGridBlock.vue';

const { useEditorStateMock, useBlockManagerMock, useSiteConfigurationMock, getEditorTranslationMock } = vi.hoisted(
  () => ({
    useEditorStateMock: vi.fn(),
    useBlockManagerMock: vi.fn(),
    useSiteConfigurationMock: vi.fn(),
    getEditorTranslationMock: vi.fn((key: string) => key),
  }),
);

mockNuxtImport('useEditorState', () => useEditorStateMock);
mockNuxtImport('useBlockManager', () => useBlockManagerMock);
mockNuxtImport('useSiteConfiguration', () => useSiteConfigurationMock);
mockNuxtImport('getEditorTranslation', () => getEditorTranslationMock);

describe('EmptyGridBlock', () => {
  it('closes block settings before opening the block list for a column', async () => {
    const multigridColumnUuid = ref<string | null>(null);
    const updateMultigridColumnUuid = vi.fn((uuid: string) => {
      multigridColumnUuid.value = uuid;
    });
    const closeBlocksConfigurationDrawer = vi.fn();
    const openDrawerWithView = vi.fn();

    useEditorStateMock.mockReturnValue({
      isEditMode: ref(true),
    });

    useBlockManagerMock.mockReturnValue({
      multigridColumnUuid,
      updateMultigridColumnUuid,
      visiblePlaceholder: ref({ uuid: '', position: 'top' }),
    });

    useSiteConfigurationMock.mockReturnValue({
      openDrawerWithView,
      closeBlocksConfigurationDrawer,
      siteConfigurationDrawerOpen: ref(false),
    });

    const wrapper = mount(EmptyGridBlock, {
      props: {
        name: 'EmptyGridBlock',
        type: 'content',
        content: [],
        meta: {
          uuid: 'empty-column-uuid',
        },
      },
      global: {
        stubs: {
          SfIconAdd: true,
        },
      },
    });

    await wrapper.get('[data-testid="inactive-empty-multicolumn"]').trigger('click');

    expect(updateMultigridColumnUuid).toHaveBeenCalledWith('empty-column-uuid');
    expect(closeBlocksConfigurationDrawer.mock.invocationCallOrder[0]).toBeLessThan(
      openDrawerWithView.mock.invocationCallOrder[0] ?? 0,
    );
    expect(openDrawerWithView).toHaveBeenCalledWith('blocksList');
  });
});
