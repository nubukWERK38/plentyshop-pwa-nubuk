<template>
  <div ref="rootRef" :class="['relative z-[3000] @container/search', { 'py-1': variant !== 'header' }]">
    <form
      ref="referenceRef"
      role="search"
      :class="{ 'px-px': variant !== 'header', 'header-search-form': variant === 'header' }"
      @submit.prevent="handleSubmit"
    >
      <SfInput
        id="search-bar"
        ref="inputReference"
        v-model="inputModel"
        data-testid="search-bar-input"
        :class="{ 'header-search-input': variant === 'header' }"
        :aria-label="t('common.actions.search')"
        :placeholder="t('common.actions.search')"
        @focus="handleOpen"
      >
        <template v-if="variant !== 'header'" #prefix>
          <SfLoaderCircular v-if="loading || loadingSuggestions" class="shrink-0" aria-hidden="true" />
          <SfIconSearch v-else class="shrink-0" aria-hidden="true" />
        </template>
        <template #suffix>
          <button
            v-if="inputModel"
            type="button"
            :aria-label="t('common.actions.resetSearch')"
            class="flex focus-visible:outline focus-visible:outline-offset"
            @click="handleReset"
          >
            <SfIconCancel aria-hidden="true" />
          </button>
          <SfLoaderCircular v-else-if="variant === 'header' && (loading || loadingSuggestions)" class="shrink-0" aria-hidden="true" />
          <SfIconSearch v-else-if="variant === 'header'" class="shrink-0" aria-hidden="true" />
        </template>
      </SfInput>
    </form>

    <section
      v-if="isDropdownVisible"
      class="search-suggestions w-full grid md:shadow @2xl:grid-cols-3 absolute px-4 pt-4 border border-neutral-100 mt-[2px] gap-8 max-h-[calc(100vh-120px)] overflow-y-auto"
      aria-live="polite"
      aria-relevant="all"
      :aria-label="t('searchBar.searchSuggestions')"
    >
      <div class="w-full lg:col-span-full grid lg:grid-cols-2 gap-8">
        <div class="w-full">
          <div v-if="results?.suggestions?.length" class="mb-8 lg:mb-0">
            <h3 class="sr-only uppercase tracking-widest text-sm font-bold text-neutral-700">
              {{ t('searchBar.searchSuggestions') }}
            </h3>
            <ul>
              <li v-for="(item, index) in results.suggestions" :key="index">
                <UiSearchSuggestionItem :item="item" />
              </li>
            </ul>
          </div>
        </div>

        <div class="w-full">
          <h3 class="uppercase tracking-widest text-sm font-bold text-neutral-700">
            {{ t('searchBar.matchingCategories') }}
          </h3>
          <hr class="h-px mt-2 bg-neutral-200 border-0" />
          <div class="lg:mb-0">
            <ul v-if="results?.categories?.length" class="mt-4 flex flex-wrap gap-1.5">
              <li v-for="(category, index) in results.categories" :key="index">
                <NuxtLink :to="category.url">
                  <div
                    class="bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200 text-neutral-800 text-sm px-3 py-1.5"
                  >
                    {{ category.label }}
                  </div>
                </NuxtLink>
              </li>
            </ul>
            <div v-else class="text-base mt-4 text-neutral-900">{{ t('searchBar.noResultsFound') }}</div>
          </div>
        </div>
      </div>

      <div class="w-full lg:col-span-full @container/products lg:mb-4 overflow-hidden">
        <div class="flex items-center justify-between gap-2">
          <h3 class="uppercase tracking-widest text-sm font-bold text-neutral-700 shrink-0">
            {{ t('searchBar.productSuggestions') }}
          </h3>
          <NuxtLink
            v-if="results?.total"
            :to="getSearchPath(searchTerm)"
            class="hidden @2xl/search:flex text-neutral-900 text-sm font-medium underline underline-offset-4 min-w-0 shrink"
          >
            <template v-for="(part, i) in searchLinkParts" :key="i">
              <span v-if="part === '{{SEARCH_TERM}}'" class="truncate">{{ searchTerm }}</span>
              <span v-else-if="part === '{{HITS_COUNT}}'" class="shrink-0">{{ results?.total }}</span>
              <span v-else class="shrink-0 whitespace-pre">{{ part }}</span>
            </template>
          </NuxtLink>
        </div>

        <hr class="h-px mt-2 bg-neutral-200 border-0" />
        <ul v-if="results?.items?.length" class="mt-4 gap-4 grid sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          <li v-for="(item, index) in results.items" :key="index">
            <UiSearchSuggestionProduct :item="item" />
          </li>
        </ul>
        <div v-else class="mt-4 text-base text-neutral-900 mb-4 @2xl:mb-0">{{ t('searchBar.noResultsFound') }}</div>
      </div>
      <NuxtLink
        v-if="results?.total"
        :to="getSearchPath(searchTerm)"
        class="sticky bottom-0 @2xl:hidden px-2 py-4 bg-white text-base underline underline-offset-4 text-neutral-900 flex w-full overflow-hidden"
      >
        <template v-for="(part, i) in searchLinkParts" :key="i">
          <span v-if="part === '{{SEARCH_TERM}}'" class="truncate">{{ searchTerm }}</span>
          <span v-else-if="part === '{{HITS_COUNT}}'" class="shrink-0">{{ results?.total }}</span>
          <span v-else class="shrink-0 whitespace-pre">{{ part }}</span>
        </template>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { SfIconCancel, SfIconSearch, SfInput, SfLoaderCircular } from '@storefront-ui/vue';
import { onClickOutside, unrefElement } from '@vueuse/core';
import { debounce } from '~/utils/debounce';

const props = defineProps<{
  close?: () => boolean;
  variant?: 'default' | 'header';
}>();

const localePath = useLocalePath();
const router = useRouter();
const route = useRoute();
const { updateSearchTerm } = useCategoryFilter();
const { loading } = useSearch();
const { getSetting: defaultSortingSearch } = useSiteSettings('defaultSortingSearch');
const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const {
  results,
  searchSuggestions,
  searchTerm,
  loading: loadingSuggestions,
  resetSuggestions,
} = useSearchSuggestions();
const { emit } = usePlentyEvent();
const { t } = useI18n();

const searchLinkParts = computed(() => {
  const translated = t('searchBar.showAllResults', {
    searchTerm: '{{SEARCH_TERM}}',
    hitsCount: '{{HITS_COUNT}}',
  });
  return translated.split(/({{SEARCH_TERM}}|{{HITS_COUNT}})/);
});

const inputModel = ref('');
const inputReference = ref<HTMLSpanElement>();

const isDropdownVisible = computed(() => {
  const value = inputModel.value.trim().slice(0, 80);

  return isOpen.value && value.length > 1 && searchTerm.value === value;
});
const handleInputFocus = () => {
  const inputElement = unrefElement(inputReference)?.querySelector('input');
  inputElement?.focus();
};
const handleReset = () => {
  inputModel.value = '';
  handleInputFocus();
};
const handleSubmit = () => {
  handleClose();
  props.close?.();
  updateSearchTerm(inputModel.value);
  emit('frontend:searchProduct', inputModel.value);
  router.push({ path: localePath(paths.search), query: { term: inputModel.value, sort: defaultSortingSearch() } });
  handleReset();
};
const handleSearch = () => {
  if (inputModel.value.length > 1) {
    handleOpen();
    searchSuggestions(inputModel.value);
  }
};
const debounceInput = debounce(handleSearch, 120);

const handleOpen = () => {
  isOpen.value = true;
};

const handleClose = () => {
  isOpen.value = false;
};

onClickOutside(rootRef, () => {
  handleClose();
});

watch(inputModel, () => {
  if (inputModel.value === '') {
    resetSuggestions();
    handleClose();
    return;
  }
  if (inputModel.value.length > 1) {
    debounceInput();
  }
});

watch(
  () => route.fullPath,
  () => {
    inputModel.value = '';
    resetSuggestions();
    handleClose();
  },
);

onUnmounted(() => debounceInput.cancel());
</script>

<style scoped>
.header-search-form {
  width: 100%;
  border: 0;
  background: #E9E9EA !important;
}
.header-search-form > span {
  border: 0;
  border-radius: 0;
  background: #E9E9EA !important;
  --tw-ring-opacity: 0;
}
.header-search-form input {
  border: 0;
  border-radius: 0;
  background: #E9E9EA !important;
}

.header-search-input {
  width: 100%;
}

.header-search-input :deep(input) {
  height: 39px;
  border: 0;
  border-radius: 0;
  background: #e7e7e7;
  color: #1f2933;
  font-size: 14px;
  padding-left: 16px;
}

.header-search-input :deep(input::placeholder) {
  color: transparent;
}

.header-search-input :deep(input:focus) {
  outline: 1px solid #2a5b7d;
  outline-offset: 0;
  box-shadow: none;
}

.header-search-input :deep(svg) {
  color: #0f1720;
}

.search-suggestions {
  top: 100%;
  left: 0;
  z-index: 3000;
  background: #ffffff;
  color: #111827;
}

@media (min-width: 1024px) {
  .search-suggestions {
    left: 50%;
    width: 70vw;
    max-width: calc(100vw - 2rem);
    transform: translateX(-50%);
  }
}
</style>
