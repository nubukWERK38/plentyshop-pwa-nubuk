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
              <div class="mb-3">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                  <h3 class="font-semibold">{{ getEditorTranslation('top-menu-label') }} {{ index + 1 }}</h3>
                </div>
                <p class="mt-1 pl-9 text-xs text-neutral-600">
                  ({{ getTopCategoryPreviewLabel(menu.category) }})
                </p>
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

              <div v-if="!isTopMenuCollapsed(menu.id)">
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
                    <div class="submenu-card rounded border p-2">
                      <div class="mb-2">
                        <div class="flex items-center gap-2">
                          <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                          <span class="text-sm font-medium">{{ getEditorTranslation('submenu-label') }} {{ colIndex + 1 }}</span>
                        </div>
                        <p class="mt-1 pl-9 text-xs text-neutral-600">
                          ({{ getSubmenuPreviewLabel(column.category) }})
                        </p>
                      </div>

                      <div class="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          class="rounded border px-2 py-1 text-xs"
                          @click="toggleSubmenuCollapse(column.id)"
                        >
                          {{ isSubmenuCollapsed(column.id) ? getEditorTranslation('expand-label') : getEditorTranslation('collapse-label') }}
                        </button>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeColumn(menu, colIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>

                      <div v-if="!isSubmenuCollapsed(column.id)" class="space-y-2">
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

                      <div class="level3-group space-y-2 rounded border border-slate-200 bg-slate-50 p-2">
                        <p class="level3-group__title">{{ getEditorTranslation('level3-group-label') }}</p>

                        <draggable v-model="column.items" item-key="id" handle=".drag-handle" class="space-y-2">
                          <template #item="{ element: item, index: itemIndex }">
                            <div class="rounded border bg-white p-2">
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
                      </div>
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
                    <div class="submenu-card rounded border p-2">
                      <div class="mb-2">
                        <div class="flex items-center gap-2">
                          <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                          <span class="text-sm">{{ getEditorTranslation('search-term-label') }} {{ termIndex + 1 }}</span>
                        </div>
                        <p class="mt-1 pl-9 text-xs text-neutral-600">
                          ({{ getSearchTermPreviewLabel(term.label) }})
                        </p>
                      </div>

                      <div class="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          class="rounded border px-2 py-1 text-xs"
                          @click="toggleSearchTermCollapse(term.id)"
                        >
                          {{ isSearchTermCollapsed(term.id) ? getEditorTranslation('expand-label') : getEditorTranslation('collapse-label') }}
                        </button>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeSearchTerm(menu, termIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>

                      <div v-if="!isSearchTermCollapsed(term.id)" class="space-y-2">
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
                    <div class="submenu-card rounded border p-2">
                      <div class="mb-2">
                        <div class="flex items-center gap-2">
                          <button type="button" class="drag-handle cursor-grab rounded border px-2 py-1 text-xs">::</button>
                          <span class="text-sm">{{ getEditorTranslation('brand-label') }} {{ brandIndex + 1 }}</span>
                        </div>
                        <p class="mt-1 pl-9 text-xs text-neutral-600">
                          ({{ getBrandPreviewLabel(brand.alt) }})
                        </p>
                      </div>

                      <div class="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          class="rounded border px-2 py-1 text-xs"
                          @click="toggleBrandCollapse(brand.id)"
                        >
                          {{ isBrandCollapsed(brand.id) ? getEditorTranslation('expand-label') : getEditorTranslation('collapse-label') }}
                        </button>
                        <button
                          type="button"
                          class="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                          @click="removeBrand(menu, brandIndex)"
                        >
                          {{ getEditorTranslation('remove-label') }}
                        </button>
                      </div>

                      <div v-if="!isBrandCollapsed(brand.id)">
                        <UiImagePicker
                          class="big-menue-neo-form__brand-picker"
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

      <div class="space-y-4">
        <section class="layout-group">
          <h3 class="layout-group__title">{{ getEditorTranslation('layout-group-general-label') }}</h3>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <UiFormLabel>{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
              <SfSwitch v-model="menuContent.layout.fullWidth" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <UiFormLabel class="mb-1">{{ getEditorTranslation('margin-left-label') }}</UiFormLabel>
                <input
                  v-model.number="menuContent.layout.marginLeft"
                  type="number"
                  min="0"
                  class="input-field"
                  data-testid="big-menue-neo-margin-left"
                />
              </div>

              <div>
                <UiFormLabel class="mb-1">{{ getEditorTranslation('margin-right-label') }}</UiFormLabel>
                <input
                  v-model.number="menuContent.layout.marginRight"
                  type="number"
                  min="0"
                  class="input-field"
                  data-testid="big-menue-neo-margin-right"
                />
              </div>
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
        </section>

        <section class="layout-group">
          <h3 class="layout-group__title">{{ getEditorTranslation('layout-group-links-label') }}</h3>

          <div class="space-y-3">
            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('top-link-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.topLinkColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.topLinkColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('submenu-link-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.submenuLinkColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.submenuLinkColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('level3-link-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.level3LinkColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.level3LinkColor" type="text">
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

            <div class="layout-group__divider" />

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('hover-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.linkHoverColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.linkHoverColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('hover-border-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.linkHoverBorderColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.linkHoverBorderColor" type="text">
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
        </section>

        <section class="layout-group">
          <h3 class="layout-group__title">{{ getEditorTranslation('layout-group-search-label') }}</h3>

          <div class="space-y-3">
            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('search-bg-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.searchTagBackgroundColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.searchTagBackgroundColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('search-text-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.searchTagTextColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.searchTagTextColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('search-hover-bg-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.searchTagHoverBackgroundColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.searchTagHoverBackgroundColor" type="text">
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

            <div>
              <UiFormLabel class="mb-1">{{ getEditorTranslation('search-hover-text-color-label') }}</UiFormLabel>
              <EditorColorPicker v-model="menuContent.layout.searchTagHoverTextColor" class="w-full">
                <template #trigger="{ color, toggle }">
                  <SfInput v-model="menuContent.layout.searchTagHoverTextColor" type="text">
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
        </section>
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
const collapsedSubmenus = ref<Record<string, boolean>>({});
const collapsedSearchTerms = ref<Record<string, boolean>>({});
const collapsedBrands = ref<Record<string, boolean>>({});

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

const getCategoryPreviewLabel = (category: BigMenueNeoCategoryLink) => {
  if (category.customLabel?.trim()) return category.customLabel.trim();
  if (category.linkType === 'manualUrl') return category.manualUrl?.trim() || getEditorTranslation('not-selected-label');
  if (!category.categoryId) return getEditorTranslation('not-selected-label');
  const option = categoryOptions.value.find((entry) => entry.id === category.categoryId);
  if (!option) return getEditorTranslation('not-selected-label');
  const segments = option.label.split(' > ');
  return segments[segments.length - 1] || option.label;
};

const getTopCategoryPreviewLabel = (category: BigMenueNeoCategoryLink) => getCategoryPreviewLabel(category);
const getSubmenuPreviewLabel = (category: BigMenueNeoCategoryLink) => getCategoryPreviewLabel(category);
const getSearchTermPreviewLabel = (label: string) => label?.trim() || getEditorTranslation('not-selected-label');
const getBrandPreviewLabel = (alt: string) => alt?.trim() || getEditorTranslation('not-selected-label');

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
      marginLeft: 0,
      marginRight: 0,
      topMenuAlignment: 'left',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      panelBackgroundColor: '#ffffff',
      panelTitleColor: '#111827',
      panelLinkColor: '#374151',
      topLinkColor: '#111827',
      submenuLinkColor: '#111827',
      level3LinkColor: '#374151',
      linkHoverColor: '#111827',
      linkHoverBorderColor: '#111827',
      searchTagBackgroundColor: '#f3f4f6',
      searchTagTextColor: '#111827',
      searchTagHoverBackgroundColor: '#e5e7eb',
      searchTagHoverTextColor: '#111827',
    };
  } else {
    if (content.layout.fullWidth === undefined) content.layout.fullWidth = true;
    if (content.layout.marginLeft === undefined) content.layout.marginLeft = 0;
    if (content.layout.marginRight === undefined) content.layout.marginRight = 0;
    if (!content.layout.topMenuAlignment) content.layout.topMenuAlignment = 'left';
    if (!content.layout.backgroundColor) content.layout.backgroundColor = '#ffffff';
    if (!content.layout.textColor) content.layout.textColor = '#111827';
    if (!content.layout.panelBackgroundColor) content.layout.panelBackgroundColor = '#ffffff';
    if (!content.layout.panelTitleColor) content.layout.panelTitleColor = '#111827';
    if (!content.layout.panelLinkColor) content.layout.panelLinkColor = '#374151';
    if (!content.layout.topLinkColor) content.layout.topLinkColor = '#111827';
    if (!content.layout.submenuLinkColor) content.layout.submenuLinkColor = '#111827';
    if (!content.layout.level3LinkColor) content.layout.level3LinkColor = '#374151';
    if (!content.layout.linkHoverColor) content.layout.linkHoverColor = '#111827';
    if (!content.layout.linkHoverBorderColor) content.layout.linkHoverBorderColor = '#111827';
    if (!content.layout.searchTagBackgroundColor) content.layout.searchTagBackgroundColor = '#f3f4f6';
    if (!content.layout.searchTagTextColor) content.layout.searchTagTextColor = '#111827';
    if (!content.layout.searchTagHoverBackgroundColor) content.layout.searchTagHoverBackgroundColor = '#e5e7eb';
    if (!content.layout.searchTagHoverTextColor) content.layout.searchTagHoverTextColor = '#111827';
  }

  return rawContent as BigMenueNeoContent;
});

const initializeCollapsedStates = () => {
  for (const menu of menuContent.value.menus) {
    if (collapsedTopMenus.value[menu.id] === undefined) {
      collapsedTopMenus.value[menu.id] = true;
    }

    for (const column of menu.columns) {
      if (collapsedSubmenus.value[column.id] === undefined) {
        collapsedSubmenus.value[column.id] = true;
      }
    }

    for (const term of menu.searchTerms) {
      if (collapsedSearchTerms.value[term.id] === undefined) {
        collapsedSearchTerms.value[term.id] = true;
      }
    }

    for (const brand of menu.brands) {
      if (collapsedBrands.value[brand.id] === undefined) {
        collapsedBrands.value[brand.id] = true;
      }
    }
  }
};

const addTopMenu = () => {
  const newMenu = createTopMenu();
  menuContent.value.menus.push(newMenu);
  collapsedTopMenus.value[newMenu.id] = true;
  const firstColumn = newMenu.columns[0];
  const firstSearchTerm = newMenu.searchTerms[0];
  const firstBrand = newMenu.brands[0];
  if (firstColumn) collapsedSubmenus.value[firstColumn.id] = true;
  if (firstSearchTerm) collapsedSearchTerms.value[firstSearchTerm.id] = true;
  if (firstBrand) collapsedBrands.value[firstBrand.id] = true;
};
const removeTopMenu = (index: number) => {
  if (menuContent.value.menus.length <= 1) return;
  const menu = menuContent.value.menus[index];
  const menuId = menu?.id;
  if (menuId) delete collapsedTopMenus.value[menuId];
  for (const column of menu?.columns || []) {
    delete collapsedSubmenus.value[column.id];
  }
  for (const term of menu?.searchTerms || []) {
    delete collapsedSearchTerms.value[term.id];
  }
  for (const brand of menu?.brands || []) {
    delete collapsedBrands.value[brand.id];
  }
  menuContent.value.menus.splice(index, 1);
};

const isTopMenuCollapsed = (menuId: string) => Boolean(collapsedTopMenus.value[menuId]);
const toggleTopMenuCollapse = (menuId: string) => {
  collapsedTopMenus.value[menuId] = !collapsedTopMenus.value[menuId];
};

const isSubmenuCollapsed = (submenuId: string) => Boolean(collapsedSubmenus.value[submenuId]);
const toggleSubmenuCollapse = (submenuId: string) => {
  collapsedSubmenus.value[submenuId] = !collapsedSubmenus.value[submenuId];
};

const isSearchTermCollapsed = (termId: string) => Boolean(collapsedSearchTerms.value[termId]);
const toggleSearchTermCollapse = (termId: string) => {
  collapsedSearchTerms.value[termId] = !collapsedSearchTerms.value[termId];
};

const isBrandCollapsed = (brandId: string) => Boolean(collapsedBrands.value[brandId]);
const toggleBrandCollapse = (brandId: string) => {
  collapsedBrands.value[brandId] = !collapsedBrands.value[brandId];
};

const addColumn = (menu: BigMenueNeoTopMenu) => {
  const column = createColumn();
  menu.columns.push(column);
  collapsedSubmenus.value[column.id] = true;
};
const removeColumn = (menu: BigMenueNeoTopMenu, index: number) => {
  if (menu.columns.length <= 1) return;
  const column = menu.columns[index];
  if (column) delete collapsedSubmenus.value[column.id];
  menu.columns.splice(index, 1);
};

const addLevel3 = (column: BigMenueNeoLevel2Item) => column.items.push(createLevel3());
const removeLevel3 = (column: BigMenueNeoLevel2Item, index: number) => {
  column.items.splice(index, 1);
};

const addSearchTerm = (menu: BigMenueNeoTopMenu) => {
  const term = createSearchTerm();
  menu.searchTerms.push(term);
  collapsedSearchTerms.value[term.id] = true;
};
const removeSearchTerm = (menu: BigMenueNeoTopMenu, index: number) => {
  const termId = menu.searchTerms[index]?.id;
  if (termId) delete collapsedSearchTerms.value[termId];
  menu.searchTerms.splice(index, 1);
};

const addBrand = (menu: BigMenueNeoTopMenu) => {
  const brand = createBrand();
  menu.brands.push(brand);
  collapsedBrands.value[brand.id] = true;
};
const removeBrand = (menu: BigMenueNeoTopMenu, index: number) => {
  const brandId = menu.brands[index]?.id;
  if (brandId) delete collapsedBrands.value[brandId];
  menu.brands.splice(index, 1);
};

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
  initializeCollapsedStates();
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

.layout-group {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: #fafafa;
}

.layout-group__title {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.layout-group__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.2rem 0;
}

.submenu-card {
  background: #fcfcfd;
}

.level3-group__title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.big-menue-neo-form__brand-picker :deep(.flex.items-start.gap-4) {
  display: block;
}

.big-menue-neo-form__brand-picker :deep(.flex.items-start.gap-4 > div:first-child) {
  width: 100%;
  height: auto;
  min-height: 130px;
  margin-bottom: 0.75rem;
}

.big-menue-neo-form__brand-picker :deep(.flex.items-start.gap-4 > div:first-child img) {
  object-fit: contain;
  background: #fff;
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
    "level3-group-label": "Zugehoerige Ebene-3-Menues",
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
    "margin-left-label": "Margin links (px)",
    "margin-right-label": "Margin rechts (px)",
    "top-menu-alignment-label": "Ausrichtung Top-Menues",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "panel-bg-label": "Panel-Hintergrundfarbe",
    "top-link-color-label": "Top-Kategorie-Linkfarbe",
    "submenu-link-color-label": "Submenue-Linkfarbe",
    "level3-link-color-label": "Ebene-3-Linkfarbe",
    "hover-color-label": "Hover-Schriftfarbe",
    "hover-border-color-label": "Hover Border-Bottom-Farbe",
    "search-bg-color-label": "Suchbegriff Hintergrundfarbe",
    "search-text-color-label": "Suchbegriff Schriftfarbe",
    "search-hover-bg-color-label": "Suchbegriff Hover-Hintergrundfarbe",
    "search-hover-text-color-label": "Suchbegriff Hover-Schriftfarbe",
    "layout-group-general-label": "Grundlayout",
    "layout-group-links-label": "Linkfarben",
    "layout-group-hover-label": "Hover",
    "layout-group-search-label": "Suchbegriffe"
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
    "level3-group-label": "Zugehoerige Ebene-3-Menues",
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
    "margin-left-label": "Margin links (px)",
    "margin-right-label": "Margin rechts (px)",
    "top-menu-alignment-label": "Ausrichtung Top-Menues",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "panel-bg-label": "Panel-Hintergrundfarbe",
    "top-link-color-label": "Top-Kategorie-Linkfarbe",
    "submenu-link-color-label": "Submenue-Linkfarbe",
    "level3-link-color-label": "Ebene-3-Linkfarbe",
    "hover-color-label": "Hover-Schriftfarbe",
    "hover-border-color-label": "Hover Border-Bottom-Farbe",
    "search-bg-color-label": "Suchbegriff Hintergrundfarbe",
    "search-text-color-label": "Suchbegriff Schriftfarbe",
    "search-hover-bg-color-label": "Suchbegriff Hover-Hintergrundfarbe",
    "search-hover-text-color-label": "Suchbegriff Hover-Schriftfarbe",
    "layout-group-general-label": "Grundlayout",
    "layout-group-links-label": "Linkfarben",
    "layout-group-hover-label": "Hover",
    "layout-group-search-label": "Suchbegriffe"
  }
}
</i18n>
