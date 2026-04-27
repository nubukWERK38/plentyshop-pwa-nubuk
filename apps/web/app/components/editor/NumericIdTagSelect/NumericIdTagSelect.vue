<template>
  <div>
    <UiFormLabel class="block mb-2">{{ label }}</UiFormLabel>

    <Multiselect
      v-model="selectedTags"
      :options="tagOptions"
      label="text"
      track-by="id"
      :multiple="true"
      :taggable="true"
      :close-on-select="false"
      :allow-empty="true"
      :placeholder="placeholder"
      :tag-placeholder="tagPlaceholder"
      :deselect-label="deselectLabel"
      :custom-label="formatTagLabel"
      class="w-full cursor-pointer"
      :data-testid="dataTestId"
      @tag="handleTag"
    />

    <span v-if="helpText" class="mt-2 block typography-text-xs text-neutral-700">
      {{ helpText }}
    </span>

    <div
      v-if="invalidEntries.length"
      class="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
      :data-testid="`${dataTestId}-errors`"
    >
      <div class="font-semibold">{{ invalidTitle }}</div>
      <p class="mt-1">{{ invalidHelpText }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="entry in invalidEntries"
          :key="entry"
          class="rounded-full border border-red-300 bg-white px-2 py-1 text-xs font-medium"
        >
          {{ entry }}
        </span>
      </div>
    </div>

    <div v-if="previewTitle" class="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div class="mb-2 text-sm font-semibold text-neutral-900">{{ previewTitle }}</div>

      <ul v-if="previewRows.length" class="space-y-2" :data-testid="`${dataTestId}-preview`">
        <li v-for="row in previewRows" :key="row.id" class="flex flex-col gap-1 text-sm text-neutral-800">
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-white px-2 py-1 text-xs font-semibold text-neutral-700">#{{ row.id }}</span>
            <span>{{ row.label }}</span>
          </div>
          <span v-if="row.description" class="text-xs text-neutral-600">{{ row.description }}</span>
          <span v-if="!row.found" class="text-xs text-amber-700">{{ previewUnavailableText }}</span>
        </li>
      </ul>

      <p v-else class="text-sm text-neutral-600">{{ previewEmptyText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import type { NumericIdPreviewItem, NumericIdTagSelectProps } from './types';

type NumericIdOption = {
  id: number;
  text: string;
};

const props = withDefaults(defineProps<NumericIdTagSelectProps>(), {
  helpText: '',
  previewTitle: '',
  previewEmptyText: '',
  previewUnavailableText: '',
  previewItems: () => [],
  dataTestId: 'numeric-id-tag-select',
});

const emit = defineEmits<{
  'update:modelValue': [value: number[]];
}>();

const invalidEntries = ref<string[]>([]);

const parseId = (value: string): number | null => {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return null;

  const id = Number(normalized);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const updateModelValue = (ids: number[]) => {
  emit('update:modelValue', [...new Set(ids)]);
};

const previewRowMap = computed(() => {
  return new Map<number, NumericIdPreviewItem>(props.previewItems.map((item) => [item.id, item]));
});

const buildOption = (id: number): NumericIdOption => {
  const previewItem = previewRowMap.value.get(id);
  return {
    id,
    text: previewItem ? `#${id} - ${previewItem.label}` : `#${id}`,
  };
};

const selectedTags = computed({
  get: () => props.modelValue.map((id) => buildOption(id)),
  set: (value: NumericIdOption[]) => {
    updateModelValue(value.map((option) => option.id));
  },
});

const tagOptions = computed(() => {
  const optionsById = new Map<number, NumericIdOption>();

  props.previewItems.forEach((item) => {
    optionsById.set(item.id, buildOption(item.id));
  });

  props.modelValue.forEach((id) => {
    optionsById.set(id, buildOption(id));
  });

  return [...optionsById.values()];
});

const formatTagLabel = (option: NumericIdOption) => option.text;

const handleTag = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return;

  const parsedId = parseId(normalized);

  if (parsedId === null) {
    invalidEntries.value = [normalized, ...invalidEntries.value.filter((entry) => entry !== normalized)].slice(0, 5);
    return;
  }

  invalidEntries.value = invalidEntries.value.filter((entry) => entry !== normalized);
  updateModelValue([...props.modelValue, parsedId]);
};

const previewRows = computed(() => {
  return props.modelValue.map((id) => {
    const previewItem = previewRowMap.value.get(id);

    return {
      id,
      label: previewItem?.label ?? `#${id}`,
      description: previewItem?.description,
      found: Boolean(previewItem),
    };
  });
});
</script>