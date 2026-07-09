<template>
  <Teleport to="body">
    <div v-if="showFlags" id="flags" class="contact-flags" :style="flagsStyle">
      <div v-for="flag in visibleFlags" :key="`${flag.label}-${flag.link}`" class="contact-flags__item">
        <a class="contact-flags__link" :href="flag.link" :style="linkStyle">
          <FontAwesomeIcon v-if="resolveIcon(flag.icon)" class="contact-flags__icon" :icon="resolveIcon(flag.icon)" />
          <span>{{ flag.label }}</span>
        </a>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRotateLeft, faEnvelope, faTruck } from '@fortawesome/free-solid-svg-icons';
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

const contactFlagIcons: Record<string, IconDefinition> = {
  envelope: faEnvelope,
  'fa-envelope': faEnvelope,
  undo: faArrowRotateLeft,
  'fa-undo': faArrowRotateLeft,
  truck: faTruck,
  'fa-truck': faTruck,
};

const resolveIcon = (icon?: string) => {
  const normalizedIcon = icon?.trim().replace(/^fa\s+/, '');
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
