<template>
  <div :class="['quantity-selector', `quantity-selector--${variant}`]" data-testid="quantity-selector">
    <div v-if="variant === 'horizontal'" class="flex border border-neutral-300 rounded-md h-full w-full">
      <SfTooltip
        v-if="count <= minValue"
        :label="t('product.minimumQuantity', { count: minValue })"
        placement="left"
        :show-arrow="true"
        class="flex"
      >
        <UiButton
          variant="tertiary"
          :disabled="disabled || count <= minValue"
          square
          class="rounded-r-none"
          :aria-controls="inputId"
          :aria-label="t('product.decreaseQuantity')"
          data-testid="quantity-selector-decrease-button"
          @click="dec()"
        >
          <SfIconRemove />
        </UiButton>
      </SfTooltip>
      <UiButton
        v-else
        variant="tertiary"
        :disabled="disabled || count <= minValue"
        square
        class="rounded-r-none"
        :aria-controls="inputId"
        :aria-label="t('product.decreaseQuantity')"
        data-testid="quantity-selector-decrease-button"
        @click="dec()"
      >
        <SfIconRemove />
      </UiButton>
      <input
        :id="inputId"
        v-model="count"
        type="number"
        role="spinbutton"
        :class="inputClasses"
        :min="minValue"
        :max="maxValue"
        data-testid="quantity-selector-input"
        class="h-12"
        :aria-label="t('common.labels.quantitySelector')"
        :disabled="disabled"
        @input="handleOnChange"
      />
      <UiButton
        variant="tertiary"
        :disabled="disabled || count >= maxValue"
        square
        class="rounded-l-none"
        :aria-controls="inputId"
        :aria-label="t('product.increaseQuantity')"
        data-testid="quantity-selector-increase-button"
        @click="inc()"
      >
        <SfIconAdd />
      </UiButton>
    </div>
    <template v-else>
      <input
        :id="inputId"
        v-model="count"
        type="number"
        role="spinbutton"
        :class="[inputClasses, 'quantity-selector__input']"
        :min="minValue"
        :max="maxValue"
        data-testid="quantity-selector-input"
        :aria-label="t('common.labels.quantitySelector')"
        :disabled="disabled"
        @input="handleOnChange"
      />
      <div class="quantity-selector__steps">
        <UiButton
          variant="tertiary"
          :disabled="disabled || count >= maxValue"
          square
          class="quantity-selector__step"
          :aria-controls="inputId"
          :aria-label="t('product.increaseQuantity')"
          data-testid="quantity-selector-increase-button"
          @click="inc()"
        >
          <SfIconExpandLess />
        </UiButton>
        <SfTooltip
          :label="count <= minValue ? t('product.minimumQuantity', { count: minValue }) : ''"
          placement="left"
          :show-arrow="count <= minValue"
          class="quantity-selector__step-tooltip"
        >
          <UiButton
            variant="tertiary"
            :disabled="disabled || count <= minValue"
            square
            class="quantity-selector__step"
            :aria-controls="inputId"
            :aria-label="t('product.decreaseQuantity')"
            data-testid="quantity-selector-decrease-button"
            @click="dec()"
          >
            <SfIconExpandMore />
          </UiButton>
        </SfTooltip>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { clamp } from '@storefront-ui/shared';
import { SfIconAdd, SfIconExpandLess, SfIconExpandMore, SfIconRemove, SfTooltip, useId } from '@storefront-ui/vue';
import { useCounter } from '@vueuse/core';
import type { QuantitySelectorProps } from '~/components/ui/QuantitySelector/types';

const emit = defineEmits(['changeQuantity']);

const {
  value = 1,
  minValue = 1,
  maxValue = Number.POSITIVE_INFINITY,
  disabled = false,
  variant = 'horizontal',
} = defineProps<QuantitySelectorProps>();

const inputId = ref('0');
const { count, inc, dec, set } = useCounter(value);

const inputClasses = computed(
  () =>
    'appearance-none flex-1 mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:display-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:display-none [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none disabled:placeholder-disabled-900 focus-visible:outline focus-visible:outline-offset focus-visible:rounded-sm',
);

onMounted(() => (inputId.value = useId()));

watch(count, (quantity) => {
  if (quantity < minValue) {
    set(minValue);
  } else if (quantity > maxValue) {
    set(maxValue);
  }

  emit('changeQuantity', quantity);
});

const handleOnChange = (event: Event) => {
  const currentValue = (event.target as HTMLInputElement)?.value;
  const nextValue = Number.parseFloat(currentValue);
  set(clamp(nextValue, minValue, maxValue));
};

defineExpose({ handleOnChange });
</script>

<style scoped>
.quantity-selector {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.quantity-selector--vertical {
  width: 84px;
  height: 60px;
  flex-direction: row;
  align-items: stretch;
}

.quantity-selector--vertical .quantity-selector__input {
  width: 52px;
  height: 60px;
  margin: 0;
  flex: 0 0 52px;
  border: 1px solid #d1d5db;
  background: #f1f2f3;
  color: #071625;
  font-size: 1rem;
}

.quantity-selector__steps {
  display: flex;
  width: 32px;
  flex: 0 0 32px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.quantity-selector__step,
.quantity-selector__step-tooltip :deep(button) {
  width: 32px;
  height: 24px;
  min-width: 32px;
  min-height: 24px;
  border: 0;
  padding: 0;
  color: #071625;
  background: transparent;
}

.quantity-selector__step-tooltip {
  display: flex;
  width: 32px;
  height: 24px;
}

.quantity-selector__step :deep(svg),
.quantity-selector__step-tooltip :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
