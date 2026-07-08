import type { Order } from '@plentymarkets/shop-api';
import {
  createPurchasePayload,
  GTM_COOKIE_NAME,
  hasTrackedPurchase,
  markPurchaseTracked,
  pushEcommerceEvent,
} from '~/utils/gtmTracking';

export const useGtmTracking = () => {
  const { consent } = useCookieConsent(GTM_COOKIE_NAME);

  const trackPurchase = (order: Order) => {
    if (!import.meta.client || !consent.value) return false;

    const payload = createPurchasePayload(order);
    if (!payload || hasTrackedPurchase(sessionStorage, payload.transaction_id)) return false;

    pushEcommerceEvent(payload);
    markPurchaseTracked(sessionStorage, payload.transaction_id);
    return true;
  };

  return {
    consent,
    trackPurchase,
  };
};
