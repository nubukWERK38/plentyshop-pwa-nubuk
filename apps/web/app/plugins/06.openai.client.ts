import { createOpenAiTracker, OPENAI_COOKIE_NAME } from '~/utils/openAiTracking';

export default defineNuxtPlugin({
  name: 'openai-tracking',
  setup() {
    const config = useRuntimeConfig().public;
    const { consent } = useCookieConsent(OPENAI_COOKIE_NAME);
    const tracker = createOpenAiTracker(String(config.openAiPixelId || ''), () =>
      Boolean(config.enableOpenAiTracking && consent.value),
    );

    watch(consent, (granted) => void tracker.setConsent(granted), { immediate: true, flush: 'sync' });

    return { provide: { openAiTracking: tracker } };
  },
});
