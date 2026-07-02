<template>
  <NuxtLayout name="default">
    <div data-testid="search-results" class="relative" :class="{ 'pointer-events-none opacity-50': loading }">
      <SfLoaderCircular v-if="loading" class="fixed top-[50%] right-0 left-0 m-auto z-[99999]" size="2xl" />
      <NarrowContainer v-if="productsCatalog" class="mb-20 px-4 md:px-6 lg:px-10">
        <h1 class="my-10 font-bold typography-headline-3 md:typography-headline-2">
          {{ t('search.searchResults', { phrase: route.query.term }) }}
        </h1>

        <div class="md:grid md:grid-cols-[303px_minmax(0,1fr)] gap-6" data-testid="category-page-content">
          <CategorySidebar class="md:w-[303px]" :is-open="isOpen" @close="close">
            <h2 class="mb-2 border-b border-neutral-900 pb-4 text-lg font-bold text-neutral-900">
              {{ t('common.labels.filters') }}
            </h2>

            <template v-if="facetGetters.hasFilters(productsCatalog.facets)">
              <CategoryFiltersSort
                v-for="key in filterRenderKeys"
                :key="key"
                :facets="productsCatalog.facets"
                :configuration="filterConfiguration"
                :render-key="key"
                :show-all="key === 'customizedFilters'"
                :limit="0"
              />
            </template>
          </CategorySidebar>

          <div class="min-w-0">
            <div class="mb-6 flex flex-wrap items-center gap-4">
              <UiButton variant="tertiary" class="md:hidden whitespace-nowrap" @click="open">
                <template #prefix>
                  <SfIconTune />
                </template>
                {{ t('common.labels.listSettings') }}
              </UiButton>

              <span class="mr-auto whitespace-nowrap text-sm font-medium text-neutral-700">
                {{ totalProducts }} {{ t('common.labels.products') }}
              </span>

              <div class="flex flex-wrap items-center gap-4">
                <CategorySorting class="w-[260px] shrink-0" selection-mode-compact />
                <CategoryItemsPerPage
                  class="w-[160px] shrink-0"
                  selection-mode-compact
                  :total-products="productsCatalog.pagination.totals"
                />
              </div>
            </div>

            <section v-if="productsCatalog.products?.length" :class="gridClasses" data-testid="category-grid">
              <NuxtLazyHydrate
                v-for="(product, index) in productsCatalog.products"
                :key="productGetters.getVariationId(product)"
                when-visible
              >
                <UiProductCard :product="product" :configuration="itemGridConfiguration" :index="index" />
              </NuxtLazyHydrate>
            </section>
            <LazyCategoryEmptyState v-else />

            <div v-if="productsCatalog.pagination.totals > 0" class="mt-4 mb-4 typography-text-xs flex gap-1">
              <span>{{ t('common.labels.asterisk') }}</span>
              <span v-if="showNetPrices">{{ t('product.priceExclVAT') }}</span>
              <span v-else>{{ t('product.priceInclVAT') }}</span>
              <i18n-t keypath="shipping.excludedLabel" scope="global">
                <template #shipping>
                  <SfLink
                    :href="localePath(paths.shipping)"
                    target="_blank"
                    class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
                  >
                    {{ t('common.labels.delivery') }}
                  </SfLink>
                </template>
              </i18n-t>
            </div>

            <UiPagination
              v-if="productsCatalog.pagination.totals > 0"
              :key="`${productsCatalog.pagination.totals}-${productsPerPage}`"
              :current-page="getFacetsFromURL().page ?? 1"
              :total-items="productsCatalog.pagination.totals"
              :page-size="Number(productsPerPage)"
              :max-visible-pages="maxVisiblePages"
            />
          </div>
        </div>
      </NarrowContainer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { facetGetters, productGetters } from '@plentymarkets/shop-api';
import { SfIconTune, SfLink, SfLoaderCircular, useDisclosure } from '@storefront-ui/vue';
import type { Locale } from '#i18n';
import type { SortFilterContent, SortFilterFieldKey } from '~/components/blocks/SortFilter/types';
import type { ItemGridContent } from '~/components/blocks/ItemGrid/types';
import { paths } from '~/utils/paths';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

const { getRobots, setRobotForStaticPage } = useRobots();
const { getSetting: getMetaDescription } = useSiteSettings('metaDescription');
const { getSetting: getMetaKeywords } = useSiteSettings('metaKeywords');

definePageMeta({
  layout: false,
  type: 'search',
});

const route = useRoute();
const { getSearch, data: productsCatalog, productsPerPage, loading } = useSearch();
const { getFacetsFromURL } = useCategoryFilter();
const { showNetPrices } = useCart();
const localePath = useLocalePath();
const viewport = useViewport();
const { isOpen, open, close } = useDisclosure();

const filterRenderKeys: SortFilterFieldKey[] = ['manufacturer', 'price', 'availability', 'customizedFilters'];
const filterConfiguration: SortFilterContent = {
  fields: {
    category: false,
    sortBy: false,
    perPage: false,
    itemRating: false,
    manufacturer: true,
    price: true,
    availability: true,
    customizedFilters: true,
  },
  filtersOrder: filterRenderKeys,
  filtersDisabled: [],
  showAllFiltersImmediately: true,
  numberOfFiltersToShowInitially: 0,
  layout: {},
};

const itemGridConfiguration: ItemGridContent = {
  itemsPerRowDesktop: 3,
  itemsPerRowTablet: 3,
  itemsPerRowMobile: 1,
  showItemCount: true,
  itemCountPosition: 'left',
  fields: {
    title: true,
    rating: true,
    previewText: true,
    price: true,
    addToCart: true,
    manufacturer: true,
  },
  fieldsOrder: ['title', 'manufacturer', 'rating', 'previewText', 'price', 'addToCart'],
  fieldsDisabled: ['title'],
  contentAlignment: 'left',
  cardBorders: true,
  showSecondImageOnHover: false,
  showWishlistButton: false,
  addToCartStyle: 'primary',
  paginationPosition: 'bottom',
  layout: {},
};

const gridClasses = gridClassFor(
  {
    mobile: itemGridConfiguration.itemsPerRowMobile,
    tablet: itemGridConfiguration.itemsPerRowTablet,
    desktop: itemGridConfiguration.itemsPerRowDesktop,
  },
  ['gap-4', 'md:gap-6', 'mb-10', 'md:mb-5'],
);
const maxVisiblePages = computed(() => (viewport.isGreaterOrEquals('lg') ? 5 : 2));
const totalProducts = computed(() => Number(productsCatalog.value.pagination?.totals) || 0);

const handleQueryUpdate = async () => {
  await getSearch(getFacetsFromURL());
};

await handleQueryUpdate();

watch(
  () => route.query,
  async () => {
    handleQueryUpdate();
  },
);

await getRobots();
setRobotForStaticPage('SearchResult');

useHead({
  title: () => t('search.title'),
  meta: [
    { name: 'description', content: () => getMetaDescription() },
    { name: 'keywords', content: () => getMetaKeywords() },
  ],
});
</script>
