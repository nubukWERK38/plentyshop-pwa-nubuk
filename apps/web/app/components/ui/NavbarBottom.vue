<template>
  <nav class="w-full fixed bottom-0 left-0 flex flex-row items-stretch md:hidden z-10" data-testid="navbar-bottom">
    <UiButton
      v-for="{ id, label, icon, link } in items"
      :key="id"
      variant="tertiary"
      :class="[
        '!p-1 !pt-3 flex flex-col h-full w-full rounded-none bg-primary-500 text-white hover:text-white hover:bg-primary-800 active:text-white active:bg-primary-700 !text-xs !font-base',
        { 'text-white bg-primary-700': route.path === link },
      ]"
      size="sm"
      :tag="link ? NuxtLink : undefined"
      :to="link || undefined"
      @click="id === 'products' && openProductsMenu()"
    >
      <template #prefix>
        <div class="relative">
          <component :is="icon" />
          <SfBadge
            v-if="label === t('common.labels.cart')"
            :content="cartItemsCount"
            :max="99"
            class="translate-x-[5px] translate-y-[-3px] outline outline-primary-500 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-700 flex justify-center items-center text-xs min-w-[16px] min-h-[16px]"
          />
        </div>
      </template>
      {{ label }}
    </UiButton>
  </nav>
</template>

<script setup lang="ts">
import { SfBadge, SfIconShoppingCart, SfIconHome, SfIconMenu, SfIconPerson } from '@storefront-ui/vue';
import { useCustomer } from '~/composables/useCustomer';

const localePath = useLocalePath();
const route = useRoute();
const { data: cart } = useCart();
const { isAuthorized } = useCustomer();
const { activeNode, open } = useMegaMenu();
const { setDrawerOpen } = useDrawerState();

const items = computed(() => [
  {
    id: 'home',
    label: t('common.labels.home'),
    icon: SfIconHome,
    link: localePath(paths.home),
  },
  {
    id: 'products',
    label: t('common.labels.products'),
    icon: SfIconMenu,
    link: '',
  },
  {
    id: 'cart',
    label: t('common.labels.cart'),
    icon: SfIconShoppingCart,
    link: localePath(paths.cart),
  },
  {
    id: 'account',
    label: isAuthorized.value ? t('account.navBottomHeadingAccount') : t('account.navBottomHeadingLogin'),
    icon: SfIconPerson,
    link: isAuthorized.value ? localePath(paths.account) : localePath(paths.authLogin),
  },
]);

const openProductsMenu = () => {
  activeNode.value = [];
  open();
  setDrawerOpen(true);
};

const cartItemsCount = computed(() => cart.value?.items?.reduce((price, { quantity }) => price + quantity, 0) ?? 0);
const NuxtLink = resolveComponent('NuxtLink');
</script>
