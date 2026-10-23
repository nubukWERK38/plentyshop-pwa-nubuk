<template>
  <div class="text-sm mx-4 md:pb-0">
    <div class="flex items-center">
      <SfCheckbox
        id="terms-checkbox"
        :model-value="checkboxValue"
        :invalid="showErrors"
        class="inline-block mr-2"
        data-testid="checkout-terms-checkbox"
        @update:model-value="(event) => setCheckboxValue(Boolean(event))"
      />
      <label for="terms-checkbox" class="select-none">
        <i18n-t keypath="legal.termsInfo" scope="global">
          <template #terms>
            <SfLink
              :href="localePath(paths.termsAndConditions)"
              target="_blank"
              class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
            >
              {{ t('legal.termsAndConditions') }}
            </SfLink>
          </template>

          <template #cancellationRights>
            <SfLink
              :href="localePath(paths.cancellationRights)"
              target="_blank"
              class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
            >
              {{ t('legal.cancellationRights') }}
            </SfLink>
          </template>

          <template #privacyPolicy>
            <SfLink
              :href="localePath(paths.privacyPolicy)"
              target="_blank"
              class="focus:outline focus:outline-offset-2 focus:outline-2 outline-secondary-600 rounded"
            >
              {{ t('legal.privacyPolicy') }}
            </SfLink>
          </template>
        </i18n-t>
      </label>
    </div>
    <div class="text-sm text-neutral-500 mt-1 ml-7">* {{ t('contact.form.asterixHint') }}</div>
    <div v-if="showErrors" class="text-negative-700 text-sm">{{ t('legal.termsRequired') }}</div>
    <p>
      <a
        target="_blank"
        rel="noopener"
        title="Offiziellen EU-Gewährleistungshinweis als PDF öffnen"
        class="warranty-notice-link"
        href="https://cdn03.plentyone.com/0bcmhf2jth7k/frontend/rechtliches/eu_notice_de.pdf"
      >
        EU-Gewährleistungshinweis
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { SfCheckbox, SfLink } from '@storefront-ui/vue';
import { paths } from '~/utils/paths';

const localePath = useLocalePath();

const { checkboxValue, setCheckboxValue, showErrors } = useAgreementCheckbox('checkoutGeneralTerms');
</script>

<style scoped>
.warranty-notice-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  color: var(--ci-text);
  background-color: #e8e8e8;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.warranty-notice-link:hover {
  color: var(--ci-text);
  background-color: #d9d9d9;
}

.warranty-notice-link:focus-visible {
  outline: 3px solid var(--ci-primary);
  outline-offset: 3px;
}
</style>
