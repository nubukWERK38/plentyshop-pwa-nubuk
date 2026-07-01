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
          <form v-else class="product-question__form" novalidate @submit.prevent="onSubmit">
            <label class="product-question__field product-question__field--half">
              <UiFormLabel class="sr-only">E-Mail Adresse: *</UiFormLabel>
              <input
                v-bind="emailAttributes"
                v-model="email"
                name="email"
                type="email"
                placeholder="E-Mail Adresse: *"
                autocomplete="email"
                class="product-question__control"
                :class="{ 'product-question__control--invalid': Boolean(errors.email) }"
              />
              <ErrorMessage as="div" name="email" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </label>
            <label class="product-question__field product-question__field--half">
              <UiFormLabel class="sr-only">Vorname:</UiFormLabel>
              <input
                v-bind="firstNameAttributes"
                v-model="firstName"
                name="firstName"
                type="text"
                placeholder="Vorname:"
                autocomplete="given-name"
                class="product-question__control"
              />
            </label>
            <label class="product-question__field product-question__field--half">
              <UiFormLabel class="sr-only">Nachname:</UiFormLabel>
              <input
                v-bind="lastNameAttributes"
                v-model="lastName"
                name="lastName"
                type="text"
                placeholder="Nachname:"
                autocomplete="family-name"
                class="product-question__control"
              />
            </label>
            <label class="product-question__field product-question__field--half">
              <UiFormLabel class="sr-only">Telefon:</UiFormLabel>
              <input
                v-bind="phoneAttributes"
                v-model="phone"
                name="phone"
                type="tel"
                placeholder="Telefon:"
                autocomplete="tel"
                class="product-question__control"
              />
            </label>
            <label class="product-question__field product-question__field--full">
              <UiFormLabel class="sr-only">Frage zum Artikel: *</UiFormLabel>
              <textarea
                v-bind="questionAttributes"
                v-model="question"
                name="question"
                placeholder="Frage zum Artikel: *"
                class="product-question__control product-question__textarea"
                :class="{ 'product-question__control--invalid': Boolean(errors.question) }"
              />
              <ErrorMessage as="div" name="question" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </label>
            <div class="product-question__privacy">
              <div class="product-question__privacy-row">
                <input
                  id="product-question-privacy"
                  v-bind="privacyPolicyAttributes"
                  v-model="privacyPolicy"
                  type="checkbox"
                  class="product-question__checkbox"
                />
                <label class="product-question__privacy-label" for="product-question-privacy">
                  Hiermit bestätige ich, dass ich die
                  <SfLink :href="localePath(paths.privacyPolicy)" target="_blank">Datenschutzerklärung</SfLink>
                  gelesen habe. *
                </label>
              </div>
              <ErrorMessage as="div" name="privacyPolicy" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            </div>
            <p class="product-question__required">* Pflichtfelder</p>
            <NuxtTurnstile
              v-if="turnstileSiteKey.length > 0 && turnstileLoad"
              v-bind="turnstileAttributes"
              ref="turnstileElement"
              v-model="turnstile"
              :site-key="turnstileSiteKey"
              :options="{ theme: 'light' }"
            />
            <ErrorMessage as="div" name="turnstile" class="pt-[0.2rem] text-left text-sm text-negative-700" />
            <div class="product-question__actions">
              <button type="submit" class="product-question__submit" :disabled="isContactLoading">
                <SfLoaderCircular v-if="isContactLoading" class="flex items-center justify-center" size="sm" />
                <span v-else>Absenden</span>
              </button>
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
      <form v-else class="product-question__form" novalidate @submit.prevent="onSubmit">
        <label class="product-question__field product-question__field--half">
          <UiFormLabel class="sr-only">E-Mail Adresse: *</UiFormLabel>
          <input
            v-bind="emailAttributes"
            v-model="email"
            name="email"
            type="email"
            placeholder="E-Mail Adresse: *"
            autocomplete="email"
            class="product-question__control"
            :class="{ 'product-question__control--invalid': Boolean(errors.email) }"
          />
          <ErrorMessage as="div" name="email" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </label>
        <label class="product-question__field product-question__field--half">
          <UiFormLabel class="sr-only">Vorname:</UiFormLabel>
          <input
            v-bind="firstNameAttributes"
            v-model="firstName"
            name="firstName"
            type="text"
            placeholder="Vorname:"
            autocomplete="given-name"
            class="product-question__control"
          />
        </label>
        <label class="product-question__field product-question__field--half">
          <UiFormLabel class="sr-only">Nachname:</UiFormLabel>
          <input
            v-bind="lastNameAttributes"
            v-model="lastName"
            name="lastName"
            type="text"
            placeholder="Nachname:"
            autocomplete="family-name"
            class="product-question__control"
          />
        </label>
        <label class="product-question__field product-question__field--half">
          <UiFormLabel class="sr-only">Telefon:</UiFormLabel>
          <input
            v-bind="phoneAttributes"
            v-model="phone"
            name="phone"
            type="tel"
            placeholder="Telefon:"
            autocomplete="tel"
            class="product-question__control"
          />
        </label>
        <label class="product-question__field product-question__field--full">
          <UiFormLabel class="sr-only">Frage zum Artikel: *</UiFormLabel>
          <textarea
            v-bind="questionAttributes"
            v-model="question"
            name="question"
            placeholder="Frage zum Artikel: *"
            class="product-question__control product-question__textarea"
            :class="{ 'product-question__control--invalid': Boolean(errors.question) }"
          />
          <ErrorMessage as="div" name="question" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </label>
        <div class="product-question__privacy">
          <div class="product-question__privacy-row">
            <input
              id="product-question-privacy"
              v-bind="privacyPolicyAttributes"
              v-model="privacyPolicy"
              type="checkbox"
              class="product-question__checkbox"
            />
            <label class="product-question__privacy-label" for="product-question-privacy">
              Hiermit bestätige ich, dass ich die
              <SfLink :href="localePath(paths.privacyPolicy)" target="_blank">Datenschutzerklärung</SfLink>
              gelesen habe. *
            </label>
          </div>
          <ErrorMessage as="div" name="privacyPolicy" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        </div>
        <p class="product-question__required">* Pflichtfelder</p>
        <NuxtTurnstile
          v-if="turnstileSiteKey.length > 0 && turnstileLoad"
          v-bind="turnstileAttributes"
          ref="turnstileElement"
          v-model="turnstile"
          :site-key="turnstileSiteKey"
          :options="{ theme: 'light' }"
        />
        <ErrorMessage as="div" name="turnstile" class="pt-[0.2rem] text-left text-sm text-negative-700" />
        <div class="product-question__actions">
          <button type="submit" class="product-question__submit" :disabled="isContactLoading">
            <SfLoaderCircular v-if="isContactLoading" class="flex items-center justify-center" size="sm" />
            <span v-else>Absenden</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomerContactEmailParams } from '@plentymarkets/shop-api';
import { productGetters, userGetters } from '@plentymarkets/shop-api';
import { SfIconWarning, SfLink, SfLoaderCircular } from '@storefront-ui/vue';
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
      'Wenn Du noch weitere Fragen zu diesem Artikel hast, kannst Du uns gerne über das folgende Formular benachrichtigen.',
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
      .test('is-valid-email', 'Bitte gib eine gültige E-Mail-Adresse ein.', (mail: string) =>
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
    privacyPolicy: boolean().oneOf([true], 'Bitte bestätige die Datenschutzerklärung.').default(false),
    turnstile:
      turnstileSiteKey.length > 0
        ? string().required('Bitte bestätige den Spamschutz.').default('')
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

<style scoped>
.product-question {
  color: #4f5965;
  font-size: 16px;
  line-height: 1.5;
}

.product-question__form {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  max-width: 100%;
}

.product-question__field {
  display: block;
}

.product-question__field--full,
.product-question__privacy,
.product-question__required,
.product-question__actions {
  grid-column: 1 / -1;
}

.product-question__control {
  display: block;
  width: 100%;
  min-height: 43px;
  border: 1px solid #dcdcdc;
  border-radius: 0;
  background: #fff;
  padding: 0 12px;
  color: #4f5965;
  font: inherit;
  line-height: 43px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.product-question__control::placeholder {
  color: #9aa0a6;
  opacity: 1;
}

.product-question__control:focus {
  border-color: #9aa0a6;
  box-shadow: 0 0 0 1px #9aa0a6 inset;
}

.product-question__control--invalid {
  border-color: #dc2626;
}

.product-question__textarea {
  min-height: 110px;
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 1.45;
  resize: vertical;
}

.product-question__privacy {
  margin-top: 2px;
}

.product-question__privacy-row {
  display: flex;
  align-items: flex-start;
}

.product-question__checkbox {
  width: 16px;
  height: 16px;
  margin: 4px 6px 0 0;
  border: 1px solid #4f5965;
  border-radius: 0;
  accent-color: var(--var-primary-grey);
  flex: 0 0 auto;
}

.product-question__privacy-label {
  color: #4f5965;
  cursor: pointer;
  user-select: none;
}

.product-question__privacy-label :deep(a) {
  color: #1f9ed5;
  text-decoration: none;
}

.product-question__privacy-label :deep(a:hover) {
  text-decoration: underline;
}

.product-question__required {
  margin: 2px 0 -4px;
  color: #4f5965;
}

.product-question__actions {
  width: 100%;
}

.product-question__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 37px;
  border: 0;
  border-radius: 0;
  background: #dce1e5;
  color: #333;
  font: inherit;
  cursor: pointer;
}

.product-question__submit:hover:not(:disabled),
.product-question__submit:focus-visible:not(:disabled) {
  background: #cfd5da;
}

.product-question__submit:disabled {
  cursor: wait;
  opacity: 0.75;
}

@media (min-width: 768px) {
  .product-question__form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-question__field--half {
    grid-column: auto;
  }
}
</style>
