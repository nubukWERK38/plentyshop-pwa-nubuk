<template>
  <Teleport to="body">
    <div v-if="showFlags" id="flags" class="contact-flags" :style="flagsStyle">
      <div v-for="flag in visibleFlags" :key="`${flag.label}-${flag.link}`" class="contact-flags__item">
        <a class="contact-flags__link" :href="flag.link" :style="linkStyle">
          <svg
            v-if="resolveIconPaths(flag.icon)"
            class="contact-flags__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path v-for="path in resolveIconPaths(flag.icon)" :key="path" :d="path" />
          </svg>
          <span>{{ flag.label }}</span>
        </a>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { ContactFlagsContent, ContactFlagsProps } from './types';
import { createDefaultContactFlagsContent } from './defaults';

const props = defineProps<ContactFlagsProps>();
const { blocksConfigurationDrawerOpen } = useSiteConfiguration();

defineOptions({
  inheritAttrs: false,
});

const defaultContent = createDefaultContactFlagsContent();

const content = computed<ContactFlagsContent>(() => ({
  ...defaultContent,
  ...(props.content ?? {}),
  flags: props.content?.flags?.length ? props.content.flags : defaultContent.flags,
}));

const visibleFlags = computed(() =>
  content.value.flags.filter((flag) => flag.visible !== false && flag.label && flag.link),
);

const showFlags = computed(() => visibleFlags.value.length > 0 && !blocksConfigurationDrawerOpen.value);

const flagsStyle = computed<CSSProperties>(() => ({
  top: '310px',
}));

const resolveBackgroundColor = (color?: string) =>
  color?.toLowerCase() === '#212529' || !color ? 'var(--var-primary-grey)' : color;

const linkStyle = computed<CSSProperties>(() => ({
  backgroundColor: resolveBackgroundColor(content.value.backgroundColor),
  color: content.value.textColor || '#ffffff',
  '--contact-flags-icon-color': content.value.iconColor || '#ccff00',
}));

const contactFlagIcons: Record<string, string[]> = {
  envelope: ['M4 4h16v16H4z', 'm22 6-10 7L2 6'],
  undo: ['M3 7v6h6', 'M21 17a9 9 0 0 0-15-6.7L3 13'],
  truck: [
    'M4 6h10v12H4z',
    'M14 10h4l3 4v4h-3',
    'M6 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
    'M16 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  ],
};

const normalizeIcon = (icon?: string) =>
  icon
    ?.trim()
    .replace(/^fa[srbl]?\s+/, '')
    .replace(/^fa-/, '') || '';

const resolveIconPaths = (icon?: string) => {
  const normalizedIcon = normalizeIcon(icon);
  return normalizedIcon ? contactFlagIcons[normalizedIcon] : null;
};
</script>

<style scoped>
.contact-flags {
  position: fixed;
  right: 0;
  z-index: 999;
  display: none;
}

@media (min-width: 992px) {
  .contact-flags {
    display: block;
  }
}

.contact-flags__item + .contact-flags__item {
  margin-top: 2px;
}

.contact-flags__link {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 145px;
  min-height: 44px;
  padding: 0 18px;
  font-size: 16px;
  line-height: 1.2;
  text-decoration: none;
  transform: translateX(20px);
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.contact-flags__link:hover,
.contact-flags__link:focus-visible {
  background-color: var(--ci-dark);
  box-shadow: 0 8px 18px rgb(0 0 0 / 18%);
  transform: translateX(0);
  text-decoration: none;
}

.contact-flags__icon {
  width: 16px;
  color: var(--contact-flags-icon-color);
  text-align: center;
}
</style>
