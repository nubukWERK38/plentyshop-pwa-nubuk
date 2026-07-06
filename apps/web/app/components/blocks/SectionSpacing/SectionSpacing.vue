<template>
  <div aria-hidden="true" data-testid="section-spacing" :style="spacingStyle" />
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { SectionSpacingProps } from './types';

const props = defineProps<SectionSpacingProps>();

const spacingStyle = computed<CSSProperties>(() => {
  const height = Number(props.content?.height ?? 60);
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 60;

  return {
    height: `${safeHeight}px`,
  };
});
</script>
