<template>
  <div data-testid="column-layout-structure" :class="getGridClasses()" :style="gridInlineStyle">
    <div
      v-for="(column, colIndex) in columns"
      :key="colIndex"
      :class="getColumnClasses(colIndex)"
      class="group/col relative"
      data-testid="column-layout-column"
    >
      <div
        v-for="row in column"
        :key="row.meta.uuid"
        class="group/row relative"
        :data-uuid="row.meta.uuid"
        @mouseenter="onRowEnter(row)"
        @mouseleave="onRowLeave"
      >
        <UiBlockPlaceholder v-if="shouldDisplayPlaceholder(row.meta.uuid, 'top', drawerOpen, drawerView)" />
        <ClientOnly>
          <template v-if="showOverlay(row)">
            <div
              class="editor-block-row-outline pointer-events-none absolute inset-0 opacity-0 group-hover/row:opacity-100"
            />

            <div
              class="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/row:opacity-100 bg-purple-600/15"
            />

            <div
              class="absolute inset-0 z-30 flex items-center justify-center opacity-0 invisible pointer-events-none group-hover/row:opacity-100 group-hover/row:visible group-hover/row:pointer-events-auto"
            >
              <UiBlockActions
                data-testid="column-layout-block-actions"
                :block="row"
                :index="colIndex"
                :actions="getBlockActions()"
              />
            </div>
          </template>
        </ClientOnly>

        <slot
          name="content"
          :content-block="row"
          :column-length="column.length"
          :is-row-hovered="showOverlay(row) && isRowHovered(row)"
        />
        <UiBlockPlaceholder v-if="shouldDisplayPlaceholder(row.meta.uuid, 'bottom', drawerOpen, drawerView)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Block } from '@plentymarkets/shop-api';
import type { ColumnLayoutProps } from '~/components/blocks/structure/ColumnLayout/types';

const props = defineProps<ColumnLayoutProps>();
const content = computed(() => (Array.isArray(props.content) ? props.content : []));
const configuration = computed(() => ({
  columns: props.configuration?.columns,
  columnWidths: Array.isArray(props.configuration?.columnWidths) ? props.configuration.columnWidths : [6, 6],
  layout: props.configuration?.layout,
}));

const hoveredRowUuid = ref<string | null>(null);
const { setHoveredBlock, clearHoveredBlock } = useTableOfContents();
const { shouldEnableEditorFeatures } = useEditorState();
const { isDragging, shouldDisplayPlaceholder } = useBlockManager();
const { siteConfigurationDrawerOpen, siteConfigurationDrawerView } = useSiteConfiguration();
const attrs = useAttrs() as { enableActions?: boolean };
const { getSetting: getBlockSize } = useSiteSettings('verticalBlockSize');
const blockSize = computed(() => getBlockSize());

const drawerOpen = computed(() => siteConfigurationDrawerOpen.value);
const drawerView = computed(() => siteConfigurationDrawerView.value);
const defaultMarginBottom = computed(() => getVerticalPixels(blockSize.value));

const onRowEnter = (row: Block) => {
  hoveredRowUuid.value = row.meta.uuid;
  setHoveredBlock(row.meta.uuid);
};

const onRowLeave = () => {
  hoveredRowUuid.value = null;
  clearHoveredBlock();
};

const isRowHovered = (row: Block) => hoveredRowUuid.value === row.meta.uuid;

const gapClassMap: Record<string, string> = {
  None: 'gap-x-0',
  S: 'gap-y-1 md:gap-x-1 md:gap-y-0',
  M: 'gap-y-2 md:gap-x-2 md:gap-y-0',
  L: 'gap-y-3 md:gap-x-3 md:gap-y-0',
  XL: 'gap-y-5 md:gap-x-5 md:gap-y-0',
};

const gridGapClass = computed(() => gapClassMap[configuration.value.layout?.gap || 'M']);

const clampColumnCount = (count: number) => {
  if (!Number.isFinite(count)) return 1;
  return Math.min(12, Math.max(1, Math.round(count)));
};

const splitIntoTwelve = (count: number) => {
  const normalizedCount = clampColumnCount(count);
  const base = Math.floor(12 / normalizedCount);
  const remainder = 12 % normalizedCount;

  return Array.from({ length: normalizedCount }, (_, index) => base + (index < remainder ? 1 : 0));
};

const normalizeWidthsToTwelve = (inputWidths: number[], count: number): number[] => {
  const normalizedCount = clampColumnCount(count);
  const candidate = inputWidths.slice(0, normalizedCount).map((width) => {
    if (!Number.isFinite(width)) return 0;
    return Math.max(0, Math.round(width));
  });

  while (candidate.length < normalizedCount) {
    candidate.push(0);
  }

  const total = candidate.reduce((sum, width) => sum + width, 0);

  if (total <= 0) {
    return splitIntoTwelve(normalizedCount);
  }

  const proportional = candidate.map((width) => (width / total) * 12);
  const floored = proportional.map((value) => Math.floor(value));
  let remainder = 12 - floored.reduce((sum, value) => sum + value, 0);

  const fractions = proportional
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < fractions.length && remainder > 0; index += 1) {
    const fraction = fractions[index];
    if (!fraction) continue;

    const targetIndex = fraction.index;
    floored[targetIndex] = (floored[targetIndex] ?? 0) + 1;
    remainder -= 1;
  }

  for (let index = 0; index < floored.length; index += 1) {
    const currentValue = floored[index] ?? 0;
    if (currentValue > 0) continue;

    const donorIndex = floored.findIndex((value) => value > 1);
    if (donorIndex === -1) break;

    const donorValue = floored[donorIndex] ?? 0;
    floored[donorIndex] = donorValue - 1;
    floored[index] = currentValue + 1;
  }

  return floored;
};

const columnCount = computed(() => {
  const configuredColumns = configuration.value.columns;
  if (Number.isFinite(configuredColumns)) return clampColumnCount(Number(configuredColumns));

  const byWidths = configuration.value.columnWidths?.length || 1;
  return clampColumnCount(byWidths);
});

const columnWidths = computed(() => normalizeWidthsToTwelve(configuration.value.columnWidths || [], columnCount.value));

const gridInlineStyle = computed(() => ({
  backgroundColor: configuration.value.layout?.backgroundColor ?? 'transparent',
  marginTop: configuration.value.layout?.marginTop !== undefined ? `${configuration.value.layout.marginTop}px` : '0px',
  marginRight:
    configuration.value.layout?.marginRight !== undefined ? `${configuration.value.layout.marginRight}px` : '0px',
  marginBottom:
    configuration.value.layout?.marginBottom !== undefined
      ? `${configuration.value.layout.marginBottom}px`
      : `${defaultMarginBottom.value}px`,
  marginLeft:
    configuration.value.layout?.marginLeft !== undefined ? `${configuration.value.layout.marginLeft}px` : '0px',
  paddingTop:
    configuration.value.layout?.paddingTop !== undefined ? `${configuration.value.layout.paddingTop}px` : '0px',
  paddingRight:
    configuration.value.layout?.paddingRight !== undefined ? `${configuration.value.layout.paddingRight}px` : '0px',
  paddingBottom:
    configuration.value.layout?.paddingBottom !== undefined ? `${configuration.value.layout.paddingBottom}px` : '0px',
  paddingLeft:
    configuration.value.layout?.paddingLeft !== undefined ? `${configuration.value.layout.paddingLeft}px` : '0px',
}));

const getGridClasses = () => {
  return gridClassFor({ mobile: 1, tablet: 12, desktop: 12 }, [gridGapClass.value ?? '', 'items-start']);
};

const getColumnClasses = (colIndex: number) => {
  return [`col-span-${columnWidths.value[colIndex] || 1}`, colIndex === 0 ? 'z-[2]' : 'z-[1]'];
};

const getBlockActions = () => ({
  isEditable: true,
  isMovable: false,
  isDeletable: false,
  classes: ['bg-purple-400', 'hover:bg-purple-500', 'transition'],
  buttonClasses: ['border-2', 'border-purple-600'],
  hoverBackground: ['hover:bg-purple-500'],
});

const enableActions = computed(() => attrs.enableActions === true);

const blockHasData = (block: Block): boolean => !!block.content && Object.keys(block.content).length > 0;
const isNestedStructureBlock = (block: Block): boolean => block.type === 'structure' && Array.isArray(block.content);

const showOverlay = computed(
  () => (block: Block) =>
    enableActions.value &&
    shouldEnableEditorFeatures.value &&
    !isDragging.value &&
    blockHasData(block) &&
    !isNestedStructureBlock(block),
);

const columns = computed<Block[][]>(() => {
  const slots = Array.from({ length: columnCount.value }, () => [] as Block[]);

  content.value.forEach((block) => {
    if (typeof block.parent_slot !== 'number') return;
    if (block.parent_slot < 0 || block.parent_slot >= columnCount.value) return;
    slots[block.parent_slot]!.push(block);
  });

  return slots;
});
</script>
