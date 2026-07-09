import { orderGetters } from '@plentymarkets/shop-api';
import type { Order } from '@plentymarkets/shop-api';

export const BILLIGER_DE_COOKIE_NAME = 'CookieBar.marketing.cookies.billigerDe.name';
export const BILLIGER_DE_PURCHASE_STORAGE_PREFIX = 'billiger-de-purchase-tracked:';

type BilligerDePurchasePayload = {
  orderId: string;
  value: number;
  currency: string;
  tax: number;
  shipping: number;
};

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const createBilligerDePurchasePayload = (order: Order): BilligerDePurchasePayload | null => {
  const orderId = orderGetters.getId(order);

  if (!orderId) return null;

  const totals = orderGetters.getTotals(order);
  const currency = orderGetters.getCurrency(order) || totals.currency || 'EUR';
  const tax = roundCurrency(
    orderGetters.getOriginalOrderVats(order).reduce((sum, vat) => sum + orderGetters.getOrderVatValue(vat), 0),
  );
  const shipping = roundCurrency(orderGetters.getOriginalShippingCost(order));
  const value = roundCurrency(toNumber(orderGetters.getTotal(totals)));

  return {
    orderId: String(orderId),
    value,
    currency,
    tax,
    shipping,
  };
};

export const createBilligerDePurchaseUrl = (trackingUrlTemplate: string, payload: BilligerDePurchasePayload) => {
  if (!trackingUrlTemplate) return '';

  const replacements: Record<string, string> = {
    orderId: payload.orderId,
    value: payload.value.toFixed(2),
    currency: payload.currency,
    tax: payload.tax.toFixed(2),
    shipping: payload.shipping.toFixed(2),
  };

  return Object.entries(replacements).reduce(
    (url, [key, value]) => url.replaceAll(`{${key}}`, encodeURIComponent(value)),
    trackingUrlTemplate,
  );
};

export const hasTrackedBilligerDePurchase = (storage: Pick<Storage, 'getItem'>, orderId: string) =>
  storage.getItem(`${BILLIGER_DE_PURCHASE_STORAGE_PREFIX}${orderId}`) === '1';

export const markBilligerDePurchaseTracked = (storage: Pick<Storage, 'setItem'>, orderId: string) => {
  storage.setItem(`${BILLIGER_DE_PURCHASE_STORAGE_PREFIX}${orderId}`, '1');
};

export const loadBilligerDeTrackingPixel = (trackingUrl: string) => {
  const pixel = new Image(1, 1);
  pixel.referrerPolicy = 'no-referrer-when-downgrade';
  pixel.src = trackingUrl;
};
