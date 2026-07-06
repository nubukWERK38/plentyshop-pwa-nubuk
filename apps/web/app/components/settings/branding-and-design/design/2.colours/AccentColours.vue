<template>
  <div class="space-y-4 py-2">
    <section>
      <UiFormLabel class="mb-2 block">{{ getEditorTranslation('accent-color-1-label') }}</UiFormLabel>
      <EditorColorPicker v-model="accentColor1" class="w-full" :show-shop-colors="false">
        <template #trigger="{ color, toggle }">
          <label>
            <SfInput v-model="accentColor1" type="text" data-testid="accent-color-1-select">
              <template #suffix>
                <button
                  type="button"
                  class="editor-color-swatch"
                  :style="{ backgroundColor: color }"
                  @mousedown.stop
                  @click.stop="toggle"
                />
              </template>
            </SfInput>
          </label>
        </template>
      </EditorColorPicker>
    </section>

    <section>
      <UiFormLabel class="mb-2 block">{{ getEditorTranslation('accent-color-2-label') }}</UiFormLabel>
      <EditorColorPicker v-model="accentColor2" class="w-full" :show-shop-colors="false">
        <template #trigger="{ color, toggle }">
          <label>
            <SfInput v-model="accentColor2" type="text" data-testid="accent-color-2-select">
              <template #suffix>
                <button
                  type="button"
                  class="editor-color-swatch"
                  :style="{ backgroundColor: color }"
                  @mousedown.stop
                  @click.stop="toggle"
                />
              </template>
            </SfInput>
          </label>
        </template>
      </EditorColorPicker>
    </section>

    <section>
      <UiFormLabel class="mb-2 block">{{ getEditorTranslation('accent-color-3-label') }}</UiFormLabel>
      <EditorColorPicker v-model="accentColor3" class="w-full" :show-shop-colors="false">
        <template #trigger="{ color, toggle }">
          <label>
            <SfInput v-model="accentColor3" type="text" data-testid="accent-color-3-select">
              <template #suffix>
                <button
                  type="button"
                  class="editor-color-swatch"
                  :style="{ backgroundColor: color }"
                  @mousedown.stop
                  @click.stop="toggle"
                />
              </template>
            </SfInput>
          </label>
        </template>
      </EditorColorPicker>
    </section>

    <section>
      <UiFormLabel class="mb-2 block">{{ getEditorTranslation('accent-color-4-label') }}</UiFormLabel>
      <EditorColorPicker v-model="accentColor4" class="w-full" :show-shop-colors="false">
        <template #trigger="{ color, toggle }">
          <label>
            <SfInput v-model="accentColor4" type="text" data-testid="accent-color-4-select">
              <template #suffix>
                <button
                  type="button"
                  class="editor-color-swatch"
                  :style="{ backgroundColor: color }"
                  @mousedown.stop
                  @click.stop="toggle"
                />
              </template>
            </SfInput>
          </label>
        </template>
      </EditorColorPicker>
    </section>
  </div>
</template>

<script setup lang="ts">
import { SfInput } from '@storefront-ui/vue';
import { getPaletteFromColor, setColorProperties } from '~/utils/tailwindHelper';

const bindAccentColor = (settingKey: string, paletteKey: string, fallback: string) => {
  const { updateSetting, getSetting } = useSiteSettings(settingKey);

  return computed({
    get: () => getSetting() || fallback,
    set: (value: string) => {
      updateSetting(value);
      const tailwindColors = getPaletteFromColor(paletteKey, value).map((color) => ({
        ...color,
      }));
      setColorProperties(paletteKey, tailwindColors);
    },
  });
};

const accentColor1 = bindAccentColor('accentColor1', 'accent1', '#D1FF00');
const accentColor2 = bindAccentColor('accentColor2', 'accent2', '#ED4B4B');
const accentColor3 = bindAccentColor('accentColor3', 'accent3', '#FFFFFF');
const accentColor4 = bindAccentColor('accentColor4', 'accent4', '#FFFFFF');
</script>

<i18n lang="json">
{
  "en": {
    "accent-color-1-label": "Accent colour 1",
    "accent-color-2-label": "Accent colour 2",
    "accent-color-3-label": "Accent colour 3",
    "accent-color-4-label": "Accent colour 4"
  },
  "de": {
    "accent-color-1-label": "Akzentfarbe 1",
    "accent-color-2-label": "Akzentfarbe 2",
    "accent-color-3-label": "Akzentfarbe 3",
    "accent-color-4-label": "Akzentfarbe 4"
  }
}
</i18n>
