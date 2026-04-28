<template>
  <div class="big-menue-neo-form" data-testid="big-menue-neo-form">
    <UiAccordionItem
      v-model="menusOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('menus-label') }}</h2>
      </template>

      <div class="space-y-3">
        <button
          type="button"
          class="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
          data-testid="big-menue-neo-add-top-menu"
          @click="addTopMenu"
        >
          {{ getEditorTranslation('add-top-menu-label') }}
        </button>

        <draggable v-model="menuContent.menus" item-key="id" handle=".drag-handle" class="space-y-3">
          <template #item="{ element: menu, index }">
            <section class="rounded-md border p-3" :data-testid="`big-menue-neo-menu-${index}`">
              <div class="flex items-center gap-2 mb-3">
                <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                <h3 class="font-semibold">{{ getEditorTranslation('top-menu-label') }} {{ index + 1 }}</h3>
                <button
                  type="button"
                  class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                  @click="removeTopMenu(index)"
                >
                  {{ getEditorTranslation('remove-label') }}
                </button>
              </div>

              <div class="grid gap-2 md:grid-cols-2 mb-3">
                <div>
                  <UiFormLabel class="mb-1">{{ getEditorTranslation('category-label') }}</UiFormLabel>
                  <select v-model.number="menu.category.categoryId" class="input-field" :data-testid="`top-category-${index}`">
                    <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                    <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                      {{ category.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <UiFormLabel class="mb-1">{{ getEditorTranslation('custom-label') }}</UiFormLabel>
                  <SfInput v-model="menu.category.customLabel" type="text" :data-testid="`top-custom-label-${index}`" />
                </div>
              </div>

              <div class="grid gap-2 md:grid-cols-3 mb-3">
                <button type="button" class="action-btn" @click="addColumn(menu)">
                  {{ getEditorTranslation('add-column-label') }}
                </button>
                <button type="button" class="action-btn" @click="addSearchTerm(menu)">
                  {{ getEditorTranslation('add-search-label') }}
                </button>
                <button type="button" class="action-btn" @click="addBrand(menu)">
                  {{ getEditorTranslation('add-brand-label') }}
                </button>
              </div>

              <div class="space-y-2 mb-3">
                <h4 class="font-medium">{{ getEditorTranslation('submenus-label') }}</h4>
                <draggable v-model="menu.columns" item-key="id" handle=".drag-handle" class="space-y-2">
                  <template #item="{ element: column, index: colIndex }">
                    <div class="rounded border p-2">
                      <div class="flex items-center gap-2 mb-2">
                        <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                        <span class="text-sm font-medium">{{ getEditorTranslation('submenu-label') }} {{ colIndex + 1 }}</span>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeColumn(menu, colIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>

                      <div class="grid gap-2 md:grid-cols-2 mb-2">
                        <div>
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('category-label') }}</UiFormLabel>
                          <select v-model.number="column.category.categoryId" class="input-field">
                            <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                            <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                              {{ category.label }}
                            </option>
                          </select>
                        </div>

                        <div>
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('custom-label') }}</UiFormLabel>
                          <SfInput v-model="column.category.customLabel" type="text" />
                        </div>
                      </div>

                      <button type="button" class="action-btn mb-2" @click="addLevel3(column)">
                        {{ getEditorTranslation('add-level3-label') }}
                      </button>

                      <draggable v-model="column.items" item-key="id" handle=".drag-handle" class="space-y-2">
                        <template #item="{ element: item, index: itemIndex }">
                          <div class="rounded border p-2">
                            <div class="flex items-center gap-2 mb-2">
                              <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                              <span class="text-sm">{{ getEditorTranslation('level3-label') }} {{ itemIndex + 1 }}</span>
                              <button
                                type="button"
                                class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                                @click="removeLevel3(column, itemIndex)"
                              >
                                {{ getEditorTranslation('remove-label') }}
                              </button>
                            </div>

                            <div class="grid gap-2 md:grid-cols-2">
                              <select v-model.number="item.category.categoryId" class="input-field">
                                <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                                  {{ category.label }}
                                </option>
                              </select>
                              <SfInput v-model="item.category.customLabel" type="text" :placeholder="getEditorTranslation('custom-label')" />
                            </div>
                          </div>
                        </template>
                      </draggable>
                    </div>
                  </template>
                </draggable>
              </div>

              <div class="space-y-2 mb-3">
                <h4 class="font-medium">{{ getEditorTranslation('search-terms-label') }}</h4>
                <draggable v-model="menu.searchTerms" item-key="id" handle=".drag-handle" class="space-y-2">
                  <template #item="{ element: term, index: termIndex }">
                    <div class="rounded border p-2">
                      <div class="flex items-center gap-2 mb-2">
                        <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                        <span class="text-sm">{{ getEditorTranslation('search-term-label') }} {{ termIndex + 1 }}</span>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeSearchTerm(menu, termIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>
                      <div class="grid gap-2 md:grid-cols-2">
                        <SfInput v-model="term.label" type="text" :placeholder="getEditorTranslation('label-placeholder')" />
                        <SfInput v-model="term.link" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>

              <div class="space-y-2">
                <h4 class="font-medium">{{ getEditorTranslation('brands-label') }}</h4>
                <draggable v-model="menu.brands" item-key="id" handle=".drag-handle" class="space-y-2">
                  <template #item="{ element: brand, index: brandIndex }">
                    <div class="rounded border p-2">
                      <div class="flex items-center gap-2 mb-2">
                        <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                        <span class="text-sm">{{ getEditorTranslation('brand-label') }} {{ brandIndex + 1 }}</span>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeBrand(menu, brandIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>

                      <UiImagePicker
                        :label="getEditorTranslation('brand-logo-label')"
                        :image="brand.image"
                        :placeholder="placeholderImg"
                        dimensions="220 x 80"
                        selected-image-type="desktop"
                        @add="(payload) => handleBrandLogoAdd(payload, menu.id, brand.id)"
                        @delete="deleteBrandLogo(menu.id, brand.id)"
                      />

                      <div class="grid gap-2 md:grid-cols-2 mt-2">
                        <SfInput v-model="brand.alt" type="text" :placeholder="getEditorTranslation('brand-alt-placeholder')" />
                        <SfInput v-model="brand.link" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </section>
          </template>
        </draggable>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="layoutOpen"
      summary-active-class="bg-neutral-100"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('layout-label') }}</h2>
      </template>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
          <SfSwitch v-model="menuContent.layout.fullWidth" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('panel-bg-label') }}</UiFormLabel>
          <EditorColorPicker v-model="menuContent.layout.panelBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="menuContent.layout.panelBackgroundColor" type="text">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import draggable from 'vuedraggable/src/vuedraggable';
import type {
  BigMenueNeoContent,
  BigMenueNeoFormProps,
  BigMenueNeoTopMenu,
  BigMenueNeoLevel2Item,
  BigMenueNeoBrand,
  FlattenedCategoryOption,
} from './types';

const props = defineProps<BigMenueNeoFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { placeholderImg } = usePickerHelper();
const { data: categoryTree, getCategoryTree } = useCategoryTree();

const menusOpen = ref(true);
const layoutOpen = ref(true);

const createId = () => `bmn-${Math.random().toString(36).slice(2, 10)}`;

const categoryOptions = computed<FlattenedCategoryOption[]>(() => {
  const result: FlattenedCategoryOption[] = [];
  const walk = (nodes: any[], prefix = '') => {
    for (const node of nodes || []) {
      const label = prefix ? `${prefix} > ${node.name}` : node.name;
      result.push({ id: node.id, label });
      if (node.children?.length) {
        walk(node.children, label);
      }
    }
  };

  const normalized = (categoryTree.value || []).map((node: any) => ({
    id: node.id,
    name: node.details?.[0]?.name || `#${node.id}`,
    children: node.children || [],
  }));

  walk(normalized);
  return result;
});

const createLevel3 = () => ({
  id: createId(),
  category: {
    categoryId: null,
    customLabel: '',
  },
});

const createColumn = (): BigMenueNeoLevel2Item => ({
  id: createId(),
  category: {
    categoryId: null,
    customLabel: '',
  },
  items: [createLevel3()],
});

const createSearchTerm = () => ({
  id: createId(),
  label: '',
  link: '/',
});

const createBrand = (): BigMenueNeoBrand => ({
  id: createId(),
  image: '',
  alt: '',
  link: '/',
});

const createTopMenu = (): BigMenueNeoTopMenu => ({
  id: createId(),
  category: {
    categoryId: null,
    customLabel: '',
  },
  columns: [createColumn()],
  searchTerms: [createSearchTerm()],
  brands: [createBrand()],
});

const menuContent = computed<BigMenueNeoContent>(() => {
  const rawContent = findOrDeleteBlockByUuid(data.value, props.uuid || blockUuid.value)?.content ?? {};
  const content = rawContent as Partial<BigMenueNeoContent>;

  if (!Array.isArray(content.menus) || content.menus.length === 0) {
    content.menus = [createTopMenu()];
  }

  for (const menu of content.menus) {
    if (!menu.id) menu.id = createId();
    if (!menu.category) menu.category = { categoryId: null, customLabel: '' };
    if (!Array.isArray(menu.columns)) menu.columns = [createColumn()];
    if (!Array.isArray(menu.searchTerms)) menu.searchTerms = [];
    if (!Array.isArray(menu.brands)) menu.brands = [];

    for (const column of menu.columns) {
      if (!column.id) column.id = createId();
      if (!column.category) column.category = { categoryId: null, customLabel: '' };
      if (!Array.isArray(column.items)) column.items = [createLevel3()];
      for (const item of column.items) {
        if (!item.id) item.id = createId();
        if (!item.category) item.category = { categoryId: null, customLabel: '' };
      }
    }

    for (const term of menu.searchTerms) {
      if (!term.id) term.id = createId();
      if (term.label === undefined) term.label = '';
      if (term.link === undefined) term.link = '/';
    }

    for (const brand of menu.brands) {
      if (!brand.id) brand.id = createId();
      if (brand.image === undefined) brand.image = '';
      if (brand.alt === undefined) brand.alt = '';
      if (brand.link === undefined) brand.link = '/';
    }
  }

  if (!content.layout) {
    content.layout = {
      fullWidth: true,
      backgroundColor: '#ffffff',
      textColor: '#111827',
      panelBackgroundColor: '#ffffff',
      panelTitleColor: '#111827',
      panelLinkColor: '#374151',
    };
  } else {
    if (content.layout.fullWidth === undefined) content.layout.fullWidth = true;
    if (!content.layout.backgroundColor) content.layout.backgroundColor = '#ffffff';
    if (!content.layout.textColor) content.layout.textColor = '#111827';
    if (!content.layout.panelBackgroundColor) content.layout.panelBackgroundColor = '#ffffff';
    if (!content.layout.panelTitleColor) content.layout.panelTitleColor = '#111827';
    if (!content.layout.panelLinkColor) content.layout.panelLinkColor = '#374151';
  }

  return rawContent as BigMenueNeoContent;
});

const addTopMenu = () => menuContent.value.menus.push(createTopMenu());
const removeTopMenu = (index: number) => {
  if (menuContent.value.menus.length <= 1) return;
  menuContent.value.menus.splice(index, 1);
};

const addColumn = (menu: BigMenueNeoTopMenu) => menu.columns.push(createColumn());
const removeColumn = (menu: BigMenueNeoTopMenu, index: number) => {
  if (menu.columns.length <= 1) return;
  menu.columns.splice(index, 1);
};

const addLevel3 = (column: BigMenueNeoLevel2Item) => column.items.push(createLevel3());
const removeLevel3 = (column: BigMenueNeoLevel2Item, index: number) => {
  if (column.items.length <= 1) return;
  column.items.splice(index, 1);
};

const addSearchTerm = (menu: BigMenueNeoTopMenu) => menu.searchTerms.push(createSearchTerm());
const removeSearchTerm = (menu: BigMenueNeoTopMenu, index: number) => menu.searchTerms.splice(index, 1);

const addBrand = (menu: BigMenueNeoTopMenu) => menu.brands.push(createBrand());
const removeBrand = (menu: BigMenueNeoTopMenu, index: number) => menu.brands.splice(index, 1);

const handleBrandLogoAdd = (
  { image }: { image: string; name: string; type: string },
  menuId: string,
  brandId: string,
) => {
  const menu = menuContent.value.menus.find((m) => m.id === menuId);
  const brand = menu?.brands.find((b) => b.id === brandId);
  if (!brand) return;
  brand.image = image;
};

const deleteBrandLogo = (menuId: string, brandId: string) => {
  const menu = menuContent.value.menus.find((m) => m.id === menuId);
  const brand = menu?.brands.find((b) => b.id === brandId);
  if (!brand) return;
  brand.image = '';
};

onMounted(async () => {
  if (categoryTree.value.length === 0) {
    await getCategoryTree();
  }
});
</script>

<style scoped>
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
}

.action-btn {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #fff;
}
</style>

<i18n lang="json">
{
  "en": {
    "menus-label": "Big menus",
    "add-top-menu-label": "Add top category",
    "top-menu-label": "Top category",
    "category-label": "Category",
    "custom-label": "Custom label",
    "add-column-label": "Add submenu",
    "add-level3-label": "Add level 3 item",
    "add-search-label": "Add frequent search",
    "add-brand-label": "Add brand logo",
    "remove-label": "Remove",
    "submenus-label": "Submenus",
    "submenu-label": "Submenu",
    "level3-label": "Level 3",
    "search-terms-label": "Frequent searches",
    "search-term-label": "Search term",
    "brands-label": "Brands",
    "brand-label": "Brand",
    "brand-logo-label": "Brand logo",
    "brand-alt-placeholder": "Brand name",
    "label-placeholder": "Label",
    "link-placeholder": "Link",
    "not-selected-label": "Not selected",
    "layout-label": "Layout",
    "full-width-label": "Full width",
    "panel-bg-label": "Panel background color"
  },
  "de": {
    "menus-label": "Big-Menues",
    "add-top-menu-label": "Top-Kategorie hinzufuegen",
    "top-menu-label": "Top-Kategorie",
    "category-label": "Kategorie",
    "custom-label": "Eigene Bezeichnung",
    "add-column-label": "Submenue hinzufuegen",
    "add-level3-label": "Ebene-3-Eintrag hinzufuegen",
    "add-search-label": "Haeufigen Suchbegriff hinzufuegen",
    "add-brand-label": "Markenlogo hinzufuegen",
    "remove-label": "Entfernen",
    "submenus-label": "Submenues",
    "submenu-label": "Submenue",
    "level3-label": "Ebene 3",
    "search-terms-label": "Haeufige Suchbegriffe",
    "search-term-label": "Suchbegriff",
    "brands-label": "Marken",
    "brand-label": "Marke",
    "brand-logo-label": "Markenlogo",
    "brand-alt-placeholder": "Markenname",
    "label-placeholder": "Bezeichnung",
    "link-placeholder": "Link",
    "not-selected-label": "Nicht ausgewaehlt",
    "layout-label": "Layout",
    "full-width-label": "Volle Breite",
    "panel-bg-label": "Panel-Hintergrundfarbe"
  }
}
</i18n>
