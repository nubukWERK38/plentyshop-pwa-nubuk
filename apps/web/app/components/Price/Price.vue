<template>
  <div class="price py-1">
    <span v-if="crossedPrice && differentPrices" class="price__rrp">UVP {{ format(crossedPrice) }}</span>
    <span class="price__value" data-testid="price">
      <span>{{ format(price) }}</span>
      <span>{{ t('common.labels.asterisk') }} </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { PriceProps } from '~/components/Price/types';

const props = defineProps<PriceProps>();

const { format } = usePriceFormatter();

const differentPrices = computed(() => {
  return props.crossedPrice
    ? Math.round(props.price * 100) / 100 !== Math.round(props.crossedPrice * 100) / 100
    : false;
});
</script>

<style scoped>
.price {
  font-size: 0.875rem;
}

.price__rrp {
  float: right;
  margin-right: 30px;
  margin-bottom: 10px;
  color: var(--ci-dark);
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.3;
}

.price__value {
  margin-left: 30px;
  color: var(--ci-dark);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.1;
}
</style>
