<template>
  <div v-if="attributes.length > 0" data-testid="product-attributes" class="mb-2">
    <div v-for="(attribute, index) in attributes" :key="index" class="mb-2">
      <Component
        :is="componentsMapper[productAttributeGetters.getAttributeType(attribute)]"
        v-if="componentsMapper[productAttributeGetters.getAttributeType(attribute)]"
        :attribute="attribute"
        v-bind="
          productAttributeGetters.getAttributeType(attribute) === 'dropdown' ? { variationAvailabilityNames } : {}
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductAttributesProps, ComponentsMapper } from './types';
import AttributeDropdown from './AttributeDropdown/AttributeDropdown.vue';
import AttributeBox from './AttributeBox/AttributeBox.vue';
import AttributeImage from './AttributeImage/AttributeImage.vue';
import { productAttributeGetters, productGetters } from '@plentymarkets/shop-api';

const componentsMapper: ComponentsMapper = {
  dropdown: AttributeDropdown,
  box: AttributeBox,
  image: AttributeImage,
};

const { attributes, setAttribute } = useProductAttributes();
const props = defineProps<ProductAttributesProps>();
const product = computed(() => props.product);
const route = useRoute();
const variationAvailabilityNames = ref<Record<number, string>>({});
let availabilityRequestId = 0;

const loadVariationAvailabilityNames = async () => {
  const requestId = ++availabilityRequestId;
  const variationIds = [
    ...new Set((product.value.variationAttributeMap?.variations ?? []).map(({ variationId }) => variationId)),
  ];

  if (variationIds.length === 0) {
    variationAvailabilityNames.value = {};
    return;
  }

  try {
    const response = await useSdk().plentysystems.getProductsByIds({
      variationIds,
      itemsPerPage: variationIds.length,
    });
    if (requestId !== availabilityRequestId) return;

    variationAvailabilityNames.value = Object.fromEntries(
      (response.data.products ?? [])
        .map((variation) => [
          Number(productGetters.getVariationId(variation)),
          productGetters.getAvailabilityName(variation),
        ])
        .filter((entry): entry is [number, string] => Number.isFinite(entry[0]) && Boolean(entry[1])),
    );
  } catch {
    if (requestId === availabilityRequestId) variationAvailabilityNames.value = {};
  }
};

const lastSegment = route.path.split('/').pop() ?? '';
const selectAttributes = ref(lastSegment.split('_').length > 2 || useCallisto().isEnabled);

watch(
  selectAttributes,
  () => {
    setAttribute(product.value, selectAttributes.value);
  },
  { immediate: true },
);

watch(
  product,
  (newProduct) => {
    setAttribute(newProduct, selectAttributes.value);
    void loadVariationAvailabilityNames();
  },
  { immediate: false },
);

onMounted(() => void loadVariationAvailabilityNames());
</script>
