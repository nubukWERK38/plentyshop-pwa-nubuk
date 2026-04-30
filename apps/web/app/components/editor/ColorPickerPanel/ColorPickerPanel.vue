<template>
  <div class="rounded-md border bg-white shadow-md p-3 min-w-[220px]">
    <EditorColorPickerTabs
      v-if="props.showShopColors"
      :active-tab="props.activeTab"
      @update:active-tab="emit('update:activeTab', $event)"
    />

    <div v-if="!props.showShopColors || props.activeTab === 'picker'">
      <color-picker-block
        :model-value="props.modelValue"
        with-hex-input
        with-rgb-input
        with-alpha
        with-initial-color
        with-eye-dropper
        with-colors-history
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
    <div v-else>
      <div class="flex gap-2">
        <button
          v-for="shopColor in props.shopColors"
          :key="shopColor.id"
          type="button"
          class="h-8 w-8 rounded-md border border-slate-200"
          :style="{ backgroundColor: shopColor.previewColor || '#000000' }"
          @click="emit('update:modelValue', shopColor.value)"
        />
      </div>
      <div class="mt-3">
        <span class="italic text-xs">{{ getEditorTranslation('primary-shop') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string | undefined;
    activeTab: 'shop' | 'picker';
    shopColors: Array<{
      id: string;
      previewColor: string | null;
      value: string;
    }>;
    showShopColors?: boolean;
  }>(),
  {
    showShopColors: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'update:activeTab', v: 'shop' | 'picker'): void;
}>();
</script>

<i18n lang="json">
{
  "en": {
    "primary-shop": "These are your primary shop colors. You can customize them in your site settings from Branding & Design"
  },
  "de": {
    "primary-shop": "These are your primary shop colors. You can customize them in your site settings from Branding & Design"
  }
}
</i18n>
