import type { Order } from '@plentymarkets/shop-api';
import { OPENAI_COOKIE_NAME } from '~/utils/openAiTracking';

export const useOpenAiTracking = () => {
  const { consent } = useCookieConsent(OPENAI_COOKIE_NAME);
  const nuxtApp = useNuxtApp();

  const trackPurchase = async (order: Order) => {
    if (!import.meta.client || !consent.value) return false;
    return (await nuxtApp.$openAiTracking?.trackPurchase(order)) ?? false;
  };

  return { consent, trackPurchase };
};
