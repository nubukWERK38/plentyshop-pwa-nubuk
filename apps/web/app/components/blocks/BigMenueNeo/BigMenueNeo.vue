<template>
  <div class="big-menue-neo" :style="rootStyle" data-testid="big-menue-neo">
    <div
      class="big-menue-neo__container"
      :class="{ 'big-menue-neo__container--boxed': !normalizedContent.layout.fullWidth }"
      @mouseleave="closeMenu"
    >
      <nav class="big-menue-neo__top" :class="`big-menue-neo__top--${normalizedContent.layout.topMenuAlignment}`" aria-label="Big Menue Neo">
        <NuxtLink
          v-for="(menu, index) in normalizedContent.menus"
          :key="menu.id"
          :to="resolveCategoryTo(menu.category)"
          class="big-menue-neo__top-item"
          :class="{ 'big-menue-neo__top-item--active': isPanelOpen && index === activeMenuIndex }"
          @mouseenter="openMenu(index)"
          @focus="openMenu(index)"
        >
          <span class="big-menue-neo__top-label">{{ getCategoryLabel(menu.category) }}</span>
          <span v-if="menuHasPanelContent(menu)" class="big-menue-neo__top-caret" aria-hidden="true">▾</span>
        </NuxtLink>
      </nav>

      <section v-if="isPanelOpen && activeMenu" class="big-menue-neo__panel" data-testid="big-menue-neo-panel">
        <div class="big-menue-neo__panel-main">
          <div class="big-menue-neo__columns">
            <article v-for="column in activeColumns" :key="column.id" class="big-menue-neo__column">
              <NuxtLink :to="resolveCategoryTo(column.category)" class="big-menue-neo__column-title">
                {{ getCategoryLabel(column.category) }}
              </NuxtLink>

              <ul class="big-menue-neo__level-3">
                <li v-for="item in column.items" :key="item.id">
                  <NuxtLink :to="resolveCategoryTo(item.category)" class="big-menue-neo__link">
                    {{ getCategoryLabel(item.category) }}
                  </NuxtLink>
                </li>
              </ul>
            </article>
          </div>

          <aside v-if="activeSearchTerms.length > 0" class="big-menue-neo__right-rail">
            <div class="big-menue-neo__box">
            <h3 class="big-menue-neo__box-title">{{ t('bigMenuNeo.frequentSearches') }}</h3>
            <ul class="big-menue-neo__search-list">
              <li v-for="term in activeSearchTerms" :key="term.id">
                <NuxtLink class="big-menue-neo__search-link" :to="term.link || '/'">{{ term.label }}</NuxtLink>
              </li>
            </ul>
            </div>
          </aside>
        </div>

        <div v-if="activeBrands.length > 0" class="big-menue-neo__brands-wrap">
            <ul class="big-menue-neo__brand-list">
              <li v-for="brand in activeBrands" :key="brand.id">
                <NuxtLink :to="brand.link || '/'" class="big-menue-neo__brand-link">
                  <NuxtImg
                    v-if="brand.image"
                    :src="brand.image"
                    :alt="brand.alt || 'Brand logo'"
                    class="big-menue-neo__brand-image"
                  />
                  <span v-else class="big-menue-neo__brand-placeholder">{{ brand.alt || 'Brand' }}</span>
                </NuxtLink>
              </li>
            </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryEntry, CategoryTreeItem } from '@plentymarkets/shop-api';
import type { BigMenueNeoContent, BigMenueNeoProps, BigMenueNeoCategoryLink } from './types';

const props = defineProps<BigMenueNeoProps>();

const { data: categoryTree, getCategoryTree } = useCategoryTree();
const { buildCategoryMenuLink } = useLocalization();
const localePath = useLocalePath();
const { t } = useI18n();

const activeMenuIndex = ref<number | null>(null);
const isPanelOpen = ref(false);
const allCategoryEntries = ref<CategoryEntry[]>([]);
const categoriesLoading = ref(false);

const defaultContent = (): BigMenueNeoContent => ({
  menus: [
    {
      id: 'menu-1',
      category: { linkType: 'category', categoryId: null, manualUrl: '', customLabel: 'Top-Kategorie' },
      columns: [
        {
          id: 'col-1',
          category: { linkType: 'category', categoryId: null, manualUrl: '', customLabel: 'Submenue' },
          items: [
            { id: 'item-1', category: { linkType: 'category', categoryId: null, manualUrl: '', customLabel: 'Ebene 3' } },
          ],
        },
      ],
      searchTerms: [],
      brands: [],
    },
  ],
  layout: {
    fullWidth: true,
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
  },
});

const normalizedContent = computed<BigMenueNeoContent>(() => {
  const input = props.content || defaultContent();

  const normalizeCategory = (category?: Partial<BigMenueNeoCategoryLink>): BigMenueNeoCategoryLink => ({
    linkType: category?.linkType === 'manualUrl' ? 'manualUrl' : 'category',
    categoryId: category?.categoryId ?? null,
    manualUrl: category?.manualUrl || '',
    customLabel: category?.customLabel || '',
  });

  const menusSource = Array.isArray(input.menus) && input.menus.length > 0 ? input.menus : defaultContent().menus;

  return {
    menus: menusSource.map((menu) => ({
      ...menu,
      category: normalizeCategory(menu.category),
      columns: (menu.columns || []).map((column) => ({
        ...column,
        category: normalizeCategory(column.category),
        items: (column.items || []).map((item) => ({
          ...item,
          category: normalizeCategory(item.category),
        })),
      })),
      searchTerms: menu.searchTerms || [],
      brands: menu.brands || [],
    })),
    layout: {
      fullWidth: input.layout?.fullWidth !== false,
      topMenuAlignment: input.layout?.topMenuAlignment || 'left',
      backgroundColor: input.layout?.backgroundColor || '#ffffff',
      textColor: input.layout?.textColor || '#111827',
      panelBackgroundColor: input.layout?.panelBackgroundColor || '#ffffff',
      panelTitleColor: input.layout?.panelTitleColor || '#111827',
      panelLinkColor: input.layout?.panelLinkColor || '#374151',
      topLinkColor: input.layout?.topLinkColor || '#111827',
      submenuLinkColor: input.layout?.submenuLinkColor || '#111827',
      level3LinkColor: input.layout?.level3LinkColor || '#374151',
      linkHoverColor: input.layout?.linkHoverColor || '#111827',
      linkHoverBorderColor: input.layout?.linkHoverBorderColor || '#111827',
      searchTagBackgroundColor: input.layout?.searchTagBackgroundColor || '#f3f4f6',
      searchTagTextColor: input.layout?.searchTagTextColor || '#111827',
      searchTagHoverBackgroundColor: input.layout?.searchTagHoverBackgroundColor || '#e5e7eb',
      searchTagHoverTextColor: input.layout?.searchTagHoverTextColor || '#111827',
    },
  };
});

const activeMenu = computed(() => {
  if (activeMenuIndex.value === null) return null;
  return normalizedContent.value.menus[activeMenuIndex.value] || null;
});
const isLinkConfigured = (category: BigMenueNeoCategoryLink) =>
  (category.linkType === 'category' && category.categoryId !== null) ||
  (category.linkType === 'manualUrl' && !!category.manualUrl?.trim());

const activeColumns = computed(() => {
  const columns = activeMenu.value?.columns || [];
  return columns
    .filter((col) => isLinkConfigured(col.category))
    .map((col) => ({
      ...col,
      items: col.items.filter((item) => isLinkConfigured(item.category)),
    }));
});
const activeSearchTerms = computed(() => activeMenu.value?.searchTerms || []);
const activeBrands = computed(() => activeMenu.value?.brands || []);

const menuHasPanelContent = (menu: BigMenueNeoContent['menus'][number]) => {
  const hasColumns = (menu.columns || []).some((col) => isLinkConfigured(col.category));
  const hasSearchTerms = (menu.searchTerms || []).length > 0;
  const hasBrands = (menu.brands || []).length > 0;
  return hasColumns || hasSearchTerms || hasBrands;
};

const rootStyle = computed(() => ({
  '--bmn-bg': normalizedContent.value.layout.backgroundColor,
  '--bmn-text': normalizedContent.value.layout.textColor,
  '--bmn-panel-bg': normalizedContent.value.layout.panelBackgroundColor,
  '--bmn-title': normalizedContent.value.layout.panelTitleColor,
  '--bmn-link': normalizedContent.value.layout.panelLinkColor,
  '--bmn-top-link': normalizedContent.value.layout.topLinkColor,
  '--bmn-sub-link': normalizedContent.value.layout.submenuLinkColor,
  '--bmn-level3-link': normalizedContent.value.layout.level3LinkColor,
  '--bmn-hover-color': normalizedContent.value.layout.linkHoverColor,
  '--bmn-hover-border': normalizedContent.value.layout.linkHoverBorderColor,
  '--bmn-search-bg': normalizedContent.value.layout.searchTagBackgroundColor,
  '--bmn-search-text': normalizedContent.value.layout.searchTagTextColor,
  '--bmn-search-hover-bg': normalizedContent.value.layout.searchTagHoverBackgroundColor,
  '--bmn-search-hover-text': normalizedContent.value.layout.searchTagHoverTextColor,
}));

const findCategoryById = (nodes: CategoryTreeItem[], id: number): CategoryTreeItem | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const match = findCategoryById(node.children, id);
      if (match) return match;
    }
  }
  return null;
};

const findCategoryEntryById = (id: number) => allCategoryEntries.value.find((entry) => entry.id === id) || null;

const normalizePath = (path: string) => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const loadAllCategories = async () => {
  if (categoriesLoading.value || allCategoryEntries.value.length > 0) return;
  categoriesLoading.value = true;
  try {
    const sdk = useSdk();
    const collected: CategoryEntry[] = [];
    let page = 1;
    while (true) {
      const result = await sdk.plentysystems.getCategoriesSearch({ page, itemsPerPage: 200 });
      const pageData = result?.data;
      if (!pageData) break;
      collected.push(...pageData.entries);
      if (pageData.isLastPage) break;
      page++;
    }
    allCategoryEntries.value = collected;
  } catch (error) {
    console.warn('BigMenueNeo: Kategorien fuer Link-Fallback konnten nicht geladen werden', error);
  } finally {
    categoriesLoading.value = false;
  }
};

const getCategoryLabel = (category: BigMenueNeoCategoryLink) => {
  if (category.customLabel?.trim()) return category.customLabel;
  if (category.linkType === 'manualUrl') {
    return category.manualUrl?.trim() || t('bigMenuNeo.notConfigured');
  }
  if (!category.categoryId) return t('bigMenuNeo.notConfigured');
  const match = findCategoryById(categoryTree.value || [], category.categoryId);
  if (match?.details?.[0]?.name) return match.details[0].name;
  const fallbackCategory = findCategoryEntryById(category.categoryId);
  return fallbackCategory?.details?.[0]?.name || t('bigMenuNeo.notConfigured');
};

const resolveCategoryTo = (category: BigMenueNeoCategoryLink) => {
  if (category.linkType === 'manualUrl') {
    return category.manualUrl?.trim() || '/';
  }

  if (!category.categoryId) return '/';
  const categoryTreeNode = findCategoryById(categoryTree.value || [], category.categoryId);
  if (categoryTreeNode) {
    return localePath(buildCategoryMenuLink(categoryTreeNode, categoryTree.value || []));
  }
  const fallbackCategory = findCategoryEntryById(category.categoryId);
  if (fallbackCategory?.linklist) {
    return localePath(normalizePath(fallbackCategory.linklist));
  }
  return '/';
};

const openMenu = (index: number) => {
  const menu = normalizedContent.value.menus[index];
  if (!menu || !menuHasPanelContent(menu)) {
    closeMenu();
    return;
  }
  activeMenuIndex.value = index;
  isPanelOpen.value = true;
};

const closeMenu = () => {
  activeMenuIndex.value = null;
  isPanelOpen.value = false;
};

watch(
  () => normalizedContent.value.menus.length,
  (length) => {
    if (!length) {
      closeMenu();
      return;
    }
    if (activeMenuIndex.value !== null && activeMenuIndex.value > length - 1) {
      closeMenu();
    }
  },
);

onMounted(async () => {
  if (categoryTree.value.length === 0) {
    await getCategoryTree();
  }
  await loadAllCategories();
});
</script>

<style scoped>
.big-menue-neo {
  width: 100%;
  color: var(--bmn-text);
  background: var(--bmn-bg);
  position: relative;
}

.big-menue-neo__container {
  width: 100%;
}

.big-menue-neo__container--boxed {
  max-width: 1280px;
  margin: 0 auto;
}

.big-menue-neo__top {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.1rem;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 0.75rem;
  min-height: 3.25rem;
  overflow-x: auto;
}

.big-menue-neo__top--left {
  justify-content: flex-start;
}

.big-menue-neo__top--center {
  justify-content: center;
}

.big-menue-neo__top--right {
  justify-content: flex-end;
}

.big-menue-neo__top-item {
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  color: var(--bmn-top-link);
  font-weight: 500;
  font-size: 0.985rem;
  line-height: 1.2rem;
  padding: 0.9rem 0.62rem 0.82rem;
  border-radius: 0.125rem;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.big-menue-neo__top-item:hover {
  background: #f8fafc;
  color: var(--bmn-hover-color);
}

.big-menue-neo__top-item--active {
  color: var(--bmn-hover-color);
  font-weight: 600;
}

.big-menue-neo__top-item--active::after {
  content: '';
  position: absolute;
  left: 0.55rem;
  right: 0.55rem;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--bmn-hover-border);
}

.big-menue-neo__top-label {
  margin-right: 0.35rem;
}

.big-menue-neo__top-caret {
  font-size: 0.68rem;
  opacity: 0.75;
  vertical-align: middle;
}

.big-menue-neo__panel {
  background: var(--bmn-panel-bg);
  border-top: 1px solid #eef2f7;
  padding: 1.25rem 1.6rem 1.4rem;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.16);
  position: relative;
  z-index: 40;
}

.big-menue-neo__panel-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 264px;
  gap: 2rem;
}

.big-menue-neo__columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
}

.big-menue-neo__column {
  min-width: 0;
}

.big-menue-neo__column-title {
  font-weight: 700;
  color: var(--bmn-sub-link);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 0.45rem;
  font-size: 0.99rem;
  line-height: 1.3;
  border-bottom: 2px solid transparent;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.big-menue-neo__level-3 {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.12rem;
}

.big-menue-neo__link {
  color: var(--bmn-level3-link);
  text-decoration: none;
  font-size: 0.95rem;
  line-height: 1.35;
  display: inline-block;
  border-radius: 0.2rem;
  padding: 0.12rem 0.22rem 0.08rem;
  border-bottom: 2px solid transparent;
  margin-left: -0.22rem;
  transition: color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.big-menue-neo__link:hover,
.big-menue-neo__column-title:hover,
.big-menue-neo__search-link:hover {
  background: #f8fafc;
}

.big-menue-neo__column-title:hover,
.big-menue-neo__link:hover {
  color: var(--bmn-hover-color);
  border-bottom-color: var(--bmn-hover-border);
}

.big-menue-neo__right-rail {
  display: grid;
  gap: 0.7rem;
  align-content: start;
  border-left: 1px solid #eef2f7;
  padding-left: 1rem;
}

.big-menue-neo__box {
  border: 0;
  border-radius: 0;
  padding: 0.2rem 0;
  background: transparent;
}

.big-menue-neo__box-title {
  margin: 0 0 0.45rem;
  font-weight: 700;
  font-size: 0.8rem;
  line-height: 1.25;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.big-menue-neo__search-list,
.big-menue-neo__brand-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.big-menue-neo__search-list {
  display: grid;
  gap: 0.55rem;
}

.big-menue-neo__brands-wrap {
  margin-top: 1.35rem;
  padding: 1rem 0 0.35rem;
  border-top: 1px solid #e5e7eb;
}

.big-menue-neo__brand-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.2rem 4rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.big-menue-neo__search-link {
  color: var(--bmn-search-text);
  background: var(--bmn-search-bg);
  text-decoration: none;
  font-size: 0.86rem;
  line-height: 1.3;
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.18rem 0.42rem;
  margin-left: 0;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.big-menue-neo__search-link:hover {
  color: var(--bmn-search-hover-text);
  background: var(--bmn-search-hover-bg);
}

.big-menue-neo__brand-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  padding-bottom: 0.2rem;
}

.big-menue-neo__brand-link:hover {
  border-bottom-color: var(--ci);
}

.big-menue-neo__brand-image {
  width: auto;
  max-width: none;
  height: 110px;
  object-fit: contain;
}

.big-menue-neo__brand-placeholder {
  font-size: 0.8rem;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .big-menue-neo__panel {
    padding: 1.1rem 1rem;
    gap: 1.2rem;
    box-shadow: none;
  }

  .big-menue-neo__panel-main {
    grid-template-columns: 1fr;
  }

  .big-menue-neo__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .big-menue-neo__right-rail {
    border-left: 0;
    padding-left: 0;
    border-top: 1px solid #eef2f7;
    padding-top: 0.9rem;
  }
}

@media (max-width: 640px) {
  .big-menue-neo__columns {
    grid-template-columns: 1fr;
  }

  .big-menue-neo__brands-wrap {
    display: none;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "bigMenuNeo.notConfigured": "Not configured",
    "bigMenuNeo.frequentSearches": "Frequent searches",
    "bigMenuNeo.topBrands": "Top brands"
  },
  "de": {
    "bigMenuNeo.notConfigured": "Nicht konfiguriert",
    "bigMenuNeo.frequentSearches": "Haeufige Suchbegriffe",
    "bigMenuNeo.topBrands": "Top-Marken"
  }
}
</i18n>
