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
        :maxlength="80"
        :aria-describedby="isDropdownVisible && !canSubmit ? searchStatusId : undefined"
        :aria-busy="loadingSuggestions || submitting"
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
          <SfLoaderCircular
            v-else-if="variant === 'header' && (loading || loadingSuggestions)"
            class="shrink-0"
            aria-hidden="true"
          />
          <SfIconSearch v-else-if="variant === 'header'" class="shrink-0" aria-hidden="true" />
        </template>
      </SfInput>
    </form>

    <section
      v-if="isDropdownVisible"
      :class="{ 'search-suggestions--empty': isEmptySearch }"
      class="search-suggestions w-full grid md:shadow @2xl:grid-cols-3 absolute px-4 py-4 border border-neutral-100 mt-[2px] gap-8 max-h-[calc(100vh-120px)] overflow-y-auto"
      aria-live="polite"
      aria-relevant="all"
      :aria-label="t('searchBar.searchSuggestions')"
    >
      <div v-if="isEmptySearch" :id="searchStatusId" role="status" class="search-empty" data-testid="search-status">
        <div class="search-empty__copy">
          <h3 class="search-empty__title">{{ t('searchBar.noMatchingProductsTitle') }}</h3>
          <p class="search-empty__text">{{ t('searchBar.noMatchingProducts') }}</p>
        </div>
        <svg class="search-empty__smiley" viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
          <circle cx="48" cy="48" r="41" stroke="currentColor" stroke-width="3.5" />
          <circle cx="34" cy="38" r="3.5" fill="currentColor" />
          <circle cx="62" cy="38" r="3.5" fill="currentColor" />
          <path
            d="M29 55c3 11 12 16 19 16s16-5 19-16"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <p
        v-else-if="loadingSuggestions || searchError"
        :id="searchStatusId"
        role="status"
        class="lg:col-span-full text-base text-neutral-900"
        data-testid="search-status"
      >
        {{ t(loadingSuggestions ? 'searchBar.loading' : 'searchBar.searchError') }}
      </p>
      <div
        v-if="results?.categories?.length || results?.suggestions?.length"
        class="w-full lg:col-span-full grid lg:grid-cols-2 gap-8"
      >
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

      <div v-if="results?.items?.length" class="w-full lg:col-span-full @container/products lg:mb-4 overflow-hidden">
        <div class="flex items-center justify-between gap-2">
          <h3 class="uppercase tracking-widest text-sm font-bold text-neutral-700 shrink-0">
            {{ t('searchBar.productSuggestions') }}
          </h3>
          <NuxtLink
            v-if="canSubmit && results?.total"
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
      </div>
      <NuxtLink
        v-if="canSubmit && results?.total"
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
import { getSearchPath } from '~/utils/pathHelper';
import { debounce } from '~/utils/debounce';

const props = defineProps<{
  close?: () => boolean;
  variant?: 'default' | 'header';
  autofocus?: boolean;
}>();

const router = useRouter();
const route = useRoute();
const { loading } = useSearch();
const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const {
  results,
  searchSuggestions,
  searchTerm,
  loading: loadingSuggestions,
  error: searchError,
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
const submitting = ref(false);
let submissionId = 0;
const canSubmit = computed(
  () => !loadingSuggestions.value && !searchError.value && Boolean(results.value?.items?.length),
);
const searchStatusId = useId();
const isEmptySearch = computed(() => !loadingSuggestions.value && !searchError.value && !results.value?.items?.length);
const handleSubmit = async () => {
  const term = inputModel.value.trim().slice(0, 80);
  if (term.length < 2 || submitting.value) return;
  const currentSubmissionId = ++submissionId;
  submitting.value = true;
  debounceInput.cancel();
  handleOpen();
  try {
    await searchSuggestions(term);
    if (
      currentSubmissionId !== submissionId ||
      inputModel.value.trim().slice(0, 80) !== term ||
      searchTerm.value !== term ||
      !canSubmit.value
    )
      return;
    emit('frontend:searchProduct', term);
    await router.push(getSearchPath(term));
    handleClose();
    props.close?.();
    handleReset();
  } finally {
    if (currentSubmissionId === submissionId) submitting.value = false;
  }
};
const handleSearch = () => {
  if (inputModel.value.trim().length > 1) {
    handleOpen();
    searchSuggestions(inputModel.value);
  }
};
const debounceInput = debounce(handleSearch, 250);

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
  submissionId++;
  submitting.value = false;
  if (inputModel.value.trim().length < 2) {
    debounceInput.cancel();
    resetSuggestions();
    handleClose();
    return;
  }
  debounceInput();
});

watch(
  () => route.fullPath,
  () => {
    inputModel.value = '';
    resetSuggestions();
    handleClose();
  },
);

onMounted(() => {
  if (props.autofocus) {
    nextTick(handleInputFocus);
  }
});

onUnmounted(() => debounceInput.cancel());
</script>

<style scoped>
.header-search-form {
  width: 100%;
  border: 0;
  background: #e9e9ea !important;
}
.header-search-form > span {
  border: 0;
  border-radius: 0;
  background: #e9e9ea !important;
  --tw-ring-opacity: 0;
}
.header-search-form input {
  border: 0;
  border-radius: 0;
  background: #e9e9ea !important;
}

.header-search-input {
  width: 100%;
}

.header-search-input :deep(input) {
  min-width: 0 !important;
  width: 0;
  flex: 1;
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

.search-suggestions--empty {
  gap: 1rem;
  padding: 0;
  margin-top: 8px;
  border: 0;
  box-shadow: none;
}

.search-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 26px 28px;
  border-left: 4px solid var(--ci-accent, #d1ff00);
  border-radius: 3px;
  background: var(--ci-primary, #284f70);
  color: #ffffff;
  box-shadow: 0 10px 28px rgb(17 20 22 / 16%);
}

.search-empty__copy {
  min-width: 0;
  max-width: 42ch;
}

.search-empty__title {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.search-empty__text {
  margin: 0;
  color: #ffffff;
  font-size: 15px;
  line-height: 1.6;
}

.search-empty__smiley {
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  color: var(--ci-accent, #d1ff00);
}

@media (min-width: 768px) {
  .search-suggestions {
    left: 50%;
    width: 70vw;
    max-width: calc(100vw - 2rem);
    transform: translateX(-50%);
  }

  .search-suggestions--empty {
    width: min(640px, calc(100vw - 2rem));
  }
}

@media (max-width: 767px) {
  :global(.mobile-search) {
    width: 100%;
    padding: 72px 16px 0;
  }

  :global(.mobile-search form),
  :global(.mobile-search [data-testid='search-bar-input']) {
    width: 100%;
    min-width: 0;
  }

  :global(.mobile-search form input[data-testid='search-bar-input']) {
    min-width: 0 !important;
    width: 0;
    flex: 1;
  }

  :global(.mobile-search [data-testid='search-bar-input']) {
    height: auto;
    border: 1px solid #d8dde2;
    border-radius: 0;
    background: #ffffff;
    color: #071625;
    font-size: 16px;
  }

  :global(.mobile-search [data-testid='search-bar-input']::placeholder) {
    color: #66717c;
    opacity: 1;
  }

  :global(.mobile-search .search-suggestions) {
    position: static;
    max-height: calc(100vh - 160px);
    margin-top: 12px;
    padding: 16px;
    border: 0;
    box-shadow: none;
  }
}
@media (max-width: 767px) {
  :global(.mobile-search .search-suggestions--empty) {
    padding: 0;
    overflow: visible;
  }

  .search-empty {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px;
    align-items: center;
    gap: 12px 16px;
    padding: 22px 18px;
  }

  .search-empty__copy {
    display: contents;
  }

  .search-empty__title {
    grid-column: 1;
    grid-row: 1;
    margin: 0;
    font-size: 20px;
  }

  .search-empty__text {
    grid-column: 1 / -1;
    grid-row: 2;
    font-size: 14px;
    line-height: 1.55;
  }

  .search-empty__smiley {
    grid-column: 2;
    grid-row: 1;
    width: 56px;
    height: 56px;
    margin-top: 1px;
  }
}
</style>
