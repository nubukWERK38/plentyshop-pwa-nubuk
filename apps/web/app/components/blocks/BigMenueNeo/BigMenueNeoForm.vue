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
              </div>

              <div class="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  class="rounded border px-2 py-1 text-xs"
                  :data-testid="`big-menue-neo-toggle-top-menu-${index}`"
                  @click="toggleTopMenuCollapse(menu.id)"
                >
                  {{ isTopMenuCollapsed(menu.id) ? getEditorTranslation('expand-label') : getEditorTranslation('collapse-label') }}
                </button>
                <button
                  type="button"
                  class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                  @click="removeTopMenu(index)"
                >
                  {{ getEditorTranslation('remove-label') }}
                </button>
              </div>

              <div v-if="isTopMenuCollapsed(menu.id)" class="text-xs text-neutral-500 mb-2">
                {{ getEditorTranslation('collapsed-hint-label') }}
              </div>

              <div v-show="!isTopMenuCollapsed(menu.id)">
                <div class="space-y-3 mb-3">
                  <div>
                    <UiFormLabel class="mb-1">{{ getEditorTranslation('link-type-label') }}</UiFormLabel>
                    <select v-model="menu.category.linkType" class="input-field" :data-testid="`top-link-type-${index}`">
                      <option value="category">{{ getEditorTranslation('link-type-category-label') }}</option>
                      <option value="manualUrl">{{ getEditorTranslation('link-type-manual-url-label') }}</option>
                    </select>
                  </div>

                  <div v-if="menu.category.linkType === 'category'">
                    <UiFormLabel class="mb-1">{{ getEditorTranslation('category-label') }}</UiFormLabel>
                    <select v-model.number="menu.category.categoryId" class="input-field" :data-testid="`top-category-${index}`">
                      <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                      <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                        {{ category.label }}
                      </option>
                    </select>
                  </div>
                  <div v-else>
                    <UiFormLabel class="mb-1">{{ getEditorTranslation('manual-url-label') }}</UiFormLabel>
                    <SfInput v-model="menu.category.manualUrl" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                  </div>

                  <div>
                    <UiFormLabel class="mb-1">{{ getEditorTranslation('custom-label') }}</UiFormLabel>
                    <SfInput v-model="menu.category.customLabel" type="text" :data-testid="`top-custom-label-${index}`" />
                  </div>
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

                      <div class="space-y-2 mb-2">
                        <div>
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('link-type-label') }}</UiFormLabel>
                          <select v-model="column.category.linkType" class="input-field">
                            <option value="category">{{ getEditorTranslation('link-type-category-label') }}</option>
                            <option value="manualUrl">{{ getEditorTranslation('link-type-manual-url-label') }}</option>
                          </select>
                        </div>

                        <div v-if="column.category.linkType === 'category'">
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('category-label') }}</UiFormLabel>
                          <select v-model.number="column.category.categoryId" class="input-field">
                            <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                            <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                              {{ category.label }}
                            </option>
                          </select>
                        </div>
                        <div v-else>
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('manual-url-label') }}</UiFormLabel>
                          <SfInput v-model="column.category.manualUrl" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                        </div>

                        <div>
                          <UiFormLabel class="mb-1">{{ getEditorTranslation('custom-label') }}</UiFormLabel>
                          <SfInput v-model="column.category.customLabel" type="text" />
                        </div>
                      </div>

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

                            <div class="space-y-2">
                              <select v-model="item.category.linkType" class="input-field">
                                <option value="category">{{ getEditorTranslation('link-type-category-label') }}</option>
                                <option value="manualUrl">{{ getEditorTranslation('link-type-manual-url-label') }}</option>
                              </select>
                              <select v-if="item.category.linkType === 'category'" v-model.number="item.category.categoryId" class="input-field">
                                <option :value="null">{{ getEditorTranslation('not-selected-label') }}</option>
                                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                                  {{ category.label }}
                                </option>
                              </select>
                              <SfInput
                                v-else
                                v-model="item.category.manualUrl"
                                type="text"
                                :placeholder="getEditorTranslation('link-placeholder')"
                              />
                              <SfInput v-model="item.category.customLabel" type="text" :placeholder="getEditorTranslation('custom-label')" />
                            </div>
                          </div>
                        </template>
                      </draggable>

                      <button type="button" class="action-btn mt-2" @click="addLevel3(column)">
                        {{ getEditorTranslation('add-level3-label') }}
                      </button>
                    </div>
                  </template>
                </draggable>

                <button type="button" class="action-btn" @click="addColumn(menu)">
                  {{ getEditorTranslation('add-column-label') }}
                </button>
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
                      <div class="space-y-2">
                        <SfInput v-model="term.label" type="text" :placeholder="getEditorTranslation('label-placeholder')" />
                        <SfInput v-model="term.link" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                      </div>
                    </div>
                  </template>
                </draggable>

                <button type="button" class="action-btn" @click="addSearchTerm(menu)">
                  {{ getEditorTranslation('add-search-label') }}
                </button>
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

                      <div class="space-y-2 mt-2">
                        <SfInput v-model="brand.alt" type="text" :placeholder="getEditorTranslation('brand-alt-placeholder')" />
                        <SfInput v-model="brand.link" type="text" :placeholder="getEditorTranslation('link-placeholder')" />
                      </div>
                    </div>
                  </template>
                </draggable>

                <button type="button" class="action-btn" @click="addBrand(menu)">
                  {{ getEditorTranslation('add-brand-label') }}
                </button>
              </div>
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
          <UiFormLabel class="mb-1">{{ getEditorTranslation('top-menu-alignment-label') }}</UiFormLabel>
          <select v-model="menuContent.layout.topMenuAlignment" class="input-field" data-testid="big-menue-neo-top-menu-alignment">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
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
import type { CategoryEntry } from '@plentymarkets/shop-api';
import type {
  BigMenueNeoContent,
  BigMenueNeoCategoryLink,
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

const menusOpen = ref(true);
const layoutOpen = ref(true);
const collapsedTopMenus = ref<Record<string, boolean>>({});

const allCategoryEntries = ref<CategoryEntry[]>([]);
const categoriesLoading = ref(false);

const loadAllCategories = async () => {
  if (categoriesLoading.value || allCategoryEntries.value.length > 0) return;
  categoriesLoading.value = true;
  try {
    const sdk = useSdk();
    let page = 1;
    const collected: CategoryEntry[] = [];
    while (true) {
      const result = await sdk.plentysystems.getCategoriesSearch({ page, itemsPerPage: 200 });
      const pageData = result?.data;
      if (!pageData) break;
      collected.push(...pageData.entries);
      if (pageData.isLastPage) break;
      page++;
    }
    allCategoryEntries.value = collected;
  } catch (e) {
    console.warn('BigMenueNeo: Kategorien konnten nicht geladen werden', e);
  } finally {
    categoriesLoading.value = false;
  }
};

const createId = () => `bmn-${Math.random().toString(36).slice(2, 10)}`;

const categoryOptions = computed<FlattenedCategoryOption[]>(() => {
  if (allCategoryEntries.value.length === 0) return [];
  const byId = new Map<number, CategoryEntry>();
  for (const entry of allCategoryEntries.value) {
    byId.set(entry.id, entry);
  }
  const getPath = (entry: CategoryEntry): string => {
    const name = entry.details?.[0]?.name?.trim() || `#${entry.id}`;
    if (!entry.parentCategoryId) return name;
    const parent = byId.get(entry.parentCategoryId);
    if (!parent) return name;
    return `${getPath(parent)} > ${name}`;
  };
  return allCategoryEntries.value
    .map((entry) => ({ id: entry.id, label: getPath(entry) }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const createCategoryLink = () => ({
  linkType: 'category' as const,
  categoryId: null,
  manualUrl: '',
  customLabel: '',
});

const normalizeCategoryLink = (value: any): BigMenueNeoCategoryLink => {
  const linkType: BigMenueNeoCategoryLink['linkType'] = value?.linkType === 'manualUrl' ? 'manualUrl' : 'category';
  return {
    linkType,
    categoryId: value?.categoryId ?? null,
    manualUrl: value?.manualUrl ?? '',
    customLabel: value?.customLabel ?? '',
  };
};

const createLevel3 = () => ({
  id: createId(),
  category: createCategoryLink(),
});

const createColumn = (): BigMenueNeoLevel2Item => ({
  id: createId(),
  category: createCategoryLink(),
  items: [],
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
  category: createCategoryLink(),
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
    menu.category = normalizeCategoryLink(menu.category);
    if (!Array.isArray(menu.columns)) menu.columns = [createColumn()];
    if (!Array.isArray(menu.searchTerms)) menu.searchTerms = [];
    if (!Array.isArray(menu.brands)) menu.brands = [];

    for (const column of menu.columns) {
      if (!column.id) column.id = createId();
      column.category = normalizeCategoryLink(column.category);
      if (!Array.isArray(column.items)) column.items = [];
      for (const item of column.items) {
        if (!item.id) item.id = createId();
        item.category = normalizeCategoryLink(item.category);
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
      topMenuAlignment: 'left',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      panelBackgroundColor: '#ffffff',
      panelTitleColor: '#111827',
      panelLinkColor: '#374151',
    };
  } else {
    if (content.layout.fullWidth === undefined) content.layout.fullWidth = true;
    if (!content.layout.topMenuAlignment) content.layout.topMenuAlignment = 'left';
    if (!content.layout.backgroundColor) content.layout.backgroundColor = '#ffffff';
    if (!content.layout.textColor) content.layout.textColor = '#111827';
    if (!content.layout.panelBackgroundColor) content.layout.panelBackgroundColor = '#ffffff';
    if (!content.layout.panelTitleColor) content.layout.panelTitleColor = '#111827';
    if (!content.layout.panelLinkColor) content.layout.panelLinkColor = '#374151';
  }

  return rawContent as BigMenueNeoContent;
});

const addTopMenu = () => {
  const newMenu = createTopMenu();
  menuContent.value.menus.push(newMenu);
  collapsedTopMenus.value[newMenu.id] = true;
};
const removeTopMenu = (index: number) => {
  if (menuContent.value.menus.length <= 1) return;
  const menuId = menuContent.value.menus[index]?.id;
  if (menuId) delete collapsedTopMenus.value[menuId];
  menuContent.value.menus.splice(index, 1);
};

const isTopMenuCollapsed = (menuId: string) => Boolean(collapsedTopMenus.value[menuId]);
const toggleTopMenuCollapse = (menuId: string) => {
  collapsedTopMenus.value[menuId] = !collapsedTopMenus.value[menuId];
};

watchEffect(() => {
  for (const menu of menuContent.value.menus) {
    if (collapsedTopMenus.value[menu.id] === undefined) {
      collapsedTopMenus.value[menu.id] = true;
    }
  }
});

const addColumn = (menu: BigMenueNeoTopMenu) => menu.columns.push(createColumn());
const removeColumn = (menu: BigMenueNeoTopMenu, index: number) => {
  if (menu.columns.length <= 1) return;
  menu.columns.splice(index, 1);
};

const addLevel3 = (column: BigMenueNeoLevel2Item) => column.items.push(createLevel3());
const removeLevel3 = (column: BigMenueNeoLevel2Item, index: number) => {
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
  await loadAllCategories();
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
  width: 100%;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  background: #f0fdf4;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.action-btn:hover {
  border-color: #4ade80;
  background: #dcfce7;
  color: #14532d;
}
</style>

<i18n lang="json">
{
  "en": {
    "menus-label": "Big-Menues",
    "add-top-menu-label": "Top-Kategorie hinzufuegen",
    "top-menu-label": "Top-Kategorie",
    "category-label": "Kategorie",
    "link-type-label": "Link-Typ",
    "link-type-category-label": "Kategorie",
    "link-type-manual-url-label": "Manuelle URL",
    "manual-url-label": "Manuelle URL",
    "custom-label": "Eigene Bezeichnung",
    "add-column-label": "Submenue hinzufuegen",
    "add-level3-label": "Ebene-3-Eintrag hinzufuegen",
    "add-search-label": "Haeufigen Suchbegriff hinzufuegen",
    "add-brand-label": "Markenlogo hinzufuegen",
    "remove-label": "Entfernen",
    "expand-label": "Aufklappen",
    "collapse-label": "Zuklappen",
    "collapsed-hint-label": "Top-Kategorie ist zugeklappt",
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
    "top-menu-alignment-label": "Ausrichtung Top-Menues",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "panel-bg-label": "Panel-Hintergrundfarbe"
  },
  "de": {
    "menus-label": "Big-Menues",
    "add-top-menu-label": "Top-Kategorie hinzufuegen",
    "top-menu-label": "Top-Kategorie",
    "category-label": "Kategorie",
    "link-type-label": "Link-Typ",
    "link-type-category-label": "Kategorie",
    "link-type-manual-url-label": "Manuelle URL",
    "manual-url-label": "Manuelle URL",
    "custom-label": "Eigene Bezeichnung",
    "add-column-label": "Submenue hinzufuegen",
    "add-level3-label": "Ebene-3-Eintrag hinzufuegen",
    "add-search-label": "Haeufigen Suchbegriff hinzufuegen",
    "add-brand-label": "Markenlogo hinzufuegen",
    "remove-label": "Entfernen",
    "expand-label": "Aufklappen",
    "collapse-label": "Zuklappen",
    "collapsed-hint-label": "Top-Kategorie ist zugeklappt",
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
    "top-menu-alignment-label": "Ausrichtung Top-Menues",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "panel-bg-label": "Panel-Hintergrundfarbe"
  }
}
</i18n>
