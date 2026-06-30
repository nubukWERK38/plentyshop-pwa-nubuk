<template>
  <div :style="inlineStyle" data-testid="product-question-block">
    <div v-if="displayAsCollapsable">
      <UiAccordionItem
        v-model="isOpen"
        summary-class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3 flex justify-between items-center select-none"
        data-testid="product-question"
      >
        <template #summary>
          <h2 v-if="content.text.title" class="font-bold text-lg leading-6 md:text-2xl">
            {{ content.text.title }}
          </h2>
        </template>
        <div class="product-question">
          <p class="mb-4 text-neutral-700">{{ content.text.intro }}</p>
          <div
            v-if="!isConfigured"
            class="mb-4 flex items-start rounded-md bg-warning-100 px-4 py-3 text-sm ring-1 ring-warning-200"
          >
            <SfIconWarning class="mr-2 mt-0.5 shrink-0 text-warning-700" />
            <div>Kontakt-Mail und Cloudflare Turnstile sind noch nicht konfiguriert.</div>
          </div>
          <form v-else class="grid gap-4" novalidate @submit.prevent="onSubmit">
            <label>
              <UiFormLabel class="mb-1">E-Mail Adresse: *</UiFormLabel>
              <SfInput
                v-bind="emailAttributes"
                v-model="email"
                name="email"
                type="email"
                :invalid="Boolean(errors.email)"
                autocomplete="email"
              />
              <ErrorMessage as="div" name="email" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </label>
            <label>
              <UiFormLabel class="mb-1">Vorname:</UiFormLabel>
              <SfInput
                v-bind="firstNameAttributes"
                v-model="firstName"
                name="firstName"
                type="text"
                :invalid="Boolean(errors.firstName)"
                autocomplete="given-name"
              />
            </label>
            <label>
              <UiFormLabel class="mb-1">Nachname:</UiFormLabel>
              <SfInput
                v-bind="lastNameAttributes"
                v-model="lastName"
                name="lastName"
                type="text"
                :invalid="Boolean(errors.lastName)"
                autocomplete="family-name"
              />
            </label>
            <label>
              <UiFormLabel class="mb-1">Telefon:</UiFormLabel>
              <SfInput
                v-bind="phoneAttributes"
                v-model="phone"
                name="phone"
                type="tel"
                :invalid="Boolean(errors.phone)"
                autocomplete="tel"
              />
            </label>
            <label class="flex flex-col">
              <UiFormLabel class="mb-1">Frage zum Artikel: *</UiFormLabel>
              <SfTextarea
                v-bind="questionAttributes"
                v-model="question"
                name="question"
                :invalid="Boolean(errors.question)"
                class="min-h-[120px] w-full"
              />
              <ErrorMessage as="div" name="question" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </label>
            <div>
              <div class="flex items-start">
                <SfCheckbox
                  id="product-question-privacy"
                  v-bind="privacyPolicyAttributes"
                  v-model="privacyPolicy"
                  :invalid="Boolean(errors.privacyPolicy)"
                  value="value"
                  class="peer mt-1"
                />
                <label
                  class="ml-3 text-base text-neutral-900 cursor-pointer peer-disabled:text-disabled-900 select-none"
                  for="product-question-privacy"
                >
                  Hiermit bestaetige ich, dass ich die
                  <SfLink :href="localePath(paths.privacyPolicy)" target="_blank">Datenschutzerklaerung</SfLink>
                  gelesen habe. *
                </label>
              </div>
              <ErrorMessage as="div" name="privacyPolicy" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </div>
            <p class="text-sm text-neutral-500">* Pflichtfelder</p>
            <NuxtTurnstile
              v-if="turnstileSiteKey.length > 0 && turnstileLoad"
              v-bind="turnstileAttributes"
              ref="turnstileElement"
              v-model="turnstile"
              :site-key="turnstileSiteKey"
              :options="{ theme: 'light' }"
            />
            <ErrorMessage as="div" name="turnstile" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            <div class="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
              <UiButton type="button" variant="secondary" :disabled="isContactLoading" @click="clearInputs"
                >Zuruecksetzen</UiButton
              >
              <UiButton type="submit" class="min-w-[140px]" :disabled="isContactLoading">
                <SfLoaderCircular v-if="isContactLoading" class="flex items-center justify-center" size="sm" />
                <span v-else>Absenden</span>
              </UiButton>
            </div>
          </form>
        </div>
      </UiAccordionItem>
      <UiDivider v-if="isOpen" class="mb-2 mt-2" />
    </div>
    <div v-else class="product-question">
      <h2 v-if="content.text.title" class="mb-4 font-bold text-lg leading-6 md:text-2xl">
        {{ content.text.title }}
      </h2>
      <p class="mb-4 text-neutral-700">{{ content.text.intro }}</p>
      <div
        v-if="!isConfigured"
        class="mb-4 flex items-start rounded-md bg-warning-100 px-4 py-3 text-sm ring-1 ring-warning-200"
      >
        <SfIconWarning class="mr-2 mt-0.5 shrink-0 text-warning-700" />
        <div>Kontakt-Mail und Cloudflare Turnstile sind noch nicht konfiguriert.</div>
      </div>
      <form v-else class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <label>
          <UiFormLabel class="mb-1">E-Mail Adresse: *</UiFormLabel>
          <SfInput
            v-bind="emailAttributes"
            v-model="email"
            name="email"
            type="email"
            :invalid="Boolean(errors.email)"
            autocomplete="email"
          />
          <ErrorMessage as="div" name="email" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </label>
        <label>
          <UiFormLabel class="mb-1">Vorname:</UiFormLabel>
          <SfInput
            v-bind="firstNameAttributes"
            v-model="firstName"
            name="firstName"
            type="text"
            :invalid="Boolean(errors.firstName)"
            autocomplete="given-name"
          />
        </label>
        <label>
          <UiFormLabel class="mb-1">Nachname:</UiFormLabel>
          <SfInput
            v-bind="lastNameAttributes"
            v-model="lastName"
            name="lastName"
            type="text"
            :invalid="Boolean(errors.lastName)"
            autocomplete="family-name"
          />
        </label>
        <label>
          <UiFormLabel class="mb-1">Telefon:</UiFormLabel>
          <SfInput
            v-bind="phoneAttributes"
            v-model="phone"
            name="phone"
            type="tel"
            :invalid="Boolean(errors.phone)"
            autocomplete="tel"
          />
        </label>
        <label class="flex flex-col">
          <UiFormLabel class="mb-1">Frage zum Artikel: *</UiFormLabel>
          <SfTextarea
            v-bind="questionAttributes"
            v-model="question"
            name="question"
            :invalid="Boolean(errors.question)"
            class="min-h-[120px] w-full"
          />
          <ErrorMessage as="div" name="question" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </label>
        <div>
          <div class="flex items-start">
            <SfCheckbox
              id="product-question-privacy"
              v-bind="privacyPolicyAttributes"
              v-model="privacyPolicy"
              :invalid="Boolean(errors.privacyPolicy)"
              value="value"
              class="peer mt-1"
            />
            <label
              class="ml-3 text-base text-neutral-900 cursor-pointer peer-disabled:text-disabled-900 select-none"
              for="product-question-privacy"
            >
              Hiermit bestaetige ich, dass ich die
              <SfLink :href="localePath(paths.privacyPolicy)" target="_blank">Datenschutzerklaerung</SfLink>
              gelesen habe. *
            </label>
          </div>
          <ErrorMessage as="div" name="privacyPolicy" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </div>
        <p class="text-sm text-neutral-500">* Pflichtfelder</p>
        <NuxtTurnstile
          v-if="turnstileSiteKey.length > 0 && turnstileLoad"
          v-bind="turnstileAttributes"
          ref="turnstileElement"
          v-model="turnstile"
          :site-key="turnstileSiteKey"
          :options="{ theme: 'light' }"
        />
        <ErrorMessage as="div" name="turnstile" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        <div class="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <UiButton type="button" variant="secondary" :disabled="isContactLoading" @click="clearInputs"
            >Zuruecksetzen</UiButton
          >
          <UiButton type="submit" class="min-w-[140px]" :disabled="isContactLoading">
            <SfLoaderCircular v-if="isContactLoading" class="flex items-center justify-center" size="sm" />
            <span v-else>Absenden</span>
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomerContactEmailParams } from '@plentymarkets/shop-api';
import { productGetters, userGetters } from '@plentymarkets/shop-api';
import { SfCheckbox, SfIconWarning, SfInput, SfLink, SfLoaderCircular, SfTextarea } from '@storefront-ui/vue';
import { ErrorMessage, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { boolean, object, string } from 'yup';
import type { ProductQuestionProps } from './types';
import { paths } from '~/utils/paths';

const props = defineProps<ProductQuestionProps>();

const { currentProduct } = useProducts();
const { loading: isContactLoading, doCustomerContactMail } = useCustomerContact();
const { send } = useNotification();
const localePath = useLocalePath();
const { getSetting } = useSiteSettings('cloudflareTurnstileApiSiteKey');
const { getSetting: getContactShopEmail } = useSiteSettings('contactShopEmail');

const content = computed(() => ({
  text: {
    title: props.content?.text?.title ?? 'Noch Fragen?',
    intro:
      props.content?.text?.intro ??
      'Wenn Du noch weitere Fragen zu diesem Artikel hast, kannst Du uns gerne ueber das folgende Formular benachrichtigen.',
    successText:
      props.content?.text?.successText ?? 'Vielen Dank für Deine Anfrage. Wir melden uns schnellst möglich bei Dir. ',
  },
  layout: {
    displayAsCollapsable: props.content?.layout?.displayAsCollapsable ?? false,
    initiallyCollapsed: props.content?.layout?.initiallyCollapsed ?? false,
    paddingTop: props.content?.layout?.paddingTop ?? 0,
    paddingBottom: props.content?.layout?.paddingBottom ?? 0,
    paddingLeft: props.content?.layout?.paddingLeft ?? 0,
    paddingRight: props.content?.layout?.paddingRight ?? 0,
  },
}));

const isOpen = ref(!content.value.layout.initiallyCollapsed);
const displayAsCollapsable = computed(() => content.value.layout.displayAsCollapsable);
const contactShopEmail = getContactShopEmail() ?? '';
const turnstileSiteKey = getSetting() ?? '';
const isConfigured = computed(() => contactShopEmail.length > 0 && turnstileSiteKey.length > 0);
const turnstileElement = ref();
const turnstileLoad = ref(false);

const validationSchema = toTypedSchema(
  object({
    email: string()
      .trim()
      .required('Bitte gib Deine E-Mail-Adresse ein.')
      .test('is-valid-email', 'Bitte gib eine gueltige E-Mail-Adresse ein.', (mail: string) =>
        userGetters.isValidEmailAddress(mail),
      )
      .default(''),
    firstName: string().trim().notRequired().default(''),
    lastName: string().trim().notRequired().default(''),
    phone: string().trim().notRequired().default(''),
    question: string()
      .required('Bitte gib Deine Frage ein.')
      .test('min-clean-length', 'Bitte gib mindestens 3 Zeichen ein.', (val: string | undefined) => {
        if (!val) return false;
        return val.replace(/\n/g, '').trim().length >= 3;
      })
      .default(''),
    privacyPolicy: boolean().oneOf([true], 'Bitte bestaetige die Datenschutzerklaerung.').default(false),
    turnstile:
      turnstileSiteKey.length > 0
        ? string().required('Bitte bestaetige den Spamschutz.').default('')
        : string().optional().default(''),
  }),
);

const { errors, meta, defineField, handleSubmit, resetForm } = useForm({
  validationSchema,
});

const [rawEmail, emailAttributes] = defineField('email');
const email = rawEmail as Ref<string>;
const [rawFirstName, firstNameAttributes] = defineField('firstName');
const firstName = rawFirstName as Ref<string>;
const [rawLastName, lastNameAttributes] = defineField('lastName');
const lastName = rawLastName as Ref<string>;
const [rawPhone, phoneAttributes] = defineField('phone');
const phone = rawPhone as Ref<string>;
const [rawQuestion, questionAttributes] = defineField('question');
const question = rawQuestion as Ref<string>;
const [rawPrivacyPolicy, privacyPolicyAttributes] = defineField('privacyPolicy');
const privacyPolicy = rawPrivacyPolicy as Ref<boolean>;
const [rawTurnstile, turnstileAttributes] = defineField('turnstile');
const turnstile = rawTurnstile as Ref<string>;

const productName = computed(() => productGetters.getName(currentProduct.value));
const itemId = computed(() => productGetters.getItemId(currentProduct.value));
const variationId = computed(() => productGetters.getVariationId(currentProduct.value));
const variationNumber = computed(() => productGetters.getVariationNumber(currentProduct.value));
const productReference = computed(() => variationId.value || itemId.value || '');

const inlineStyle = computed(() => {
  const layout = content.value.layout;
  return {
    paddingTop: layout.paddingTop ? `${layout.paddingTop}px` : 0,
    paddingBottom: layout.paddingBottom ? `${layout.paddingBottom}px` : 0,
    paddingLeft: layout.paddingLeft ? `${layout.paddingLeft}px` : 0,
    paddingRight: layout.paddingRight ? `${layout.paddingRight}px` : 0,
  };
});

const buildMessage = () => {
  const productUrl = import.meta.client ? window.location.href : '';
  const lines = [
    `Produkt: ${productName.value}`,
    `Artikel-ID: ${itemId.value || '-'}`,
    `Variations-ID: ${variationId.value || '-'}`,
    `Variantennummer: ${variationNumber.value || '-'}`,
    `Produkt-URL: ${productUrl || '-'}`,
    '',
    `Vorname: ${firstName.value || '-'}`,
    `Nachname: ${lastName.value || '-'}`,
    `Telefon: ${phone.value || '-'}`,
    `E-Mail: ${email.value || '-'}`,
    '',
    'Frage:',
    question.value || '',
  ];

  return lines.join('\n');
};

const clearInputs = () => {
  resetForm();
  turnstileElement.value?.reset();
};

const submitForm = async () => {
  if (!meta.value.valid || !turnstile.value || !isConfigured.value) return;

  const params: CustomerContactEmailParams = {
    subject: `Frage zum Artikel: ${productName.value} / ${productReference.value}`,
    email: email.value || '',
    message: buildMessage(),
    'cf-turnstile-response': turnstile.value,
  };

  const name = [firstName.value, lastName.value].filter(Boolean).join(' ').trim();
  if (name) params.name = name;

  if (await doCustomerContactMail(params)) {
    send({ type: 'positive', message: content.value.text.successText });
    clearInputs();
  }

  turnstile.value = '';
  turnstileElement.value?.reset();
};

const onSubmit = handleSubmit(() => submitForm());

if (turnstileSiteKey.length > 0) {
  const turnstileWatcher = watch([email, firstName, lastName, phone, question], (data) => {
    if (data.some((field) => field && String(field).length > 0)) {
      turnstileLoad.value = true;
      turnstileWatcher();
    }
  });
}

const { registerBlockVisibility } = useBlocksVisibility();
registerBlockVisibility(props.meta.uuid, true);
</script>
