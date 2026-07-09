import type { Order } from '@plentymarkets/shop-api';
import {
  BILLIGER_DE_COOKIE_NAME,
  createBilligerDeConversionUrl,
  createBilligerDePurchasePayload,
  getSoluteLandingPageUrl,
  hasTrackedBilligerDePurchase,
  markBilligerDePurchaseTracked,
  sendBilligerDeTrackingRequest,
} from '~/utils/billigerDeTracking';

export const useBilligerDeTracking = () => {
  const { consent } = useCookieConsent(BILLIGER_DE_COOKIE_NAME);
  const config = useRuntimeConfig().public;

  const trackPurchase = (order: Order) => {
    if (!import.meta.client || !consent.value || !config.enableBilligerDeTracking) return false;

    const payload = createBilligerDePurchasePayload(order, String(config.billigerDeTrackingFactor || '1'));
    if (!payload || hasTrackedBilligerDePurchase(sessionStorage, payload.orderId)) return false;

    const landingPageUrl = getSoluteLandingPageUrl(localStorage);
    if (!landingPageUrl) return false;

    sendBilligerDeTrackingRequest(createBilligerDeConversionUrl(payload, landingPageUrl));
    markBilligerDePurchaseTracked(sessionStorage, payload.orderId);
    return true;
  };

  return {
    consent,
    trackPurchase,
  };
};
