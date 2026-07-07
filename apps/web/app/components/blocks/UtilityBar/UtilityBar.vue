<template>
  <div
    class="nubuk-utility-shell"
    :class="{ 'nubuk-utility-shell--compact': isHeaderCompact }"
    :style="utilityBarStyle"
  >
    <div v-if="viewport.isGreaterOrEquals('md')" class="nubuk-service-bar">
      <div class="nubuk-service-bar__inner">
        <div v-for="item in serviceBarItems" :key="item" class="nubuk-service-bar__item">
          <SfIconCheck size="xs" aria-hidden="true" />
          <span>{{ item }}</span>
        </div>
        <div class="nubuk-service-bar__socials" aria-label="Social Media">
          <a class="nubuk-service-bar__social" href="https://www.facebook.com/nubukbikes" aria-label="Facebook">
            <FontAwesomeIcon :icon="['fab', 'facebook-f']" />
          </a>
          <a class="nubuk-service-bar__social" href="https://www.instagram.com/nubukbikes" aria-label="Instagram">
            <FontAwesomeIcon :icon="['fab', 'instagram']" />
          </a>
        </div>
      </div>
    </div>
    <header class="relative w-full md:sticky md:top-0 z-[1000]">
      <div
        v-if="viewport.isLessThan('md')"
        class="flex items-center w-full"
        :style="{ backgroundColor: headerBackgroundColor }"
        data-testid="navbar-top-mobile"
      >
        <div class="flex items-center flex-1 gap-2">
          <UiButton
            variant="tertiary"
            square
            :aria-label="t('common.navigation.openMenu')"
            class="hover:!bg-header-400"
            :style="{ color: iconColor }"
            @click="openMegaMenu"
          >
            <SfIconMenu aria-hidden="true" />
          </UiButton>
          <NuxtLink
            id="blockified-logo-mobile"
            data-testid="logo-link"
            :to="localePath(paths.home)"
            :aria-label="t('common.actions.goToHomepage')"
            class="focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm"
          >
            <UiLogo />
          </NuxtLink>
        </div>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="localeCodes.length > 1"
            variant="tertiary"
            class="relative hover:!bg-header-400 active:!bg-header-400 rounded-md"
            square
            data-testid="open-languageselect-button"
            :style="{ color: iconColor }"
            :aria-label="t('common.navigation.languageSelector')"
            :disabled="(showConfigurationDrawer && isEditing) || (showConfigurationDrawer && disableActions)"
            @click="toggleLanguageSelect()"
          >
            <SfIconLanguage />
          </UiButton>
          <UiButton
            variant="tertiary"
            class="relative hover:!bg-header-400 active:!bg-header-400 rounded-md"
            square
            :style="{ color: iconColor }"
            :aria-label="t('common.navigation.openSearchModal')"
            @click="searchModalOpen"
          >
            <SfIconSearch />
          </UiButton>
        </div>
      </div>

      <div
        v-else
        class="utility-bar__desktop-inner nubuk-utility-row flex items-center flex-nowrap w-full border-0 border-neutral-200"
        :class="{ 'utility-bar__desktop-inner--boxed': !isUtilityBarFullWidth }"
        :style="{ ...paddingStyles }"
        data-testid="navbar-top-desktop"
      >
        <UiButton
          v-if="viewport.isLessThan('lg')"
          variant="tertiary"
          square
          :aria-label="t('common.navigation.openMenu')"
          class="mr-2 hover:!bg-header-400"
          :style="{ color: iconColor }"
          @click="openMegaMenu"
        >
          <SfIconMenu aria-hidden="true" />
        </UiButton>

        <div
          v-if="isSectionVisible('logo')"
          class="nubuk-utility-row__logo flex items-center"
          :style="getSectionColumnStyle('logo')"
        >
          <NuxtLink
            id="blockified-logo"
            data-testid="logo-link"
            :to="localePath(paths.home)"
            :aria-label="t('common.actions.goToHomepage')"
            class="focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm"
          >
            <UiLogo />
          </NuxtLink>
        </div>

        <template v-if="isSectionVisible('search')">
          <div
            ref="iconSearchContainerRef"
            :style="getSectionColumnStyle('search')"
            :class="[
              isFullSearchMode || isIconSearchExpanded || isSearchClosing
                ? 'utility-bar__search-container--expanded'
                : 'flex-none w-10 shrink-0',
            ]"
          >
            <template v-if="isFullSearchMode">
              <UiSearch variant="header" />
            </template>

            <template v-else>
              <div class="relative">
                <Transition
                  mode="out-in"
                  enter-active-class="transition-opacity duration-120 ease-out"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-120 ease-out absolute inset-0"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                  @after-leave="handleSearchAfterLeave"
                >
                  <UiSearch
                    v-if="isIconSearchExpanded"
                    class="w-[100%]"
                    variant="header"
                    :style="{ transformOrigin: searchExpandOrigin }"
                    :close="collapseIconSearch"
                  />
                </Transition>
                <UiButton
                  v-if="showSearchIcon && !isIconSearchExpanded"
                  variant="tertiary"
                  square
                  class="hover:!bg-header-400 rounded-md"
                  :style="{ color: iconColor }"
                  :aria-label="t('common.actions.search')"
                  @click="expandIconSearch"
                >
                  <SfIconSearch />
                </UiButton>
              </div>
            </template>
          </div>
        </template>
        <nav
          v-if="isSectionVisible('actions')"
          :style="getSectionColumnStyle('actions')"
          class="nubuk-utility-actions flex flex-row flex-nowrap"
        >
          <template v-if="localeCodes.length > 1 && isActionVisible('language')">
            <UiButton
              v-if="!isLanguageSelectOpen"
              class="group relative hover:!bg-header-400 active:!bg-header-400 mr-1 -ml-0.5 rounded-md cursor-pointer"
              :aria-label="t('common.navigation.languageSelector')"
              variant="tertiary"
              :style="{ color: iconColor, order: getActionOrder('language') }"
              square
              data-testid="open-languageselect-button"
              :disabled="(showConfigurationDrawer && isEditing) || (showConfigurationDrawer && disableActions)"
              @click="toggleLanguageSelect()"
            >
              <template #prefix>
                <SfIconLanguage class="relative" />
              </template>
            </UiButton>
            <UiButton
              v-else
              class="group relative hover:!bg-header-400 active:bg-header-400 mr-1 -ml-0.5 rounded-md cursor-pointer"
              :aria-label="t('common.navigation.languageSelector')"
              :style="{ color: isActive ? iconColor : '', order: getActionOrder('language') }"
              variant="tertiary"
              square
              data-testid="open-languageselect-button"
            >
              <template #prefix>
                <SfIconLanguage class="relative" />
              </template>
            </UiButton>
          </template>
          <UiButton
            v-if="isActionVisible('wishlist')"
            class="group relative hover:!bg-header-400 active:bg-header-400 mr-1 -ml-0.5 rounded-md"
            :tag="NuxtLink"
            :to="localePath(paths.wishlist)"
            :style="{ color: iconColor, order: getActionOrder('wishlist') }"
            :aria-label="t('cart.numberInWishlist', { count: wishlistItemIds.length })"
            variant="tertiary"
            square
            data-testid="wishlist-page-navigation"
          >
            <template #prefix>
              <SfIconFavorite />
              <SfBadge
                :content="wishlistItemIds.length"
                :style="{
                  backgroundColor: iconColor,
                  outlineColor: headerBackgroundColor,
                  color: headerBackgroundColor,
                }"
                class="outline group-hover:outline-primary-800 group-active:outline-primary-700 flex justify-center items-center text-xs min-w-[16px] min-h-[16px]"
                data-testid="wishlist-badge"
                placement="top-right"
                :max="99"
              />
            </template>
          </UiButton>
          <UiButton
            v-if="isActionVisible('cart')"
            class="nubuk-action nubuk-action--cart group relative hover:!bg-header-400 active:!bg-header-400 rounded-none"
            :tag="NuxtLink"
            :style="{ order: getActionOrder('cart') }"
            :to="localePath(paths.cart)"
            :aria-label="t('cart.numberInCart', { count: cartItemsCount })"
            variant="tertiary"
          >
            <template #prefix>
              <SfIconShoppingCart />
            </template>
            <span class="nubuk-cart-total">{{ cartTotalFormatted }}</span>
          </UiButton>
          <SfDropdown
            v-if="isAuthorized && isActionVisible('account')"
            v-model="isAccountDropdownOpen"
            placement="bottom-end"
            class="z-50 nubuk-account-dropdown"
            :style="{ order: getActionOrder('account') }"
          >
            <template #trigger>
              <UiButton
                variant="tertiary"
                class="nubuk-action nubuk-action--account relative hover:bg-header-400 active:bg-header-400 rounded-none"
                :style="{ order: getActionOrder('account') }"
                :class="{ 'bg-primary-700': isAccountDropdownOpen }"
                data-testid="account-dropdown-button"
                @click="accountDropdownToggle()"
              >
                <template #prefix>
                  <SfIconPerson />
                </template>
                <span>{{ user?.firstName || 'Mein Konto' }}</span>
                <SfIconExpandMore class="nubuk-action__chevron" size="sm" aria-hidden="true" />
              </UiButton>
            </template>
            <ul class="rounded bg-white shadow-md border border-neutral-100 text-neutral-900 min-w-[152px] py-2">
              <li v-for="({ label, link }, labelIndex) in accountDropdown" :key="`label-${labelIndex}`">
                <template v-if="label === t('account.logout')">
                  <UiDivider class="my-2" />
                  <SfListItem
                    tag="button"
                    class="text-left"
                    data-testid="account-dropdown-logout-item"
                    @click="logOut()"
                  >
                    {{ label }}
                  </SfListItem>
                </template>
                <SfListItem
                  v-else
                  :tag="NuxtLink"
                  :to="link"
                  :class="{ 'bg-neutral-200': route.path === link }"
                  data-testid="account-dropdown-list-item"
                >
                  {{ label }}
                </SfListItem>
              </li>
            </ul>
          </SfDropdown>
          <UiButton
            v-else-if="!isAuthorized && isActionVisible('account')"
            :style="{ order: getActionOrder('account') }"
            class="nubuk-action nubuk-action--account group relative hover:!bg-header-400 active:!bg-header-400 rounded-none"
            variant="tertiary"
            :aria-label="t('authentication.login.openLoginForm')"
            @click="navigateToLogin"
          >
            <template #prefix>
              <SfIconPerson />
            </template>
            <span>Anmelden</span>
          </UiButton>
        </nav>
      </div>
    </header>
    <BlocksNavbarBottom
      v-if="viewport.isLessThan('md')"
      :background-color="headerBackgroundColor"
      :icon-color="iconColor"
      :action-order="content.actions.order"
      :action-visibility="content.actions.visibility"
    />
    <LanguageSelector />
    <UiModal
      v-if="viewport.isGreaterOrEquals('md') && isAuthenticationOpen"
      v-model="isAuthenticationOpen"
      tag="section"
      class="h-full md:w-[500px] md:h-fit m-0 p-0 overflow-y-auto z-[1101]"
      overlay-classes="z-[1100]"
    >
      <header>
        <UiButton
          :aria-label="t('common.navigation.closeDialog')"
          square
          variant="tertiary"
          class="absolute right-2 top-2"
          @click="closeAuthentication"
        >
          <SfIconClose />
        </UiButton>
      </header>

      <LoginComponent
        v-if="isLogin"
        :is-modal="true"
        @change-view="isLogin = false"
        @logged-in="navigateAfterAuth(true)"
      />
      <Register v-else :is-modal="true" @change-view="isLogin = true" @registered="closeAuthentication" />
    </UiModal>

    <NuxtLazyHydrate v-if="viewport.isLessThan('lg')" when-idle>
      <SfModal
        v-model="isSearchModalOpen"
        class="mobile-search-modal w-full h-full z-[5000]"
        tag="section"
        role="dialog"
        aria-labelledby="search-modal-title"
      >
        <header class="mb-4">
          <UiButton
            :aria-label="t('common.navigation.closeDialog')"
            square
            variant="tertiary"
            class="absolute right-4 top-2"
            @click="searchModalClose"
          >
            <SfIconClose class="text-neutral-500" />
          </UiButton>
          <h3 id="search-modal-title" class="absolute left-6 top-4 font-bold typography-headline-4 mb-4">
            {{ t('common.actions.search') }}
          </h3>
        </header>
        <UiSearch class="mobile-search" :close="searchModalClose" :autofocus="true" />
      </SfModal>
    </NuxtLazyHydrate>
  </div>
</template>

<script setup lang="ts">
import {
  SfBadge,
  SfDropdown,
  SfIconClose,
  SfIconLanguage,
  SfIconMenu,
  SfIconPerson,
  SfIconSearch,
  SfIconShoppingCart,
  SfListItem,
  SfModal,
  SfIconFavorite,
  SfIconCheck,
  SfIconExpandMore,
  useDisclosure,
} from '@storefront-ui/vue';
import { cartGetters } from '@plentymarkets/shop-api';
import { onClickOutside } from '@vueuse/core';
import LanguageSelector from '~/components/LanguageSelector/LanguageSelector.vue';

import type { UtilityBarProps } from './types';

interface Props extends Partial<UtilityBarProps> {
  enableActions?: boolean;
  root?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableActions: false,
  root: true,
});

const isLogin = ref(true);
const { data: cart } = useCart();
const { format } = usePriceFormatter();
const { wishlistItemIds } = useWishlist();
const cartItemsCount = ref(0);
const { open: openMegaMenu } = useMegaMenu();
const { data: categoryTree, getCategoryTree } = useCategoryTree();

const {
  content,
  sections,
  paddingStyles,
  isSectionVisible,
  getSectionFlexOrder,
  isActionVisible,
  getActionOrder,
  isFullSearchMode,
} = useUtilityBarConfiguration(props.meta?.uuid);

const iconColor = computed(() => content.value?.color?.iconColor || '');
const headerBackgroundColor = computed(() => content.value?.color?.backgroundColor || '');
const headerPaletteStyle = useGenerateTailwindPalette('header', headerBackgroundColor);
const logoHeight = computed(() => {
  const value = content.value?.layout?.logoHeight ?? 40;
  return Math.max(20, Math.min(120, value));
});
const searchWidth = computed(() => {
  const value = content.value?.layout?.searchWidth ?? 620;
  return Math.max(200, Math.min(1200, value));
});
const isUtilityBarFullWidth = computed(() => content.value?.layout?.fullWidth !== false);
const utilityBarStyle = computed(() => ({
  ...(unref(headerPaletteStyle) as Record<string, string>),
  '--utility-logo-height': `${logoHeight.value}px`,
  '--utility-search-width': `${searchWidth.value}px`,
}));
const serviceBarItems = ['30 Tage Rückgaberecht', 'Ladengeschäfte mit Werkstatt', 'Kauf auf Rechnung', 'Bike Leasing'];
const cartTotalFormatted = computed(() => format(cart.value ? cartGetters.getTotals(cart.value).total || 0 : 0));

const NuxtLink = resolveComponent('NuxtLink');
const { localeCodes } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { isOpen: isAccountDropdownOpen, toggle: accountDropdownToggle } = useDisclosure();
const { isOpen: isAuthenticationOpen, open: openAuthentication, close: closeAuthentication } = useDisclosure();
const { open: searchModalOpen, isOpen: isSearchModalOpen, close: searchModalClose } = useDisclosure();
const { toggle: toggleLanguageSelect, isOpen: isLanguageSelectOpen } = useLocalization();
const { user, isAuthorized, logout } = useCustomer();
const viewport = useViewport();
const runtimeConfig = useRuntimeConfig();
const showConfigurationDrawer = runtimeConfig.public.showConfigurationDrawer;
const { isEditing, disableActions } = useEditor();
const isActive = computed(() => isLanguageSelectOpen);
const isHeaderCompact = ref(false);

const getPageScrollTop = () =>
  Math.max(
    window.scrollY,
    document.scrollingElement?.scrollTop ?? 0,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );

const updateHeaderCompactState = (event?: Event) => {
  const target = event?.target;
  const targetScrollTop = target instanceof Element ? target.scrollTop : 0;

  isHeaderCompact.value = Math.max(getPageScrollTop(), targetScrollTop) > 0;
};

onMounted(() => {
  updateHeaderCompactState();
  window.addEventListener('scroll', updateHeaderCompactState, { passive: true });
  document.addEventListener('scroll', updateHeaderCompactState, { passive: true, capture: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateHeaderCompactState);
  document.removeEventListener('scroll', updateHeaderCompactState, { capture: true });
});

onNuxtReady(async () => {
  if (categoryTree.value.length === 0) {
    await getCategoryTree();
  }

  cartItemsCount.value = cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0;
});

const isIconSearchExpanded = ref(false);
const showSearchIcon = ref(true);
const isSearchClosing = ref(false);
const iconSearchContainerRef = ref<HTMLElement | null>(null);

const visibleSectionsCount = computed(() => sections.value.filter((section) => section.visible).length);

const SECTION_GAP = '16px';

const getSectionColumnStyle = (sectionId: string) => {
  const order = getSectionFlexOrder(sectionId);
  const total = visibleSectionsCount.value;
  const isFirst = order === 0;
  const isLast = total > 1 && order === total - 1;
  const isMiddle = total > 2 && !isFirst && !isLast;

  const isSearchActive =
    sectionId === 'search' && (isFullSearchMode.value || isIconSearchExpanded.value || isSearchClosing.value);

  const middleMargin = isMiddle ? { marginLeft: SECTION_GAP, marginRight: SECTION_GAP } : {};

  if (isFirst) {
    return { order, flex: '1', display: 'flex', ...middleMargin };
  }
  if (isLast) {
    return { order, flex: '1', display: 'flex', justifyContent: 'flex-end', ...middleMargin };
  }

  if (isSearchActive) {
    return { order, flex: '5', ...middleMargin };
  }
  return { order, ...middleMargin };
};

const searchExpandOrigin = computed(() => {
  const searchOrder = getSectionFlexOrder('search');
  if (searchOrder === 0) return 'left center';
  return 'center center';
});

const expandIconSearch = () => {
  showSearchIcon.value = false;
  isIconSearchExpanded.value = true;
};

const collapseIconSearch = () => {
  isSearchClosing.value = true;
  isIconSearchExpanded.value = false;
  return true;
};

const handleSearchAfterLeave = () => {
  showSearchIcon.value = true;
  isSearchClosing.value = false;
};

onClickOutside(iconSearchContainerRef, () => {
  if (isIconSearchExpanded.value) {
    collapseIconSearch();
  }
});

const navigateAfterAuth = (reload: boolean) => {
  if (reload) {
    window.location.reload();
  } else {
    closeAuthentication();
  }
};

watch(
  () => cart.value?.items,
  (cartItems) => {
    cartItemsCount.value = cartItems?.reduce((price, { quantity }) => price + quantity, 0) ?? 0;
  },
);

watch(
  () => isAuthenticationOpen.value,
  () => (isLogin.value = true),
);

const logOut = () => handleLogout({ logout, toggle: accountDropdownToggle });

const accountDropdown = computed(() => [
  {
    label: t('account.heading'),
    link: localePath(paths.account),
  },
  {
    label: t('account.ordersAndReturns.section.myOrders'),
    link: localePath(paths.accountMyOrders),
  },
  {
    label: t('account.ordersAndReturns.section.returns'),
    link: localePath(paths.accountReturns),
  },
  {
    label: t('account.logout'),
  },
]);
const navigateToLogin = () => {
  if (route.path !== localePath(paths.authLogin)) {
    openAuthentication();
  }
};
</script>
<style scoped>
:deep(input[data-testid='search-bar-input']) {
  min-width: 172px;
  background: #e9e9ea !important;
}

.nubuk-utility-shell {
  background: #ffffff;
}

.nubuk-service-bar {
  background: var(--ci-primary);
  border-top: 1px solid var(--ci-primary-dark);
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  max-height: 29px;
  overflow: hidden;
  transition:
    max-height 180ms ease,
    opacity 180ms ease,
    visibility 180ms ease;
}

.nubuk-service-bar__inner {
  display: grid;
  grid-template-columns: repeat(4, max-content) 72px;
  align-items: center;
  justify-content: center;
  gap: clamp(36px, 6.2vw, 96px);
  min-height: 29px;
  padding: 0 24px;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.nubuk-service-bar__item,
.nubuk-service-bar__socials,
.nubuk-service-bar__social {
  display: inline-flex;
  align-items: center;
}

.nubuk-service-bar__item {
  gap: 4px;
  white-space: nowrap;
}

.nubuk-service-bar__socials {
  gap: 18px;
}

.nubuk-service-bar__social {
  color: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
}

.nubuk-utility-row {
  min-height: 103px;
  background: #ffffff !important;
  padding: 38px 0 17px !important;
  transition:
    min-height 180ms ease,
    padding 180ms ease,
    box-shadow 180ms ease;
}

.nubuk-utility-row__logo {
  min-width: 240px;
}

.nubuk-utility-actions {
  align-items: center;
  gap: 19px;
  color: #2d5d83;
}

.nubuk-action {
  min-height: 30px;
  gap: 8px;
  padding: 0 !important;
  color: #2d5d83 !important;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.nubuk-action:hover,
.nubuk-action:active {
  background: transparent !important;
  color: #1f496a !important;
}

.nubuk-action--account {
  order: 1 !important;
  padding-right: 20px !important;
  border-right: 1px solid #2f2f2f;
}

.nubuk-action--cart {
  order: 2 !important;
  color: var(--var-primary-grey) !important;
}

.nubuk-action :deep(svg) {
  width: 23px;
  height: 23px;
  color: #2d5d83;
}

.nubuk-action :deep(.nubuk-action__chevron) {
  width: 16px;
  height: 16px;
}

.nubuk-action--cart :deep(svg) {
  color: #111111;
}

.nubuk-cart-total {
  min-width: 56px;
  color: var(--var-primary-grey);
  text-align: right;
}

.nubuk-account-dropdown {
  display: flex;
  order: 1 !important;
}

.utility-bar__desktop-inner--boxed {
  max-width: 1540px;
  margin: 0 auto;
}

.utility-bar__search-container--expanded {
  width: 100%;
  max-width: min(var(--utility-search-width), 471px);
}

#blockified-logo :deep(img) {
  max-width: inherit !important;
  height: var(--utility-logo-height);
  width: auto;
  transition:
    height 180ms ease,
    max-height 180ms ease,
    width 180ms ease;
}

#blockified-logo-mobile :deep(img) {
  height: var(--utility-logo-height);
  width: auto;
}

.nubuk-utility-shell--compact .nubuk-service-bar {
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.nubuk-utility-shell--compact .nubuk-service-bar__inner {
  opacity: 0;
  transform: translateY(-4px);
}

.nubuk-utility-shell--compact .nubuk-utility-row {
  min-height: 58px;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  box-shadow: 0 2px 10px rgb(0 0 0 / 8%);
}

.nubuk-utility-shell--compact .utility-bar__desktop-inner--boxed {
  padding-right: 24px !important;
  padding-left: 24px !important;
}

.nubuk-utility-shell--compact #blockified-logo {
  display: flex;
  align-items: center;
  height: 58px;
}

.nubuk-utility-shell--compact #blockified-logo :deep(picture) {
  display: flex;
  align-items: center;
  height: 100%;
}

.nubuk-utility-shell--compact #blockified-logo :deep(img) {
  width: auto !important;
  height: 55px !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: contain;
}

@media (max-width: 1199px) {
  .nubuk-service-bar__inner {
    gap: 24px;
  }

  .nubuk-utility-row {
    padding-left: 48px !important;
    padding-right: 48px !important;
  }

  .nubuk-utility-row__logo {
    min-width: 200px;
  }
}
</style>
