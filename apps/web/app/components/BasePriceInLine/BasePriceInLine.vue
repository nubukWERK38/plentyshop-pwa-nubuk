<template>
  <div v-if="basePrice" class="text-sm mr-1">{{ unitContent }} {{ unitName }} | {{ basePrice }}</div>
</template>

<script setup lang="ts">
import type { BasePriceProps } from '~/components/BasePrice/types';

defineProps<BasePriceProps>();
</script>
