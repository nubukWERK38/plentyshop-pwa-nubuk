import {
  BILLIGER_DE_COOKIE_NAME,
  containsSoluteClickId,
  createBilligerDeLandingUrl,
  sendBilligerDeTrackingRequest,
  storeSoluteClick,
} from '~/utils/billigerDeTracking';

export default defineNuxtPlugin({
  name: 'billiger-de-tracking',
  parallel: true,
  setup() {
    const config = useRuntimeConfig().public;
    if (!config.enableBilligerDeTracking) return;

    const { consent } = useCookieConsent(BILLIGER_DE_COOKIE_NAME);
    const trackLandingPage = () => {
      if (!consent.value || !containsSoluteClickId(location.href)) return;

      storeSoluteClick(localStorage, location.href);
      sendBilligerDeTrackingRequest(createBilligerDeLandingUrl(location.href));
    };

    trackLandingPage();

    watch(consent, (value) => {
      if (value) trackLandingPage();
    });
  },
});
