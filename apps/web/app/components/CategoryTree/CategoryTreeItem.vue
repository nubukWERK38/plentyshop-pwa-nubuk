<template>
  <li
    v-if="name.length > 0"
    :class="['border-b border-neutral-200', { 'ml-5': nested }]"
    data-testid="category-tree-item"
  >
    <NuxtLink :to="localePath(href)" class="flex min-h-11 items-center justify-between gap-2 py-2 text-primary-500">
      <span class="flex min-w-0 items-center gap-2">
        <SfIconChevronRight size="sm" class="shrink-0 text-neutral-900" />
        <span class="truncate text-sm font-normal" data-testid="list-item-menu-label">
          {{ name }}
        </span>
      </span>
      <SfIconAdd v-if="hasChildren" size="sm" class="shrink-0 text-primary-700" />
    </NuxtLink>
  </li>
</template>

<script setup lang="ts">
import { SfIconAdd, SfIconChevronRight } from '@storefront-ui/vue';
import type { CategoryTreeItemType } from '~/components/CategoryTree/types';

const localePath = useLocalePath();

defineProps<CategoryTreeItemType>();
</script>
