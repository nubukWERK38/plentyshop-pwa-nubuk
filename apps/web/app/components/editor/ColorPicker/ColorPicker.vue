<template>
  <div ref="root" class="relative inline-block">
    <slot
      name="trigger"
      :value="modelValue"
      :color="previewColor"
      :is-open="open"
      :toggle="toggle"
      :open="openDropdown"
      :close="close"
    >
      <div class="h-8 w-8 border border-[#dee2e6] cursor-pointer" :style="style" @mousedown.stop @click.stop="toggle" />
    </slot>

    <div v-if="open" :class="['absolute top-full z-50 mt-2', dropdownPositionClass]" @mousedown.stop @click.stop>
      <EditorColorPickerPanel
        :model-value="modelValue"
        :active-tab="activeTab"
        :shop-colors="shopColors"
        :show-shop-colors="props.showShopColors"
        @update:model-value="emit('update:modelValue', $event)"
        @update:active-tab="activeTab = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string | undefined;
    dropdownAlign?: 'default' | 'rte' | 'top-editor';
    showShopColors?: boolean;
  }>(),
  {
    dropdownAlign: 'default',
    showShopColors: true,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const activeTab = ref<'shop' | 'picker'>('picker');

const instanceId = `color-picker-${Math.random().toString(36).slice(2)}`;
const activeId = useState<string | null>('editorColorPickerActiveId', () => null);

const dropdownPositionClass = computed(() => {
  if (props.dropdownAlign === 'rte') {
    return 'right-0 translate-x-1/2';
  }
  if (props.dropdownAlign === 'top-editor') {
    return 'right-0 translate-x-[30%]';
  }
  return '';
});
const style = computed(() => ({
  backgroundColor: props.modelValue || '#ffffff',
}));

const previewColor = computed(() => style.value.backgroundColor as string);

const { getSetting: getPrimaryColorSetting } = useSiteSettings('primaryColor');
const { getSetting: getSecondaryColorSetting } = useSiteSettings('secondaryColor');
const { getSetting: getAccentColor1Setting } = useSiteSettings('accentColor1');
const { getSetting: getAccentColor2Setting } = useSiteSettings('accentColor2');
const { getSetting: getAccentColor3Setting } = useSiteSettings('accentColor3');
const { getSetting: getAccentColor4Setting } = useSiteSettings('accentColor4');

const primaryColor = computed(() => getPrimaryColorSetting());
const secondaryColor = computed(() => getSecondaryColorSetting());
const accentColor1 = computed(() => getAccentColor1Setting());
const accentColor2 = computed(() => getAccentColor2Setting());
const accentColor3 = computed(() => getAccentColor3Setting());
const accentColor4 = computed(() => getAccentColor4Setting());

const shopColors = computed(() => [
  { id: 'primary', previewColor: primaryColor.value, value: 'rgb(var(--colors-2-primary-500))' },
  { id: 'secondary', previewColor: secondaryColor.value, value: 'rgb(var(--colors-2-secondary-500))' },
  { id: 'accent1', previewColor: accentColor1.value, value: 'rgb(var(--colors-2-accent1-500))' },
  { id: 'accent2', previewColor: accentColor2.value, value: 'rgb(var(--colors-2-accent2-500))' },
  { id: 'accent3', previewColor: accentColor3.value, value: 'rgb(var(--colors-2-accent3-500))' },
  { id: 'accent4', previewColor: accentColor4.value, value: 'rgb(var(--colors-2-accent4-500))' },
]);

watch(
  activeId,
  (newId) => {
    open.value = newId === instanceId;
  },
  { immediate: true },
);

const openDropdown = () => {
  activeId.value = instanceId;
};

const close = () => {
  if (activeId.value === instanceId) {
    activeId.value = null;
  }
};

const toggle = () => {
  if (open.value) {
    close();
  } else {
    openDropdown();
  }
};

const onDocClick = (e: MouseEvent) => {
  if (!root.value?.contains(e.target as Node)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick);
});
</script>
