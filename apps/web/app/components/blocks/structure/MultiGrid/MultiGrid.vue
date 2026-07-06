<template>
  <div
    data-testid="multi-grid-structure"
    :class="[
      getGridClasses(),
      {
        'multi-grid--image-teaser-2x2': isTwoByTwoImageTeaserGrid,
        'multi-grid--image-text-row': isTwoColumnImageTextBoxRow,
      },
    ]"
    :style="gridInlineStyle"
  >
    <div
      v-for="(column, colIndex) in columns"
      :key="colIndex"
      :class="getColumnClasses(colIndex)"
      :style="columnInlineStyle"
      class="multi-grid__column group/col relative z-[1]"
      data-testid="multi-grid-column"
    >
      <div
        v-for="(row, rowIndex) in column"
        :key="row.meta.uuid"
        class="group/row relative"
        :class="{
          'multi-grid__row--image-teaser-2x2': isTwoByTwoImageTeaserGrid,
          'multi-grid__row--image-text-row': isTwoColumnImageTextBoxRow,
        }"
        :style="getRowInlineStyle(colIndex, rowIndex)"
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
                data-testid="multigrid-block-actions"
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
import type { AlignableBlock, MultiGridProps } from '~/components/blocks/structure/MultiGrid/types';
import type { Block } from '@plentymarkets/shop-api';

const { content, configuration } = defineProps<MultiGridProps>();
const route = useRoute();

const hoveredRowUuid = ref<string | null>(null);
const { setHoveredBlock, clearHoveredBlock } = useTableOfContents();

const onRowEnter = (row: Block) => {
  hoveredRowUuid.value = row.meta.uuid;
  setHoveredBlock(row.meta.uuid);
};
const onRowLeave = () => {
  hoveredRowUuid.value = null;
  clearHoveredBlock();
};
const isRowHovered = (row: Block) => hoveredRowUuid.value === row.meta.uuid;

const { shouldEnableEditorFeatures } = useEditorState();
const { isDragging, shouldDisplayPlaceholder } = useBlockManager();
const { siteConfigurationDrawerOpen, siteConfigurationDrawerView } = useSiteConfiguration();
const attrs = useAttrs() as { enableActions?: boolean; root?: boolean };

const drawerOpen = computed(() => siteConfigurationDrawerOpen.value);
const drawerView = computed(() => siteConfigurationDrawerView.value);

const gapPxMap: Record<string, number> = {
  None: 0,
  S: 4,
  M: 8,
  L: 12,
  XL: 20,
};
const defaultGridGap = 8;
const baseGapPixels = computed<number>(() => gapPxMap[configuration.layout?.gap || 'M'] ?? defaultGridGap);
const isTwoByTwoImageTeaserGrid = computed(() => {
  if (configuration.columnWidths?.length !== 2) return false;
  const columnCounts = columns.value.map((column) => column.length);

  return columnCounts.length === 2 && columnCounts.every((count) => count === 2);
});
const isTwoColumnImageTextBoxRow = computed(() => {
  if (configuration.columnWidths?.length !== 2) return false;
  if (columns.value.length !== 2) return false;

  return columns.value.every((column) => column.length === 1 && column[0]?.name === 'ImageTextBox');
});
const gridGapValue = computed(() => {
  if (isTwoByTwoImageTeaserGrid.value || isTwoColumnImageTextBoxRow.value) {
    return 'var(--ci-teaser-grid-gap)';
  }

  return `${baseGapPixels.value}px`;
});
const defaultSectionSpacing = 'var(--ci-section-spacing)';

const gradientBackground = computed(() => {
  if (configuration.layout?.gradientEnabled !== true) return undefined;

  const startColor = configuration.layout.gradientStartColor || '#ffffff';
  const endColor = configuration.layout.gradientEndColor || '#f3f4f6';

  if (configuration.layout.gradientType === 'radial') {
    const radius = configuration.layout.gradientRadius ?? 100;
    const x = configuration.layout.gradientStartX ?? 50;
    const y = configuration.layout.gradientStartY ?? 50;
    return `radial-gradient(circle ${radius}% at ${x}% ${y}%, ${startColor}, ${endColor})`;
  }

  return `linear-gradient(${configuration.layout?.gradientAngle ?? 180}deg, ${startColor}, ${endColor})`;
});

const gridInlineStyle = computed(() => ({
  background: gradientBackground.value,
  backgroundColor: configuration.layout?.gradientEnabled
    ? undefined
    : (configuration.layout?.backgroundColor ?? 'transparent'),
  gap: gridGapValue.value,
  marginTop:
    configuration.layout?.marginTop !== undefined ? `${configuration.layout.marginTop}px` : defaultSectionSpacing,
  marginRight: configuration.layout?.marginRight !== undefined ? `${configuration.layout.marginRight}px` : '0px',
  marginBottom:
    isTwoColumnImageTextBoxRow.value && configuration.layout?.marginBottom
      ? gridGapValue.value
      : configuration.layout?.marginBottom !== undefined
        ? `${configuration.layout.marginBottom}px`
        : defaultSectionSpacing,
  marginLeft: configuration.layout?.marginLeft !== undefined ? `${configuration.layout.marginLeft}px` : '0px',
  paddingTop: isTwoByTwoImageTeaserGrid.value
    ? gridGapValue.value
    : configuration.layout?.paddingTop !== undefined
      ? `${configuration.layout.paddingTop}px`
      : '0px',
  paddingRight: configuration.layout?.paddingRight !== undefined ? `${configuration.layout.paddingRight}px` : '0px',
  paddingBottom: isTwoByTwoImageTeaserGrid.value
    ? gridGapValue.value
    : configuration.layout?.paddingBottom !== undefined
      ? `${configuration.layout.paddingBottom}px`
      : '0px',
  paddingLeft: configuration.layout?.paddingLeft !== undefined ? `${configuration.layout.paddingLeft}px` : '0px',
}));

const horizontalAlignmentMap: Record<string, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const verticalAlignmentMap: Record<string, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const columnInlineStyle = computed(() => ({
  rowGap: gridGapValue.value,
  alignItems:
    isTwoByTwoImageTeaserGrid.value || isTwoColumnImageTextBoxRow.value
      ? 'stretch'
      : horizontalAlignmentMap[configuration.layout?.horizontalAlignment || 'left'],
  justifyContent:
    isTwoByTwoImageTeaserGrid.value || isTwoColumnImageTextBoxRow.value
      ? 'stretch'
      : verticalAlignmentMap[configuration.layout?.verticalAlignment || 'top'],
}));
const getGridClasses = () => {
  if (isTwoByTwoImageTeaserGrid.value || isTwoColumnImageTextBoxRow.value) {
    return gridClassFor({ mobile: 1, tablet: 2, desktop: 2 }, ['items-stretch']);
  }

  return gridClassFor({ mobile: 1, tablet: 12, desktop: 12 }, ['items-stretch']);
};

const getColumnClasses = (colIndex: number) => {
  if (isTwoByTwoImageTeaserGrid.value || isTwoColumnImageTextBoxRow.value) {
    return [];
  }

  const columnWidth = configuration.columnWidths[colIndex];
  const classes = [`col-span-${columnWidth}`];

  if (Array.isArray(configuration.sticky) && configuration.sticky.includes(colIndex)) {
    classes.push('md:sticky');

    const topValue = route.meta?.type === 'product' ? 'md:top-40' : 'md:top-5';
    classes.push(topValue);
  }

  return classes;
};

const getRowInlineStyle = (colIndex: number, rowIndex: number) => {
  if (!isTwoByTwoImageTeaserGrid.value) return undefined;

  return {
    '--mg-col': `${colIndex + 1}`,
    '--mg-row': `${rowIndex + 1}`,
  };
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

const isAlignable = (b: Block): b is AlignableBlock =>
  typeof b.content === 'object' && b.content !== null && ('imageAlignment' in b.content || 'alignment' in b.content);

const readAlignment = (block: AlignableBlock): 'left' | 'right' | undefined => {
  const a = block.content?.imageAlignment ?? block.content?.alignment;
  return a === 'left' || a === 'right' ? a : undefined;
};

const pairWithSlots = computed<Block[]>(() => {
  const list = content.map((block) => ({ ...block }));

  const alignableIndex = list.findIndex(isAlignable);

  if (alignableIndex === -1) return list;

  const alignment = readAlignment(list[alignableIndex] as AlignableBlock);
  if (!alignment) return list;

  const selfSlot = alignment === 'right' ? 1 : 0;
  const sibling = alignableIndex === 0 ? 1 : 0;

  list[alignableIndex] = { ...list[alignableIndex], parent_slot: selfSlot } as Block;
  list[sibling] = { ...list[sibling], parent_slot: 1 - selfSlot } as Block;

  return list;
});

const columns = computed<Block[][]>(() => {
  const columnCount = configuration.columnWidths?.length || 0;
  const blocks = Array.from({ length: columnCount }, () => [] as Block[]);

  pairWithSlots.value.forEach((block) => {
    if (typeof block.parent_slot !== 'number') return;
    if (block.parent_slot < 0 || block.parent_slot >= columnCount) return;

    blocks[block.parent_slot]?.push(block);
  });

  return blocks;
});
</script>

<style scoped>
.multi-grid__column {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.multi-grid--image-teaser-2x2 .multi-grid__column {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.multi-grid__row--image-teaser-2x2 {
  display: flex;
  min-height: 0;
}

.multi-grid__row--image-teaser-2x2 :deep(.image-text-box) {
  display: flex;
  width: 100%;
}

.multi-grid__row--image-teaser-2x2 :deep(.image-text-box > *) {
  flex: 1 1 auto;
  width: 100%;
}

.multi-grid__row--image-teaser-2x2 :deep(.image-text-box img) {
  height: 100%;
  object-fit: cover;
}

.multi-grid--image-text-row .multi-grid__column {
  min-width: 0;
}

.multi-grid__row--image-text-row {
  display: flex;
  width: 100%;
  min-width: 0;
  aspect-ratio: 16 / 9;
}

.multi-grid__row--image-text-row :deep(> *),
.multi-grid__row--image-text-row :deep(.h-full),
.multi-grid__row--image-text-row :deep(.block-wrapper),
.multi-grid__row--image-text-row :deep(.image-text-box),
.multi-grid__row--image-text-row :deep(.image-text-box > div),
.multi-grid__row--image-text-row :deep(.image-text-box [class*='overflow-hidden']) {
  width: 100%;
  height: 100% !important;
  min-width: 0;
  min-height: 0 !important;
}

.multi-grid__row--image-text-row :deep(.image-text-box img) {
  width: 100%;
  height: 100% !important;
  object-fit: cover;
}

.multi-grid__row--image-text-row :deep(.image-text-box .absolute) {
  height: auto !important;
}

@media (min-width: 768px) {
  .multi-grid--image-teaser-2x2 {
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .multi-grid--image-teaser-2x2 .multi-grid__column {
    display: contents;
  }

  .multi-grid__row--image-teaser-2x2 {
    grid-column: var(--mg-col);
    grid-row: var(--mg-row);
    width: 100%;
    height: 100%;
  }

  .multi-grid__row--image-teaser-2x2 :deep(> *),
  .multi-grid__row--image-teaser-2x2 :deep(.h-full),
  .multi-grid__row--image-teaser-2x2 :deep(.block-wrapper),
  .multi-grid__row--image-teaser-2x2 :deep(.image-banner-neo),
  .multi-grid__row--image-teaser-2x2 :deep(.image-banner-neo__swiper),
  .multi-grid__row--image-teaser-2x2 :deep(.image-banner-neo__swiper-slide),
  .multi-grid__row--image-teaser-2x2 :deep(.image-banner-neo__slide),
  .multi-grid__row--image-teaser-2x2 :deep([data-testid='image-block']),
  .multi-grid__row--image-teaser-2x2 :deep([data-testid='image-text-box']) {
    width: 100%;
    height: 100% !important;
    min-height: 0 !important;
    max-height: none !important;
  }
}
</style>
