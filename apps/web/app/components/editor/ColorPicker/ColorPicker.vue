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
      <div class="editor-color-picker__trigger" :style="style" @mousedown.stop @click.stop="toggle" />
    </slot>

    <div
      v-if="open"
      :class="['editor-layer-popup absolute top-full mt-2', dropdownPositionClass]"
      @mousedown.stop
      @click.stop
    >
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

type ShopColorDefinition = {
  id: string;
  previewColor: string;
  value: string;
  aliases: string[];
};

const normalizeColorValue = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

const createShopColor = (id: string, value: string | null | undefined, token: string): ShopColorDefinition => ({
  id,
  previewColor: value || token,
  value: value || token,
  aliases: [token],
});

const shopColorDefinitions = computed(() => [
  createShopColor('primary', primaryColor.value, 'rgb(var(--colors-2-primary-500))'),
  createShopColor('secondary', secondaryColor.value, 'rgb(var(--colors-2-secondary-500))'),
  createShopColor('accent1', accentColor1.value, 'rgb(var(--colors-2-accent1-500))'),
  createShopColor('accent2', accentColor2.value, 'rgb(var(--colors-2-accent2-500))'),
  createShopColor('accent3', accentColor3.value, 'rgb(var(--colors-2-accent3-500))'),
  createShopColor('accent4', accentColor4.value, 'rgb(var(--colors-2-accent4-500))'),
]);

const shopColors = computed(() =>
  shopColorDefinitions.value.map(({ id, previewColor, value }) => ({ id, previewColor, value })),
);

const selectedShopColor = computed(() => {
  const modelValue = normalizeColorValue(props.modelValue);

  return shopColorDefinitions.value.find((shopColor) =>
    [shopColor.value, shopColor.previewColor, ...shopColor.aliases].some(
      (value) => normalizeColorValue(value) === modelValue,
    ),
  );
});
const activeTab = ref<'shop' | 'picker'>(props.showShopColors && selectedShopColor.value ? 'shop' : 'picker');

const previewColor = computed(() => selectedShopColor.value?.previewColor || props.modelValue || '#ffffff');

const style = computed(() => ({
  backgroundColor: previewColor.value,
}));

watch(
  activeId,
  (newId) => {
    open.value = newId === instanceId;
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  () => {
    if (props.showShopColors && selectedShopColor.value) {
      activeTab.value = 'shop';
    }
  },
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
