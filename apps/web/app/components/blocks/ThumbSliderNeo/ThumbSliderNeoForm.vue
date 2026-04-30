<template>
  <div data-testid="thumb-slider-neo-form" class="sticky h-[calc(100vh-52px)] overflow-y-auto">
    <UiAccordionItem
      v-model="headerOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('header-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-label') }}</UiFormLabel>
          <SfInput v-model="thumbContent.header.subline" type="text" class="w-full" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-label') }}</UiFormLabel>
          <SfInput v-model="thumbContent.header.headline" type="text" class="w-full" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-alignment-label') }}</UiFormLabel>
          <select v-model="thumbContent.header.sublineAlignment" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-alignment-label') }}</UiFormLabel>
          <select v-model="thumbContent.header.headlineAlignment" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.sublineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.sublineColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.headlineColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.headlineColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.sublineBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.sublineBackgroundColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.header.headlineBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.header.headlineBackgroundColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-font-size-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.sublineFontSize" type="number" min="10" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-font-size-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.headlineFontSize" type="number" min="14" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-font-weight-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.header.sublineFontWeight"
            type="number"
            min="100"
            max="900"
            step="100"
            class="input-field"
          />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-font-weight-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.header.headlineFontWeight"
            type="number"
            min="100"
            max="900"
            step="100"
            class="input-field"
          />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('subline-margin-bottom-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.sublineMarginBottom" type="number" min="0" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('headline-margin-bottom-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.header.headlineMarginBottom" type="number" min="0" class="input-field" />
        </div>

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {{ getEditorTranslation('header-margin-label') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="headerMarginState.top" type="number" class="input-field" />
            <input v-model.number="headerMarginState.right" type="number" class="input-field" />
            <input v-model.number="headerMarginState.bottom" type="number" class="input-field" />
            <input v-model.number="headerMarginState.left" type="number" class="input-field" />
          </div>
        </div>

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {{ getEditorTranslation('header-padding-label') }}
          </h3>
          <div class="grid grid-cols-4 gap-2">
            <input v-model.number="headerPaddingState.top" type="number" min="0" class="input-field" />
            <input v-model.number="headerPaddingState.right" type="number" min="0" class="input-field" />
            <input v-model.number="headerPaddingState.bottom" type="number" min="0" class="input-field" />
            <input v-model.number="headerPaddingState.left" type="number" min="0" class="input-field" />
          </div>
        </div>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="itemsOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('items-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div v-for="(item, index) in thumbContent.items" :key="`item-${index}`" class="rounded border p-3">
          <div class="mb-2 flex justify-between items-center">
            <p class="text-sm font-semibold">{{ getEditorTranslation('item-label') }} {{ index + 1 }}</p>
            <button type="button" class="text-xs text-red-600" @click="removeItem(index)">
              {{ getEditorTranslation('remove-label') }}
            </button>
          </div>

          <UiImagePicker
            :label="getEditorTranslation('image-label')"
            :image="item.image"
            :placeholder="placeholderImg"
            dimensions="400 x 220"
            selected-image-type="desktop"
            @add="(payload) => onAddImage(payload, index)"
            @delete="onDeleteImage(index)"
          />

          <div class="mt-2 space-y-2">
            <SfInput v-model="item.alt" type="text" :placeholder="getEditorTranslation('alt-label')" class="w-full" />
            <SfInput v-model="item.link" type="text" :placeholder="getEditorTranslation('link-label')" class="w-full" />
            <SfInput v-model="item.text" type="text" :placeholder="getEditorTranslation('text-label')" class="w-full" />
          </div>
        </div>

        <button type="button" class="action-btn" @click="addItem">{{ getEditorTranslation('add-item-label') }}</button>
      </div>
    </UiAccordionItem>

    <UiAccordionItem
      v-model="controlsOpen"
      summary-active-class="bg-neutral-100 border-t-0"
      summary-class="w-full hover:bg-neutral-100 px-4 py-5 flex justify-between items-center select-none border-b"
    >
      <template #summary>
        <h2>{{ getEditorTranslation('controls-label') }}</h2>
      </template>

      <div class="space-y-3 px-2 py-3">
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('autoplay-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.autoplay" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('full-width-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.fullWidth" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('loop-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.loop" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('show-arrows-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.showArrows" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('peek-slides-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.peekSlides" />
        </div>
        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('accent-bars-label') }}</UiFormLabel>
          <SfSwitch v-model="thumbContent.controls.accentBars" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('delay-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.autoplayDelay" type="number" min="200" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('speed-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.speed" type="number" min="100" class="input-field" />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-view-desktop-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.controls.slidesPerViewDesktop"
            type="number"
            min="1"
            max="8"
            class="input-field"
          />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-view-mobile-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.controls.slidesPerViewMobile"
            type="number"
            min="1"
            max="4"
            class="input-field"
          />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('slides-per-group-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.controls.slidesPerGroup"
            type="number"
            min="1"
            max="4"
            class="input-field"
          />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gap-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.tileGap" type="number" min="0" max="80" class="input-field" />
        </div>
        <div v-if="thumbContent.controls.peekSlides">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('side-peek-label') }}</UiFormLabel>
          <input
            v-model.number="thumbContent.controls.sidePeek"
            type="number"
            min="0"
            max="1.5"
            step="0.05"
            class="input-field"
          />
        </div>
        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-skew-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.tileSkew" type="number" min="-30" max="30" class="input-field" />
        </div>

        <div v-if="thumbContent.controls.showArrows">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('nav-height-label') }}</UiFormLabel>
          <input v-model.number="thumbContent.controls.navHeight" type="number" min="0" max="600" class="input-field" />
        </div>

        <div v-if="thumbContent.controls.showArrows">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('arrow-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.controls.arrowColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.controls.arrowColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <template v-if="thumbContent.controls.accentBars">
          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-color-label') }}</UiFormLabel>
            <EditorColorPicker v-model="thumbContent.controls.accentBarColor" class="w-full">
              <template #trigger="{ color, toggle }">
                <SfInput v-model="thumbContent.controls.accentBarColor" type="text" class="w-full">
                  <template #suffix>
                    <button
                      type="button"
                      class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                      :style="{ backgroundColor: color }"
                      @mousedown.stop
                      @click.stop="toggle"
                    />
                  </template>
                </SfInput>
              </template>
            </EditorColorPicker>
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-height-label') }}</UiFormLabel>
            <input
              v-model.number="thumbContent.controls.accentBarHeight"
              type="number"
              min="0"
              max="120"
              class="input-field"
            />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-width-label') }}</UiFormLabel>
            <input
              v-model.number="thumbContent.controls.accentBarWidth"
              type="number"
              min="0"
              max="100"
              class="input-field"
            />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-top-y-label') }}</UiFormLabel>
            <input v-model.number="thumbContent.controls.accentBarTopY" type="number" class="input-field" />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-top-x-label') }}</UiFormLabel>
            <input v-model.number="thumbContent.controls.accentBarTopX" type="number" class="input-field" />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-bottom-y-label') }}</UiFormLabel>
            <input v-model.number="thumbContent.controls.accentBarBottomY" type="number" class="input-field" />
          </div>

          <div>
            <UiFormLabel class="mb-1">{{ getEditorTranslation('accent-bar-bottom-x-label') }}</UiFormLabel>
            <input v-model.number="thumbContent.controls.accentBarBottomX" type="number" class="input-field" />
          </div>
        </template>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-text-align-label') }}</UiFormLabel>
          <select v-model="thumbContent.controls.tileTextAlign" class="input-field">
            <option value="left">{{ getEditorTranslation('alignment-left-label') }}</option>
            <option value="center">{{ getEditorTranslation('alignment-center-label') }}</option>
            <option value="right">{{ getEditorTranslation('alignment-right-label') }}</option>
          </select>
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-background-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.controls.tileBackgroundColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.controls.tileBackgroundColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div class="flex items-center justify-between">
          <UiFormLabel>{{ getEditorTranslation('tile-gradient-enabled-label') }}</UiFormLabel>
          <SfSwitch v-model="tileGradientState.enabled" />
        </div>

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-type-label') }}</UiFormLabel>
          <select v-model="tileGradientState.type" class="input-field">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-label') }}</UiFormLabel>
          <EditorColorPicker v-model="tileGradientState.startColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="tileGradientState.startColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div v-if="tileGradientState.enabled">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-end-label') }}</UiFormLabel>
          <EditorColorPicker v-model="tileGradientState.endColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="tileGradientState.endColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'linear'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-angle-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.angle" type="number" min="0" max="360" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-radius-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.radius" type="number" min="1" max="300" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-x-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.startX" type="number" min="0" max="100" class="input-field" />
        </div>

        <div v-if="tileGradientState.enabled && tileGradientState.type === 'radial'">
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-gradient-start-y-label') }}</UiFormLabel>
          <input v-model.number="tileGradientState.startY" type="number" min="0" max="100" class="input-field" />
        </div>

        <div>
          <UiFormLabel class="mb-1">{{ getEditorTranslation('tile-text-color-label') }}</UiFormLabel>
          <EditorColorPicker v-model="thumbContent.controls.tileTextColor" class="w-full">
            <template #trigger="{ color, toggle }">
              <SfInput v-model="thumbContent.controls.tileTextColor" type="text" class="w-full">
                <template #suffix>
                  <button
                    type="button"
                    class="border border-[#a0a0a0] rounded-lg cursor-pointer w-10 h-8"
                    :style="{ backgroundColor: color }"
                    @mousedown.stop
                    @click.stop="toggle"
                  />
                </template>
              </SfInput>
            </template>
          </EditorColorPicker>
        </div>

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {{ getEditorTranslation('tile-padding-label') }}
          </h3>
          <div>
            <UiFormLabel class="mb-1">Top</UiFormLabel>
            <input v-model.number="tilePaddingState.top" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Right</UiFormLabel>
            <input v-model.number="tilePaddingState.right" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Bottom</UiFormLabel>
            <input v-model.number="tilePaddingState.bottom" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Left</UiFormLabel>
            <input v-model.number="tilePaddingState.left" type="number" min="0" class="input-field" />
          </div>
        </div>

        <div class="rounded border p-3 space-y-2">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {{ getEditorTranslation('tile-text-padding-label') }}
          </h3>
          <div>
            <UiFormLabel class="mb-1">Top</UiFormLabel>
            <input v-model.number="tileTextPaddingState.top" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Right</UiFormLabel>
            <input v-model.number="tileTextPaddingState.right" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Bottom</UiFormLabel>
            <input v-model.number="tileTextPaddingState.bottom" type="number" min="0" class="input-field" />
          </div>
          <div>
            <UiFormLabel class="mb-1">Left</UiFormLabel>
            <input v-model.number="tileTextPaddingState.left" type="number" min="0" class="input-field" />
          </div>
        </div>
      </div>
    </UiAccordionItem>
  </div>
</template>

<script setup lang="ts">
import { SfInput, SfSwitch } from '@storefront-ui/vue';
import type { ThumbSliderNeoContent, ThumbSliderNeoFormProps } from './types';

const props = defineProps<ThumbSliderNeoFormProps>();

const { allBlocks: data } = useBlocks();
const { blockUuid } = useSiteConfiguration();
const { findOrDeleteBlockByUuid } = useBlockManager();
const { placeholderImg } = usePickerHelper();

const defaultSpacing = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

const normalizeGradient = (gradient?: Partial<ThumbSliderNeoContent['controls']['tileGradient']>) => ({
  enabled: gradient?.enabled === true,
  type: gradient?.type ?? 'linear',
  startColor: gradient?.startColor ?? '#1f2937',
  endColor: gradient?.endColor ?? '#0f172a',
  angle: gradient?.angle ?? 135,
  radius: gradient?.radius ?? 100,
  startX: gradient?.startX ?? 50,
  startY: gradient?.startY ?? 50,
});

const defaultContent = (): ThumbSliderNeoContent => ({
  header: {
    subline: '',
    headline: '',
    sublineAlignment: 'center',
    headlineAlignment: 'center',
    sublineColor: '#64748b',
    headlineColor: '#0f172a',
    sublineBackgroundColor: 'transparent',
    headlineBackgroundColor: 'transparent',
    sublineFontSize: 16,
    headlineFontSize: 46,
    sublineFontWeight: 500,
    headlineFontWeight: 700,
    backgroundColor: 'transparent',
    gradient: {
      enabled: false,
      type: 'linear',
      startColor: '#ffffff',
      endColor: '#f8fafc',
      angle: 180,
      radius: 100,
      startX: 50,
      startY: 50,
    },
    margin: defaultSpacing(),
    padding: defaultSpacing(),
  },
  items: [
    {
      image: placeholderImg,
      alt: 'Marke',
      link: '/',
      text: '',
    },
  ],
  controls: {
    fullWidth: true,
    autoplay: false,
    autoplayDelay: 3500,
    speed: 600,
    loop: true,
    showArrows: true,
    arrowColor: '#ffffff',
    accentBars: true,
    accentBarColor: '#d7ff00',
    accentBarHeight: 30,
    accentBarWidth: 32,
    accentBarTopY: 0,
    accentBarTopX: 24,
    accentBarBottomY: 0,
    accentBarBottomX: 0,
    navHeight: 173,
    peekSlides: false,
    sidePeek: 0.45,
    slidesPerViewDesktop: 5,
    slidesPerViewMobile: 2,
    slidesPerGroup: 1,
    tileGap: 8,
    tileSkew: -8,
    tileBackgroundColor: '#111827',
    tileTextColor: '#ffffff',
    tileTextAlign: 'left',
    tileGradient: {
      enabled: false,
      type: 'linear',
      startColor: '#1f2937',
      endColor: '#0f172a',
      angle: 135,
      radius: 100,
      startX: 50,
      startY: 50,
    },
    tilePadding: defaultSpacing(),
    tileTextPadding: defaultSpacing(),
    margin: defaultSpacing(),
    padding: defaultSpacing(),
  },
});

const thumbContent = computed<ThumbSliderNeoContent>(() => {
  const uuid = props.uuid || blockUuid.value;
  const rawContent = findOrDeleteBlockByUuid(data.value, uuid)?.content as Partial<ThumbSliderNeoContent> | undefined;

  if (!rawContent) return defaultContent();

  // Only set missing top-level sections (never replace the whole object — that causes an infinite reactive loop)
  if (!rawContent.header) rawContent.header = defaultContent().header;
  if (!Array.isArray(rawContent.items) || rawContent.items.length === 0) rawContent.items = defaultContent().items;
  if (!rawContent.controls) rawContent.controls = defaultContent().controls;

  // Header: fill individual missing properties only
  const h = rawContent.header;
  h.subline ??= '';
  h.headline ??= '';
  h.sublineAlignment ??= 'center';
  h.headlineAlignment ??= 'center';
  h.sublineColor ??= '#64748b';
  h.headlineColor ??= '#0f172a';
  h.sublineBackgroundColor ??= 'transparent';
  h.headlineBackgroundColor ??= 'transparent';
  h.sublineFontSize ??= 16;
  h.headlineFontSize ??= 46;
  h.sublineFontWeight ??= 500;
  h.headlineFontWeight ??= 700;
  h.sublineMarginBottom ??= 0;
  h.headlineMarginBottom ??= 0;
  h.backgroundColor ??= 'transparent';
  if (!h.gradient) h.gradient = normalizeGradient();
  if (!h.margin) h.margin = defaultSpacing();
  if (!h.padding) h.padding = defaultSpacing();

  // Items: fill individual missing properties only
  rawContent.items.forEach((item) => {
    item.image ??= '';
    item.alt ??= '';
    item.link ??= '/';
    item.text ??= '';
  });

  // Controls: fill individual missing properties only
  const c = rawContent.controls;
  c.fullWidth ??= true;
  c.autoplay ??= false;
  c.autoplayDelay ??= 3500;
  c.speed ??= 600;
  c.loop ??= true;
  c.showArrows ??= true;
  c.arrowColor ??= '#ffffff';
  c.accentBars ??= true;
  c.accentBarColor ??= '#d7ff00';
  c.accentBarHeight ??= 30;
  c.accentBarWidth ??= 32;
  c.accentBarTopY ??= 0;
  c.accentBarTopX ??= 24;
  c.accentBarBottomY ??= 0;
  c.accentBarBottomX ??= 0;
  c.navHeight ??= 173;
  c.peekSlides ??= false;
  c.sidePeek ??= 0.45;
  c.slidesPerViewDesktop ??= 5;
  c.slidesPerViewMobile ??= 2;
  c.slidesPerGroup ??= 1;
  c.tileGap ??= 8;
  c.tileSkew ??= -8;
  c.tileBackgroundColor ??= '#111827';
  c.tileTextColor ??= '#ffffff';
  c.tileTextAlign ??= 'left';
  if (!c.tileGradient) c.tileGradient = normalizeGradient();
  if (!c.tilePadding) c.tilePadding = defaultSpacing();
  if (!c.tileTextPadding) c.tileTextPadding = defaultSpacing();
  if (!c.margin) c.margin = defaultSpacing();
  if (!c.padding) c.padding = defaultSpacing();

  return rawContent as ThumbSliderNeoContent;
});

const headerOpen = ref(true);
const itemsOpen = ref(true);
const controlsOpen = ref(true);

// thumbContent always guarantees these are set — no writes needed inside computed
const tileGradientState = computed(() => thumbContent.value.controls.tileGradient ?? normalizeGradient());
const tilePaddingState = computed(() => thumbContent.value.controls.tilePadding ?? defaultSpacing());
const tileTextPaddingState = computed(() => thumbContent.value.controls.tileTextPadding ?? defaultSpacing());
const headerMarginState = computed(() => thumbContent.value.header.margin ?? defaultSpacing());
const headerPaddingState = computed(() => thumbContent.value.header.padding ?? defaultSpacing());

const addItem = () => {
  thumbContent.value.items.push({ image: placeholderImg, alt: '', link: '/', text: '' });
};

const removeItem = (index: number) => {
  thumbContent.value.items.splice(index, 1);
};

const onAddImage = ({ image }: { image: string }, index: number) => {
  const item = thumbContent.value.items[index];
  if (!item) return;
  item.image = image;
};

const onDeleteImage = (index: number) => () => {
  const item = thumbContent.value.items[index];
  if (!item) return;
  item.image = '';
};
</script>

<style scoped>
.action-btn {
  width: 100%;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  background: #f0fdf4;
}

.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
}
</style>

<i18n lang="json">
{
  "en": {
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-alignment-label": "Subline alignment",
    "headline-alignment-label": "Headline alignment",
    "alignment-left-label": "Left",
    "alignment-center-label": "Center",
    "alignment-right-label": "Right",
    "subline-color-label": "Subline color",
    "headline-color-label": "Headline color",
    "subline-background-label": "Subline background",
    "headline-background-label": "Headline background",
    "subline-font-size-label": "Subline font size (px)",
    "headline-font-size-label": "Headline font size (px)",
    "subline-font-weight-label": "Subline font weight",
    "headline-font-weight-label": "Headline font weight",
    "header-margin-label": "Header margin (top, right, bottom, left)",
    "header-padding-label": "Header padding (top, right, bottom, left)",
    "subline-margin-bottom-label": "Subline margin bottom (px)",
    "headline-margin-bottom-label": "Headline margin bottom (px)",
    "items-label": "Thumbs",
    "item-label": "Thumb",
    "add-item-label": "Add thumb",
    "remove-label": "Remove",
    "image-label": "Image",
    "alt-label": "Alt text",
    "link-label": "Link",
    "text-label": "Text below thumb",
    "controls-label": "Controls",
    "autoplay-label": "Autoplay",
    "full-width-label": "Full width",
    "loop-label": "Endless loop",
    "show-arrows-label": "Show arrows",
    "peek-slides-label": "Show cut-off side thumbs",
    "accent-bars-label": "Show accent bars",
    "delay-label": "Autoplay delay (ms)",
    "speed-label": "Slide speed (ms)",
    "slides-per-view-desktop-label": "Thumbs per view (desktop)",
    "slides-per-view-mobile-label": "Thumbs per view (mobile)",
    "slides-per-group-label": "Thumbs per slide",
    "tile-gap-label": "Thumb gap (px)",
    "side-peek-label": "Side cut-off amount",
    "tile-skew-label": "Thumb skew (deg)",
    "arrow-color-label": "Arrow color",
    "accent-bar-color-label": "Accent bar color",
    "accent-bar-height-label": "Accent bar height (px)",
    "accent-bar-width-label": "Accent bar width (%)",
    "accent-bar-top-y-label": "Accent bar top position Y (px)",
    "accent-bar-top-x-label": "Accent bar top position X (px, right)",
    "accent-bar-bottom-y-label": "Accent bar bottom position Y (px)",
    "accent-bar-bottom-x-label": "Accent bar bottom position X (px, left)",
    "nav-height-label": "Arrow background height (px)",
    "tile-text-align-label": "Thumb text alignment",
    "tile-background-label": "Thumb background",
    "tile-gradient-enabled-label": "Enable thumb gradient",
    "tile-gradient-type-label": "Thumb gradient type",
    "tile-gradient-start-label": "Thumb gradient start color",
    "tile-gradient-end-label": "Thumb gradient end color",
    "tile-gradient-angle-label": "Thumb gradient angle",
    "tile-gradient-radius-label": "Thumb gradient radius",
    "tile-gradient-start-x-label": "Thumb gradient start X",
    "tile-gradient-start-y-label": "Thumb gradient start Y",
    "tile-text-color-label": "Thumb text color",
    "tile-padding-label": "Thumb padding",
    "tile-text-padding-label": "Thumb text padding"
  },
  "de": {
    "header-label": "Header",
    "subline-label": "Subline",
    "headline-label": "Headline",
    "subline-alignment-label": "Subline Ausrichtung",
    "headline-alignment-label": "Headline Ausrichtung",
    "alignment-left-label": "Links",
    "alignment-center-label": "Zentriert",
    "alignment-right-label": "Rechts",
    "subline-color-label": "Subline Farbe",
    "headline-color-label": "Headline Farbe",
    "subline-background-label": "Subline Hintergrund",
    "headline-background-label": "Headline Hintergrund",
    "subline-font-size-label": "Subline Schriftgroesse (px)",
    "headline-font-size-label": "Headline Schriftgroesse (px)",
    "subline-font-weight-label": "Subline Font-Weight",
    "headline-font-weight-label": "Headline Font-Weight",
    "header-margin-label": "Header Margin (oben, rechts, unten, links)",
    "header-padding-label": "Header Padding (oben, rechts, unten, links)",
    "subline-margin-bottom-label": "Subline Abstand unten (px)",
    "headline-margin-bottom-label": "Headline Abstand unten (px)",
    "items-label": "Thumbs",
    "item-label": "Thumb",
    "add-item-label": "Thumb hinzufuegen",
    "remove-label": "Entfernen",
    "image-label": "Bild",
    "alt-label": "Alt-Text",
    "link-label": "Link",
    "text-label": "Text unter Thumb",
    "controls-label": "Steuerung",
    "autoplay-label": "Autoplay",
    "full-width-label": "Volle Breite",
    "loop-label": "Endlosschleife",
    "show-arrows-label": "Pfeile anzeigen",
    "peek-slides-label": "Seitliche Thumbs angeschnitten anzeigen",
    "accent-bars-label": "Schmuck-Balken anzeigen",
    "delay-label": "Autoplay Delay (ms)",
    "speed-label": "Slide Geschwindigkeit (ms)",
    "slides-per-view-desktop-label": "Thumbs sichtbar (Desktop)",
    "slides-per-view-mobile-label": "Thumbs sichtbar (Mobile)",
    "slides-per-group-label": "Thumbs pro Slide",
    "tile-gap-label": "Thumb-Abstand (px)",
    "side-peek-label": "Seitlicher Anschnitt",
    "tile-skew-label": "Thumb-Schraege (Grad)",
    "arrow-color-label": "Pfeilfarbe",
    "accent-bar-color-label": "Schmuck-Balken Farbe",
    "accent-bar-height-label": "Schmuck-Balken Hoehe (px)",
    "accent-bar-width-label": "Schmuck-Balken Breite (%)",
    "accent-bar-top-y-label": "Schmuck-Balken oben Position Y (px)",
    "accent-bar-top-x-label": "Schmuck-Balken oben Position X (px, rechts)",
    "accent-bar-bottom-y-label": "Schmuck-Balken unten Position Y (px)",
    "accent-bar-bottom-x-label": "Schmuck-Balken unten Position X (px, links)",
    "nav-height-label": "Pfeil-Hintergrund Hoehe (px)",
    "tile-text-align-label": "Thumb Textausrichtung",
    "tile-background-label": "Thumb Hintergrund",
    "tile-gradient-enabled-label": "Thumb Verlauf aktivieren",
    "tile-gradient-type-label": "Thumb Verlaufstyp",
    "tile-gradient-start-label": "Thumb Verlauf Startfarbe",
    "tile-gradient-end-label": "Thumb Verlauf Endfarbe",
    "tile-gradient-angle-label": "Thumb Verlauf Winkel",
    "tile-gradient-radius-label": "Thumb Verlauf Radius",
    "tile-gradient-start-x-label": "Thumb Verlauf Start X",
    "tile-gradient-start-y-label": "Thumb Verlauf Start Y",
    "tile-text-color-label": "Thumb Textfarbe",
    "tile-padding-label": "Thumb Padding",
    "tile-text-padding-label": "Thumb Text Padding"
  }
}
</i18n>
