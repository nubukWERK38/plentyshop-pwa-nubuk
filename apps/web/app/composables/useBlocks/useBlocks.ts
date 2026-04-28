import type { ApiError, Block, GetBlocksResponse } from '@plentymarkets/shop-api';
import type { UseBlocksState, UseBlocksReturn } from './types';
import { assembleBlocks } from '~/utils/blocks/block-helpers';

declare module '#app' {
  interface NuxtApp {
    _settleTimer?: ReturnType<typeof setTimeout> | null;
  }
}

export const useBlocks: UseBlocksReturn = () => {
  const state = useState<UseBlocksState>(`useBlocks`, () => ({
    data: {} as GetBlocksResponse,
    cleanData: {} as GetBlocksResponse,
    defaultTemplateData: [] as Block[],
    loading: false,
    isSettling: false,
  }));
  const homepageHeaderContainer = useState<Block | null>('useBlocks-homepageHeaderContainer', () => null);

  const isHomepageContext = (identifier: string | number, type: string) => type === 'immutable' && String(identifier) === 'index';

  const loadHomepageHeaderContainer = async (locale: string) => {
    if (homepageHeaderContainer.value) return homepageHeaderContainer.value;

    const key = `blocks-${locale}-immutable-index-header`;
    const { data, error } = await useAsyncData(key, () =>
      useSdk().plentysystems.getBlocksWithGlobalBlocks({ identifier: 'index', type: 'immutable', enableGlobalBlocks: true }),
    );

    if (error.value) {
      console.warn('Failed to fetch homepage header blocks:', error.value.message);
      return null;
    }

    const assembledHomepage = assembleBlocks(data.value?.data || ({} as GetBlocksResponse), 'immutable', 'index');
    homepageHeaderContainer.value = assembledHomepage.HeaderContainer ? deepClone(assembledHomepage.HeaderContainer) : null;
    return homepageHeaderContainer.value;
  };

  const setBlocks = (blocks: GetBlocksResponse) => {
    const serialized = JSON.stringify(blocks);
    state.value.data = JSON.parse(serialized);
    state.value.cleanData = markRaw(JSON.parse(serialized));
  };

  /*
    After a fetch or navigation, the editor may briefly render stale state.
    This debounced sync waits for the UI to settle before snapshotting cleanData
    and resetting the editing flag, preventing flicker and dirty-state false positives.
  */
  const scheduleCleanDataSync = () => {
    state.value.isSettling = true;
    const nuxtApp = useNuxtApp();
    if (nuxtApp._settleTimer) clearTimeout(nuxtApp._settleTimer);
    nuxtApp._settleTimer = setTimeout(() => {
      state.value.cleanData = markRaw(deepClone(state.value.data));
      const { isEditingEnabled } = useEditor();
      isEditingEnabled.value = false;
      state.value.isSettling = false;
      nuxtApp._settleTimer = null;
    }, 150);
  };

  const headerContainer = computed(() => state.value.data.HeaderContainer);
  const footer = computed(() => state.value.data.Footer);
  const pageBlocks = computed(() => state.value.data.blocks ?? []);
  const allBlocks = computed(() => [
    ...(headerContainer.value ? [headerContainer.value] : []),
    ...pageBlocks.value,
    ...(footer.value ? [footer.value] : []),
  ]);

  const fetchBlocks = async (identifier: string | number, type: string) => {
    state.value.loading = true;

    const { $i18n } = useNuxtApp();
    const loc = computed(() => $i18n.locale.value);
    const key = `blocks-${loc.value}-${type}-${identifier}`;

    const { data, error } = await useAsyncData(key, () =>
      useSdk().plentysystems.getBlocksWithGlobalBlocks({ identifier, type, enableGlobalBlocks: true }),
    );

    if (error.value) {
      console.warn('Failed to fetch blocks:', error.value.message);
    }

    const assembled = assembleBlocks(data.value?.data || ({} as GetBlocksResponse), type, identifier);

    if (isHomepageContext(identifier, type)) {
      homepageHeaderContainer.value = assembled.HeaderContainer ? deepClone(assembled.HeaderContainer) : null;
    } else {
      const globalHeader = homepageHeaderContainer.value ?? (await loadHomepageHeaderContainer(loc.value));
      if (globalHeader) {
        assembled.HeaderContainer = deepClone(globalHeader);
      }
    }

    setBlocks(assembled);
    state.value.loading = false;

    const { isEditingEnabled } = useEditor();
    isEditingEnabled.value = false;

    if (import.meta.client) {
      scheduleCleanDataSync();
    }
  };

  const saveBlocks = async (identifier: string | number, type: string, content: string): Promise<boolean> => {
    try {
      state.value.loading = true;

      const response = await useSdk().plentysystems.doSaveBlocksWithGlobalBlocks({
        identifier,
        entityType: type,
        blocks: content,
        enableGlobalBlocks: true,
      });

      const assembled = assembleBlocks(
        (response?.data as unknown as GetBlocksResponse) ?? state.value.data,
        type,
        identifier,
      );

      if (isHomepageContext(identifier, type)) {
        homepageHeaderContainer.value = assembled.HeaderContainer ? deepClone(assembled.HeaderContainer) : null;
      }

      setBlocks(assembled);

      return true;
    } catch (error) {
      useHandleError(error as ApiError);
      console.error('Error saving blocks:', error);
      return false;
    } finally {
      state.value.loading = false;
    }
  };

  const setupFakeBlocks = (rawBlocks: Block[], type: string = 'immutable', identifier: string | number = 0) => {
    const assembled = assembleBlocks(
      {
        HeaderContainer: headerContainer.value,
        blocks: rawBlocks,
        Footer: footer.value,
      } as GetBlocksResponse,
      type,
      identifier,
    );
    setBlocks(assembled);
  };

  const updateBlocks = (blocks: Block[]) => {
    state.value.data.blocks = blocks;
  };

  const discardChanges = () => {
    state.value.data = deepClone(state.value.cleanData);
  };

  const setDefaultTemplate = (blocks: Block[]) => {
    state.value.defaultTemplateData = blocks;
  };

  return {
    data: computed(() => state.value.data),
    cleanData: computed(() => state.value.cleanData),
    pageBlocks,
    blocks: pageBlocks,
    allBlocks,
    headerContainer,
    footer,
    loading: computed(() => state.value.loading),
    defaultTemplateData: computed(() => state.value.defaultTemplateData),
    fetchBlocks,
    saveBlocks,
    setupFakeBlocks,
    updateBlocks,
    discardChanges,
    setDefaultTemplate,
    isSettling: computed(() => state.value.isSettling),
  };
};
