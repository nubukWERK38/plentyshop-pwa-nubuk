import type { Order } from '@plentymarkets/shop-api';
import {
  BILLIGER_DE_COOKIE_NAME,
  createBilligerDePurchasePayload,
  createBilligerDePurchaseUrl,
  hasTrackedBilligerDePurchase,
  loadBilligerDeTrackingPixel,
  markBilligerDePurchaseTracked,
} from '~/utils/billigerDeTracking';

export const useBilligerDeTracking = () => {
  const { consent } = useCookieConsent(BILLIGER_DE_COOKIE_NAME);
  const config = useRuntimeConfig().public;

  const trackPurchase = (order: Order) => {
    if (!import.meta.client || !consent.value || !config.enableBilligerDeTracking) return false;

    const payload = createBilligerDePurchasePayload(order);
    if (!payload || hasTrackedBilligerDePurchase(sessionStorage, payload.orderId)) return false;

    const trackingUrl = createBilligerDePurchaseUrl(String(config.billigerDeTrackingUrl || ''), payload);
    if (!trackingUrl) return false;

    loadBilligerDeTrackingPixel(trackingUrl);
    markBilligerDePurchaseTracked(sessionStorage, payload.orderId);
    return true;
  };

  return {
    consent,
    trackPurchase,
  };
};
