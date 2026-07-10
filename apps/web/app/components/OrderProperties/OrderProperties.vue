<template>
  <div
    v-for="(group, groupIndex) in orderPropertiesGroups"
    :key="`group-${groupIndex}`"
    class="order-properties__group mt-5 mb-4"
  >
    <div class="order-properties__group-heading font-semibold">
      {{ productPropertyGetters.getOrderPropertyGroupName(group) }}
    </div>

    <div class="order-properties__group-description font-normal typography-text-sm mb-2">
      {{ productPropertyGetters.getOrderPropertyGroupDescription(group) }}
    </div>

    <div
      v-for="(productProperty, propIndex) in group.orderProperties"
      :key="`group-prop-${propIndex}`"
      class="order-properties__row mt-2 flex items-center"
    >
      <!-- ClientOnly until fixed: https://github.com/nuxt/nuxt/issues/23768#issuecomment-1849023053 -->
      <Component
        :is="componentsMapper[productPropertyGetters.getOrderPropertyValueType(productProperty)]"
        v-if="componentsMapper[productPropertyGetters.getOrderPropertyValueType(productProperty)]"
        :has-tooltip="hasTooltip"
        :product-property="productProperty"
      >
        <template v-if="productPropertyGetters.hasOrderPropertyDescription(productProperty)" #tooltip>
          <SfTooltip
            :label="productPropertyGetters.getOrderPropertyDescription(productProperty)"
            :placement="'bottom'"
            :show-arrow="true"
            class="ml-2 z-10"
          >
            <SfIconInfo :size="'sm'" />
          </SfTooltip>
        </template>
      </Component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { productPropertyGetters } from '@plentymarkets/shop-api';
import type { Product } from '@plentymarkets/shop-api';
import type { ComponentsMapper, OrderPropertiesProps } from './types';
import OrderPropertyInput from '~/components/OrderPropertyInput/OrderPropertyInput.vue';
import OrderPropertySelect from '~/components/OrderPropertySelect/OrderPropertySelect.vue';
import OrderPropertyCheckbox from '~/components/OrderPropertyCheckbox/OrderPropertyCheckbox.vue';
import OrderPropertyFileUpload from '~/components/OrderPropertyFileUpload/OrderPropertyFileUpload.vue';
import { SfIconInfo, SfTooltip } from '@storefront-ui/vue';

const props = defineProps<OrderPropertiesProps>();
const getOrderPropertiesGroups = (product: Product) => {
  if (!Array.isArray((product as { properties?: unknown }).properties)) return [];

  try {
    return productPropertyGetters.getOrderPropertiesGroups(product);
  } catch {
    return [];
  }
};
const orderPropertiesGroups = computed(() => getOrderPropertiesGroups(props.product));
const hasTooltip = computed(() => productPropertyGetters.hasOrderPropertiesGroupsTooltips(orderPropertiesGroups.value));
const componentsMapper: ComponentsMapper = {
  empty: OrderPropertyCheckbox,
  int: OrderPropertyInput,
  text: OrderPropertyInput,
  float: OrderPropertyInput,
  selection: OrderPropertySelect,
  file: OrderPropertyFileUpload,
};
</script>
