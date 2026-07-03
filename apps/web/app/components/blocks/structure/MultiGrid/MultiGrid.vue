<template>
  <div data-testid="multi-grid-structure" :class="getGridClasses()" :style="gridInlineStyle">
    <div
      v-for="(column, colIndex) in columns"
      :key="colIndex"
      :class="getColumnClasses(colIndex)"
      :style="columnInlineStyle"
      class="multi-grid__column group/col relative z-[1]"
      data-testid="multi-grid-column"
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
const gridGapValue = computed(() => {
  if (isTwoByTwoImageTeaserGrid.value) {
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
    configuration.layout?.marginBottom !== undefined ? `${configuration.layout.marginBottom}px` : defaultSectionSpacing,
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
  alignItems: horizontalAlignmentMap[configuration.layout?.horizontalAlignment || 'left'],
  justifyContent: verticalAlignmentMap[configuration.layout?.verticalAlignment || 'top'],
}));
const getGridClasses = () => {
  if (isTwoByTwoImageTeaserGrid.value) {
    return gridClassFor({ mobile: 1, tablet: 2, desktop: 2 }, ['items-stretch']);
  }

  return gridClassFor({ mobile: 1, tablet: 12, desktop: 12 }, ['items-stretch']);
};

const getColumnClasses = (colIndex: number) => {
  if (isTwoByTwoImageTeaserGrid.value) {
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
  const blocks = ref([] as Block[][]);
  pairWithSlots.value.forEach((block) => {
    if (block.parent_slot !== undefined) {
      if (!blocks.value[block.parent_slot]) {
        blocks.value[block.parent_slot] = [];
      }

      const slot = blocks.value[block.parent_slot];
      if (slot) {
        slot.push(block);
      }
    }
  });
  return blocks.value;
});
</script>

<style scoped>
.multi-grid__column {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
</style>
