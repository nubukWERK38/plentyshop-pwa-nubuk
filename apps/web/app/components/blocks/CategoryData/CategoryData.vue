<template>
  <div :style="inlineStyle" data-testid="category-data">
    <template
      v-if="props.content.displayCategoryImage === 'off' || (!imageUrl && props.content.displayCategoryImage !== 'off')"
    >
      <div
        v-if="shouldShowTextBlock || shouldRenderInlineBreadcrumb"
        data-testid="text-card"
        :class="['w-full']"
        :style="{
          color: props.content.text.color,
          backgroundColor: props.content.text.bgColor,
        }"
      >
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
          :subcategories="directSubcategories"
        />
      </div>
    </template>
    <template v-else>
      <div class="category-data-image-frame relative overflow-hidden">
        <NuxtImg
          v-if="imageUrl"
          :src="imageUrl"
          :alt="props.content.image?.alt ?? ''"
          :class="['relative z-0 object-cover', 'w-full', 'h-full']"
          :style="{
            filter: props.content.image?.brightness ? 'brightness(' + (props.content.image?.brightness ?? 1) + ')' : '',
            width: '100%',
            height: '100%',
          }"
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
          :class="[
            'absolute max-w-screen-3xl mx-auto inset-0 z-[2] p-4 flex flex-col md:basis-2/4',
            { 'md:p-10': props.content.text.bgColor },
          ]"
          :style="{
            color: props.content.text.color,
            textAlign: getTextAlignment(props.content.text.textAlignment ?? ''),
            alignItems: getContentPosition(props.content.text.align ?? ''),
            justifyContent: getContentPosition(props.content.text.justify ?? ''),
          }"
          :data-testid="'category-data-overlay-' + meta.uuid"
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
              :subcategories="directSubcategories"
              :max-subcategory-rows="4"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Category, type CategoryEntry, categoryGetters, categoryTreeGetters } from '@plentymarkets/shop-api';
import type { CategoryData, CategoryDataProps, CategoryDataSubcategory } from '~/components/blocks/CategoryData/types';
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

const details = computed(() => categoryGetters.getCategoryDetails(category.value) || ({} as CategoryDetails));
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

const directSubcategories = computed<CategoryDataSubcategory[]>(() => {
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

const loadDirectSubcategories = async () => {
  const categoryId = Number(category.value?.id);
  if (
    !categoryId ||
    !props.content.showSubcategories ||
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

    collected.push(...(pageData.entries ?? []));

    if (pageData.isLastPage) {
      break;
    }

    page++;
  }

  fetchedDirectSubcategories.value = collected;
};

watch(
  () => [category.value?.id, props.content.showSubcategories, categoryTreeSubcategories.value.length, isLiveMode.value],
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
const breadcrumbs = computed(() => {
  if (!productsCatalog.value.category) return [];

  const categoryBreadcrumbs = categoryTreeGetters.generateBreadcrumbFromCategory(
    categoryTree.value,
    categoryGetters.getId(productsCatalog.value.category),
  );

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
  const isImageHeader = props.content.displayCategoryImage !== 'off';
  return (props.content.showSubcategories ?? false) && !(isImageHeader && isBrandWorldCategory.value);
});
const imagePath = computed(() => {
  if (props.content.displayCategoryImage === 'image-1') {
    return details.value.imagePath;
  }
  if (props.content.displayCategoryImage === 'image-2') {
    return details.value.image2Path;
  }
  return '';
});

const imageUrl = computed(() => {
  return imagePath.value ? `${runtimeConfig.public.domain}/documents/${imagePath.value}` : '';
});

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
