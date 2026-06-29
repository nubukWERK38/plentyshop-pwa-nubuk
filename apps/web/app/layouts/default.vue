<template>
  <div>
    <UiHeaderBlocks />

    <NarrowContainer v-if="showLayoutBreadcrumbs" class="p-4 md:px-0">
      <LazyUiBreadcrumbs :breadcrumbs="layoutBreadcrumbs" />
    </NarrowContainer>
    <main>
      <slot />
    </main>
    <UiNavbarBottom v-if="viewport.isLessThan('lg')" />
    <Cookiebar />
    <PreviewMode />
    <UiFooterBlocks />
    <QuickCheckout v-if="isOpen" :product="product" />
  </div>
</template>

<script setup lang="ts">
import type { Breadcrumb } from '~/components/ui/Breadcrumbs/types';
import type { DefaultLayoutProps } from '~/layouts/types';

const props = defineProps<DefaultLayoutProps>();

const { setLogoMeta } = useStructuredData();
const { isOpen, product } = useQuickCheckout();
const viewport = useViewport();
const route = useRoute();
const layoutBreadcrumbs = computed<Breadcrumb[]>(() => props.breadcrumbs ?? []);
const showLayoutBreadcrumbs = computed(
  () => layoutBreadcrumbs.value.length > 0 && !(route.meta.type === 'category' && route.meta.isBlockified),
);
setLogoMeta();
</script>
