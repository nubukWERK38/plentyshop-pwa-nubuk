<template>
  <div :style="inlineStyle" data-testid="category-data">
    <template
      v-if="props.content.displayCategoryImage === 'off' || (!imageUrl && props.content.displayCategoryImage !== 'off')"
    >
      <div
        v-if="shouldShowTextBlock || shouldRenderInlineBreadcrumb"
        data-testid="text-card"
        :class="['category-data-text-header w-full', { 'category-data-empty-image-header': isImageHeaderWithoutImage }]"
        :style="{
          color: props.content.text.color,
          backgroundColor: props.content.text.bgColor,
        }"
      >
        <div class="category-data-inner">
          <div
            v-if="showNoTextMessage && !shouldRenderInlineBreadcrumb"
            class="text-center"
            role="alert"
            aria-live="polite"
            data-testid="no-text-selected"
          >
            {{ getEditorTranslation('no-text-fields-selected') }}
          </div>
          <div
            v-if="shouldRenderInlineBreadcrumb"
            :class="{ 'mb-10': detailsReady }"
            data-testid="category-data-breadcrumbs"
          >
            <UiBreadcrumbs :breadcrumbs="breadcrumbs" />
          </div>
          <FieldsOrder
            v-if="detailsReady"
            :fields="props.content.fields"
            :fields-order="props.content.fieldsOrder"
            :texts="texts"
            :show-subcategories="shouldRenderSubcategories"
            :subcategories="visibleSubcategories"
            :show-brands="shouldRenderBrands"
            :brands="visibleBrands"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="category-data-image-frame relative overflow-hidden">
        <NuxtImg
          v-if="imageUrl"
          :src="imageUrl"
          :alt="categoryImageAlt"
          :class="['relative z-0 object-cover', 'w-full', 'h-full']"
          :style="{
            filter: props.content.image?.brightness ? 'brightness(' + (props.content.image?.brightness ?? 1) + ')' : '',
            width: '100%',
            height: '100%',
          }"
          width="1536"
          height="380"
          :loading="'lazy'"
          :data-testid="'category-data-image-' + meta.uuid"
        />

        <div
          v-if="imageUrl"
          class="category-data-image-overlay pointer-events-none absolute inset-y-0 left-0 z-[1]"
          :data-testid="'category-data-image-overlay-' + meta.uuid"
        />

        <div
          v-if="shouldShowTextBlock"
          :class="['category-data-image-text-wrap absolute inset-0 z-[2] flex flex-col']"
          :style="{
            color: props.content.text.color,
            textAlign: getTextAlignment(props.content.text.textAlignment ?? ''),
          }"
          :data-testid="'category-data-overlay-' + meta.uuid"
        >
          <div
            :class="['category-data-inner', 'category-data-image-inner']"
            :style="{
              alignItems: getContentPosition(props.content.text.align ?? ''),
              justifyContent: getContentPosition(props.content.text.justify ?? ''),
            }"
          >
            <div
              :class="[categoryDataContentClass, 'category-data-image-content']"
              :style="{
                backgroundColor: props.content.text.background
                  ? hexToRgba(props.content.text.bgColor, props.content.text.bgOpacity)
                  : '',
              }"
              :data-testid="'category-data-content-' + meta.uuid"
            >
              <div
                v-if="showNoTextMessage"
                class="text-center"
                role="alert"
                aria-live="polite"
                data-testid="no-text-selected"
              >
                {{ getEditorTranslation('no-text-fields-selected') }}
              </div>
              <FieldsOrder
                v-else-if="detailsReady"
                :fields="props.content.fields"
                :fields-order="props.content.fieldsOrder"
                :texts="texts"
                :show-subcategories="shouldRenderSubcategories"
                :subcategories="visibleSubcategories"
                :show-brands="shouldRenderBrands"
                :brands="visibleBrands"
                :max-subcategory-rows="4"
                :max-brand-rows="4"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  type Category,
  type CategoryEntry,
  type Filter,
  type FilterGroup,
  categoryGetters,
  categoryTreeGetters,
  facetGetters,
} from '@plentymarkets/shop-api';
import type {
  CategoryData,
  CategoryDataLinkItem,
  CategoryDataProps,
  CategoryDataSubcategory,
} from '~/components/blocks/CategoryData/types';
import type { CategoryDetails } from '@plentymarkets/shop-api/server/types';
import FieldsOrder from './FieldsOrder.vue';

const runtimeConfig = useRuntimeConfig();

const props = defineProps<CategoryDataProps>();
const sdk = useSdk();
const route = useRoute();
const { hexToRgba, getTextAlignment, getContentPosition, isMobile } = useBlockContentHelper();
const { data: productsCatalog } = useProducts();
const { data: categoryTree } = useCategoryTree();
const { buildCategoryMenuLink } = useLocalization();
const localePath = useLocalePath();
const category = computed(() => productsCatalog.value.category || ({} as Category));
const getDetailsFromCategory = (categoryData?: Category | null): CategoryDetails => {
  if (!categoryData) return {} as CategoryDetails;

  const categoryDetails = categoryGetters.getCategoryDetails(categoryData) as CategoryDetails | undefined;
  const fallbackDetails = (categoryData as Category & { details?: CategoryDetails[] }).details;

  return categoryDetails || fallbackDetails?.[0] || ({} as CategoryDetails);
};
const details = computed(() => getDetailsFromCategory(category.value));
const getParentCategoryId = (categoryData: Category) => {
  const categoryWithParent = categoryData as Category & {
    parentCategoryId?: number | string | null;
    parentCategoryID?: number | string | null;
    parentId?: number | string | null;
  };

  return Number(
    categoryWithParent.parentCategoryId ?? categoryWithParent.parentCategoryID ?? categoryWithParent.parentId,
  );
};
const parentCategoryId = computed(() => getParentCategoryId(category.value));
const parentCategory = computed(() => {
  if (!parentCategoryId.value) return null;

  return categoryTreeGetters.findCategoryById(categoryTree.value, parentCategoryId.value) as Category | null;
});
const parentDetails = computed(() => getDetailsFromCategory(parentCategory.value));
const getImagePathFromDetails = (categoryDetails: CategoryDetails, imageSlot: 'image-1' | 'image-2') => {
  if (imageSlot === 'image-1') {
    return categoryDetails.imagePath || categoryDetails.plenty_category_details_image_path || '';
  }

  return categoryDetails.image2Path || categoryDetails.plenty_category_details_image2_path || '';
};

const hiddenRootCategoryName = 'Produkte Neuer Shop';
const enabledText = computed(
  () =>
    (props.content.fields.name && details.value.name) ||
    (props.content.fields.description1 && details.value.description) ||
    (props.content.fields.description2 && details.value.description2) ||
    (props.content.fields.shortDescription && details.value.shortDescription),
);
const showNoTextMessage = computed(() => !enabledText.value);
const { isEditMode, isPreviewMode, isLiveMode } = useEditorState();
const shouldShowTextBlock = computed(
  () => isEditMode.value || ((isPreviewMode.value || isLiveMode.value) && !showNoTextMessage.value),
);

const fetchedDirectSubcategories = ref<CategoryEntry[]>([]);

const getSubcategoryLink = (categoryId?: number | string) => {
  const numericCategoryId = Number(categoryId);
  if (!numericCategoryId) {
    return '';
  }

  const categoryTreeItem = categoryTreeGetters.findCategoryById(categoryTree.value, numericCategoryId);
  if (!categoryTreeItem) {
    return '';
  }

  return localePath(buildCategoryMenuLink(categoryTreeItem, categoryTree.value));
};

const getSubcategoryFromEntry = (entry: CategoryEntry): CategoryDataSubcategory => {
  return {
    name: entry.details?.[0]?.name ?? '',
    link: getSubcategoryLink(entry.id),
  };
};

const getSubcategoryFromNode = (categoryNode: Category): CategoryDataSubcategory => {
  const detailsData = categoryGetters.getCategoryDetails(categoryNode) as CategoryDetails | undefined;
  const fallbackDetails = (categoryNode as Category & { details?: CategoryDetails[] }).details;

  if (detailsData?.name) {
    return {
      name: detailsData.name,
      link: getSubcategoryLink(categoryGetters.getId(categoryNode)),
    };
  }

  return {
    name: fallbackDetails?.[0]?.name ?? '',
    link: getSubcategoryLink(categoryGetters.getId(categoryNode)),
  };
};

const categoryTreeSubcategories = computed<CategoryDataSubcategory[]>(() => {
  const categoryId = Number(category.value?.id);
  if (!categoryId) return [];

  const categoryTreeItem = categoryTreeGetters.findCategoryById(categoryTree.value, categoryId) as
    | (Category & { children?: Category[] })
    | null;

  return (categoryTreeItem?.children ?? [])
    .map(getSubcategoryFromNode)
    .filter((subcategory) => Boolean(subcategory.name?.trim()) && Boolean(subcategory.link));
});

const defaultSubcategories = computed<CategoryDataSubcategory[]>(() => {
  const categoryWithChildren = category.value as Category & { children?: Category[] };
  const inlineChildren = (categoryWithChildren.children ?? [])
    .map(getSubcategoryFromNode)
    .filter((subcategory) => Boolean(subcategory.name?.trim()) && Boolean(subcategory.link));

  if (inlineChildren.length > 0) {
    return inlineChildren;
  }

  if (categoryTreeSubcategories.value.length > 0) {
    return categoryTreeSubcategories.value;
  }

  return fetchedDirectSubcategories.value
    .map(getSubcategoryFromEntry)
    .filter((subcategory) => Boolean(subcategory.name?.trim()) && Boolean(subcategory.link));
});

const getValidManualLinks = (items?: CategoryDataLinkItem[]) => {
  return (items ?? []).filter((item) => Boolean(item.name?.trim()) && Boolean(item.link?.trim()));
};

const visibleSubcategories = computed<CategoryDataSubcategory[]>(() => {
  if (props.content.subcategoryMode === 'manual') {
    return getValidManualLinks(props.content.subcategories);
  }

  return defaultSubcategories.value;
});

const producerFacet = computed<FilterGroup | undefined>(() => {
  return productsCatalog.value.facets?.find((facet) => facetGetters.getType(facet) === 'producer') as
    | FilterGroup
    | undefined;
});

const getBrandFilterLink = (filter: Filter) => {
  const filterId = typeof filter.id === 'string' ? filter.id : filter.id?.toString();
  return filterId ? `${route.path}?facets=${filterId}` : '';
};

const defaultBrands = computed<CategoryDataLinkItem[]>(() => {
  if (!producerFacet.value) return [];

  return facetGetters
    .getFilters(producerFacet.value)
    .map((filter) => ({
      name: filter.name ?? '',
      link: getBrandFilterLink(filter),
    }))
    .filter((brand) => Boolean(brand.name?.trim()) && Boolean(brand.link));
});

const visibleBrands = computed<CategoryDataLinkItem[]>(() => {
  if (props.content.brandMode === 'manual') {
    return getValidManualLinks(props.content.brands);
  }

  return defaultBrands.value;
});

const loadDirectSubcategories = async () => {
  const categoryId = Number(category.value?.id);
  if (
    !categoryId ||
    !props.content.showSubcategories ||
    props.content.subcategoryMode === 'manual' ||
    isLiveMode.value ||
    categoryTreeSubcategories.value.length > 0
  ) {
    fetchedDirectSubcategories.value = [];
    return;
  }

  const collected: CategoryEntry[] = [];
  let page = 1;

  while (true) {
    let result;
    try {
      result = await sdk.plentysystems.getCategoriesSearch({
        parentCategoryId: categoryId,
        page,
        itemsPerPage: 200,
        with: 'details',
      });
    } catch {
      fetchedDirectSubcategories.value = [];
      return;
    }

    const pageData = result?.data;
    if (!pageData) {
      break;
    }

    const entries = pageData.entries ?? [];
    collected.push(...entries);

    if (pageData.isLastPage || entries.length === 0) {
      break;
    }

    page++;
  }

  fetchedDirectSubcategories.value = collected;
};

watch(
  () => [
    category.value?.id,
    props.content.showSubcategories,
    props.content.subcategoryMode,
    categoryTreeSubcategories.value.length,
    isLiveMode.value,
  ],
  () => {
    void loadDirectSubcategories();
  },
  { immediate: true },
);

const texts = computed<CategoryData>(() => {
  const fields = props.content.fields || {};
  const detailsText = details.value || ({} as CategoryDetails);
  return {
    name: fields.name && detailsText.name ? detailsText.name : '',
    description1: fields.description1 && detailsText.description ? detailsText.description : '',
    description2: fields.description2 && detailsText.description2 ? detailsText.description2 : '',
    shortDescription: fields.shortDescription && detailsText.shortDescription ? detailsText.shortDescription : '',
  };
});

const detailsReady = computed(() => {
  const textsData = texts.value;
  return !!(textsData.name || textsData.description1 || textsData.description2 || textsData.shortDescription);
});

const getParentPathFromRoute = () => {
  const normalizedPath = route.path.replace(/\/+$/, '');
  const segments = normalizedPath.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';

  return `/${segments.slice(0, -1).join('/')}/`;
};

const fallbackBreadcrumbs = computed(() => {
  const items: { name: string; link: string }[] = [];
  const parentName = parentDetails.value.name;
  const currentName = details.value.name;

  if (parentName) {
    items.push({
      name: parentName,
      link: getParentPathFromRoute(),
    });
  }

  if (currentName) {
    items.push({
      name: currentName,
      link: route.path,
    });
  }

  return items;
});

const breadcrumbs = computed(() => {
  if (!productsCatalog.value.category) return [];

  let categoryBreadcrumbs = [
    ...categoryTreeGetters.generateBreadcrumbFromCategory(
      categoryTree.value,
      categoryGetters.getId(productsCatalog.value.category),
    ),
  ];

  if (categoryBreadcrumbs.length === 0) {
    categoryBreadcrumbs = [...fallbackBreadcrumbs.value];
  }

  categoryBreadcrumbs.unshift({ name: t('common.labels.home'), link: '/' });
  return categoryBreadcrumbs.filter((item) => item.name !== hiddenRootCategoryName);
});
const inlineBreadcrumbHost = useState<string | null>('category-data-inline-breadcrumb-host', () => null);
const inlineBreadcrumbKey = computed(() => {
  const categoryId = categoryGetters.getId(productsCatalog.value.category);
  return categoryId ? `${categoryId}:${props.meta.uuid}` : '';
});
const canHostInlineBreadcrumb = computed(
  () =>
    props.content.displayCategoryImage === 'off' && breadcrumbs.value.length > 0 && Boolean(inlineBreadcrumbKey.value),
);

watchEffect(() => {
  if (!canHostInlineBreadcrumb.value) return;

  const categoryId = categoryGetters.getId(productsCatalog.value.category);
  const hostCategoryId = inlineBreadcrumbHost.value?.split(':')[0];
  if (!inlineBreadcrumbHost.value || hostCategoryId !== String(categoryId)) {
    inlineBreadcrumbHost.value = inlineBreadcrumbKey.value;
  }
});

const shouldRenderInlineBreadcrumb = computed(
  () => canHostInlineBreadcrumb.value && inlineBreadcrumbHost.value === inlineBreadcrumbKey.value,
);
const isBrandWorldCategory = computed(() => {
  const normalizedPath = route.path.toLowerCase().replace(/\/+$/, '');
  return normalizedPath.split('/').includes('markenwelt') || details.value.name?.toLowerCase() === 'markenwelt';
});
const shouldRenderSubcategories = computed(() => {
  if (isMobile.value) return false;

  const isImageHeader = props.content.displayCategoryImage !== 'off';
  return (props.content.showSubcategories ?? true) && !(isImageHeader && isBrandWorldCategory.value);
});
const shouldRenderBrands = computed(() => {
  if (isMobile.value) return false;

  return props.content.showBrands ?? true;
});

const imagePath = computed(() => {
  if (props.content.displayCategoryImage === 'image-1') {
    return getImagePathFromDetails(details.value, 'image-1');
  }
  if (props.content.displayCategoryImage === 'image-2') {
    return getImagePathFromDetails(details.value, 'image-2');
  }
  return '';
});

const imageUrl = computed(() => {
  return imagePath.value ? `${runtimeConfig.public.domain}/documents/${imagePath.value}` : '';
});

const categoryImageAlt = computed(() => {
  return props.content.image?.alt?.trim() || details.value.name || '';
});

const isImageHeaderWithoutImage = computed(() => props.content.displayCategoryImage !== 'off' && !imageUrl.value);

const inlineStyle = computed(() => {
  const layout = props.content.layout || {};
  const isLegacyTextBlockPaddingBottom =
    props.content.displayCategoryImage === 'off' &&
    layout.paddingTop === 0 &&
    layout.paddingBottom === 40 &&
    layout.paddingLeft === 0 &&
    layout.paddingRight === 0;
  const paddingBottom = isLegacyTextBlockPaddingBottom ? 0 : layout.paddingBottom;
  const style: Record<string, string> = {};

  if (layout.paddingTop) style.paddingTop = `${layout.paddingTop}px`;
  if (paddingBottom) style.paddingBottom = `${paddingBottom}px`;
  if (layout.paddingLeft) style.paddingLeft = `${layout.paddingLeft}px`;
  if (layout.paddingRight) style.paddingRight = `${layout.paddingRight}px`;

  return style;
});

const categoryDataContentClass = computed(() => {
  return isMobile.value ? 'p-4 md:p-6 rounded-lg w-full' : 'p-4 md:p-6 rounded-lg md:max-w-[50%] mx-5';
});
</script>

<style scoped>
.category-data-image-frame {
  height: clamp(220px, 22vw, 380px);
}

.category-data-empty-image-header {
  min-height: clamp(180px, 18vw, 280px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-data-inner {
  width: 100%;
  max-width: 1536px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.category-data-empty-image-header .category-data-inner {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.category-data-text-header .category-data-inner {
  padding-left: 0;
  padding-right: 0;
}

.category-data-empty-image-header :deep(.category-data-description > :not(ul):not(ol)) {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

.category-data-empty-image-header :deep(.category-data-description > :first-child) {
  margin-top: 0;
}

.category-data-empty-image-header :deep(.category-data-description > :last-child) {
  margin-bottom: 0;
}

.category-data-empty-image-header :deep(#category-headline) {
  color: var(--ci-dark) !important;
}

.category-data-empty-image-header :deep(.category-data-link-list),
.category-data-empty-image-header :deep(.category-data-description-1) {
  max-width: 100%;
}

.category-data-inner :deep(.category-data-description-1),
.category-data-inner :deep(.category-data-description-1 *) {
  font-family: 'Noto Sans', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.45 !important;
}

.category-data-inner :deep(.category-data-description-1 h1),
.category-data-inner :deep(.category-data-description-1 .h1) {
  font-size: 48px !important;
}

.category-data-inner :deep(.category-data-description-1 h2),
.category-data-inner :deep(.category-data-description-1 .h2) {
  font-size: 35px !important;
}

.category-data-inner :deep(.category-data-description-1 h3),
.category-data-inner :deep(.category-data-description-1 .h3) {
  font-size: 24px !important;
}

.category-data-inner :deep(.category-data-description-1 h4),
.category-data-inner :deep(.category-data-description-1 .h4) {
  font-size: 18px !important;
}

.category-data-image-inner {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.category-data-image-overlay {
  width: 50%;
  background: linear-gradient(90deg, rgb(65 112 56 / 70%) 0%, rgb(45 125 174 / 62%) 100%);
}

.category-data-image-content {
  transform: translateY(-20px);
}

.category-data-image-frame :deep(#category-headline) {
  margin: 0 0 1rem;
  line-height: 1.18;
}

@media (min-width: 768px) {
  .category-data-inner {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (max-width: 1023px) {
  .category-data-empty-image-header :deep(#category-headline),
  .category-data-empty-image-header :deep(.category-data-link-list),
  .category-data-empty-image-header :deep(.category-data-description) {
    margin-left: 0 !important;
  }
}

@media (min-width: 1024px) {
  .category-data-inner {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }

  .category-data-text-header .category-data-inner {
    padding-left: 0;
    padding-right: 0;
  }

  .category-data-empty-image-header :deep(.category-data-link-list) {
    margin-left: 5rem;
  }

  .category-data-empty-image-header :deep(#category-headline) {
    margin-left: 5rem;
  }

  .category-data-empty-image-header :deep(.category-data-link-list),
  .category-data-empty-image-header :deep(.category-data-description-1) {
    max-width: calc(100% - 5rem);
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "no-text-fields-selected": "No text fields are selected."
  },
  "de": {
    "no-text-fields-selected": "No text fields are selected."
  }
}
</i18n>
