<template>
  <div v-if="haveBadges" data-testid="badges" class="z-[2]">
    <ul>
      <template v-if="useTags && productTags.length > 0">
        <SfListItem
          v-for="(tag, index) in productTags"
          :key="index"
          size="sm"
          class="text-xs font-medium select-none rounded-md !w-fit !px-2 opacity-75 mr-2 mb-2 cursor-pointer"
          :class="[
            tagGetters.getAgenciesTagCLass(tag),
            tagGetters.getTagTextColorIsDark(tag) ? 'text-dark' : 'text-white',
          ]"
          :style="{ backgroundColor: tagGetters.getTagBackgroundColor(tag) }"
          @click="onTagClick(tag)"
        >
          {{ tagGetters.getTagName(tag) }}
        </SfListItem>
      </template>

      <SfListItem
        v-if="useAvailability && availabilityName"
        size="sm"
        class="text-xs font-medium select-none rounded-md !w-fit !cursor-text !px-2 grid mt-2"
        :class="[availabilityClass]"
        :style="availabilityStyles"
      >
        {{ availabilityName }}
      </SfListItem>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { SfListItem } from '@storefront-ui/vue';
import { type ProductTag, productGetters, tagGetters } from '@plentymarkets/shop-api';
import type { BadgesProps } from '~/components/ui/Badges/types';

const localePath = useLocalePath();

const { product, useTags = true, useAvailability = false } = defineProps<BadgesProps>();

const productTags = computed(() => {
  if (!useTags) return [];
  return tagGetters.getTags(product);
});

const availabilityName = computed(() => {
  if (!useAvailability) return '';

  try {
    return productGetters.getAvailabilityName(product) || '';
  } catch {
    return '';
  }
});

const availabilityClass = computed(() => {
  if (!availabilityName.value) return '';

  try {
    return productGetters.getAgenciesAvailabilityCLass(product);
  } catch {
    return '';
  }
});

const availabilityStyles = computed(() => {
  if (!availabilityName.value) return {};

  try {
    return {
      backgroundColor: productGetters.getAvailabilityBackgroundColor(product),
      color: productGetters.getAvailabilityTextColor(product),
    };
  } catch {
    return {};
  }
});

const haveBadges = computed(() => (useTags && productTags.value.length > 0) || Boolean(availabilityName.value));

const onTagClick = (tag: ProductTag) => {
  navigateTo(localePath(`/tag/${tagGetters.getTagName(tag)}_${tagGetters.getTagId(tag)}`));
};
</script>
