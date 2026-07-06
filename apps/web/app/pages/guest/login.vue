<template>
  <NuxtLayout
    name="checkout"
    :back-label-desktop="t('common.actions.back')"
    :back-label-mobile="t('common.actions.back')"
    :heading="t('common.labels.checkout')"
  >
    <div class="w-full px-2 md:px-6">
      <div
        class="mx-auto grid w-full max-w-[1280px] gap-6"
        :class="loadedConfig && isAvailable('guestLoginPage').value ? 'lg:grid-cols-3' : 'lg:grid-cols-2'"
      >
        <section class="flex flex-col rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 class="font-bold text-lg">{{ t('checkout.guestCheckout') }}</h2>

          <UiButton
            data-testid="guest-checkout-button"
            :tag="NuxtLink"
            :to="localePath(paths.checkout)"
            class="mt-6 w-full"
          >
            {{ t('checkout.continueAsGuest') }}
          </UiButton>
        </section>

        <section
          v-if="loadedConfig && isAvailable('guestLoginPage').value"
          class="flex flex-col rounded-md border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <h2 class="font-bold text-lg">{{ t('checkout.expressCheckout') }}</h2>

          <PayPalExpressButton class="mt-6" location="guestLoginPage" type="CartPreview" />
          <PayPalPayLaterBanner
            placement="cart"
            location="guestLoginPage"
            :amount="cartGetters.getTotal(cartGetters.getTotals(cart))"
          />
        </section>

        <form class="rounded-md border border-neutral-200 bg-white p-5 shadow-sm" @submit.prevent="loginUser">
          <h2 class="font-bold text-lg">{{ t('checkout.loginFastCheckout') }}</h2>

          <label>
            <UiFormLabel class="w-full mt-4">{{ t('form.emailLabel') }} {{ t('form.required') }}</UiFormLabel>
            <SfInput v-model="email" class="w-full" name="email" type="email" autocomplete="email" required />
          </label>

          <label>
            <UiFormLabel class="mt-6">{{ t('form.passwordLabel') }} {{ t('form.required') }}</UiFormLabel>
            <UiFormPasswordInput v-model="password" name="password" autocomplete="current-password" required />
          </label>

          <div class="text-end mt-4">
            <SfLink variant="primary" class="underline cursor-pointer" @click="toggleForgotPasswordModal">
              {{ t('authentication.login.forgotPasswordLabel') }}
            </SfLink>
          </div>

          <UiButton :disabled="loading || loginSubmit" type="submit" class="mt-8 w-full">
            <SfLoaderCircular v-if="loading || loginSubmit" class="flex justify-center items-center" size="base" />
            <template v-else>{{ t('authentication.login.loginAndContinue') }}</template>
          </UiButton>

          <div class="text-center mt-6">
            <h3 class="font-bold text-lg mb-6">{{ t('authentication.login.createAccount') }}</h3>
            <p>{{ t('authentication.login.createAccountLater') }}!</p>
          </div>
        </form>
      </div>

      <UiModal
        v-if="isAuthenticationOpen"
        v-model="isAuthenticationOpen"
        tag="section"
        class="h-full w-full overflow-auto md:w-[500px] md:h-fit"
      >
        <header>
          <UiButton
            :aria-label="t('common.navigation.closeDialog')"
            square
            variant="tertiary"
            class="absolute right-2 top-2"
            @click="toggleForgotPasswordModal"
          >
            <SfIconClose />
          </UiButton>
          <ForgotPasswordComponent :is-forgot-password-only="true" />
        </header>
      </UiModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { SfIconClose, SfInput, SfLink, SfLoaderCircular } from '@storefront-ui/vue';
import { paths } from '~/utils/paths';
import { cartGetters } from '@plentymarkets/shop-api';
import type { Locale } from '#i18n';

defineI18nRoute({
  locales: process.env.LANGUAGELIST?.split(',') as Locale[],
});

definePageMeta({
  pageType: 'static',
  middleware: ['guest-guard'],
});

const isAuthenticationOpen = ref(false);
const { login, loading } = useCustomer();
const { send } = useNotification();
const { data: cart } = useCart();
const { loadConfig, loadedConfig, isAvailable } = usePayPal();
const localePath = useLocalePath();
const NuxtLink = resolveComponent('NuxtLink');

onBeforeMount(async () => await loadConfig());

const email = ref('');
const password = ref('');
const loginSubmit = ref(false);

const toggleForgotPasswordModal = () => {
  isAuthenticationOpen.value = !isAuthenticationOpen.value;
};

const loginUser = async () => {
  loginSubmit.value = true;
  await login(email.value, password.value).then((success: boolean) => {
    if (!success) {
      loginSubmit.value = false;
      return;
    }

    send({ message: t('authentication.login.success'), type: 'positive' });
    navigateTo(localePath(paths.checkout));
  });
};
</script>
