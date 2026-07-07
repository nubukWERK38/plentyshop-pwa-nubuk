import type { Block } from '@plentymarkets/shop-api';
import { getCategoryBlocksIdentifier } from '~/utils/categoryBlocks';

export const useUpdatePageTemplate = () => {
  const updatePageTemplate = async (): Promise<boolean> => {
    const { isEditingEnabled } = useEditor();
    const { send } = useNotification();
    const route = useRoute();

    const { saveBlocks, data } = useBlocks();

    const { data: dataProducts } = useProducts();

    try {
      const { HeaderContainer, blocks: pageBlocks, Footer } = data.value ?? {};
      const flat = [HeaderContainer, ...(pageBlocks ?? []), Footer].filter(
        (block): block is Block => block !== undefined && block !== null,
      );
      const cleanedData = JSON.stringify(flat);

      let identifier: string | number = route.meta.identifier as string | number;

      if (route.meta.type === 'category') {
        identifier = getCategoryBlocksIdentifier(dataProducts.value?.category, route.path);
      }

      return await saveBlocks(identifier, route.meta.type as string, cleanedData);
    } catch (error) {
      send({
        message: `Failed to update page template: ${error instanceof Error ? error.toString() : String(error)}`,
        type: 'negative',
      });
      console.error(error);
      return false;
    } finally {
      isEditingEnabled.value = false;
    }
  };

  return {
    updatePageTemplate,
  };
};
