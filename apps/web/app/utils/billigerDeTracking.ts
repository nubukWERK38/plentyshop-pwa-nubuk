import { orderGetters } from '@plentymarkets/shop-api';
import type { Order } from '@plentymarkets/shop-api';

export const BILLIGER_DE_COOKIE_NAME = 'CookieBar.marketing.cookies.billigerDe.name';
export const SOLUTE_CLICK_STORAGE_KEY = 'soluteclid';
export const BILLIGER_DE_PURCHASE_STORAGE_PREFIX = 'billiger-de-purchase-tracked:';
export const SOLUTE_TRACKING_TTL = 1000 * 60 * 60 * 24 * 30;
export const SOLUTE_LANDING_TRACKING_URL = 'https://cmodul.solutenetwork.com/landing';
export const SOLUTE_CONVERSION_TRACKING_URL = 'https://cmodul.solutenetwork.com/conversion';

type BilligerDePurchasePayload = {
  orderId: string;
  value: number;
  factor: string;
};

type SoluteClickStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const createSoluteOrderId = (orderId: string) => {
  if (typeof btoa !== 'function') return orderId;
  return btoa(encodeURIComponent(orderId));
};

export const createBilligerDePurchasePayload = (order: Order, factor = '1'): BilligerDePurchasePayload | null => {
  const orderId = orderGetters.getId(order);

  if (!orderId) return null;

  const totals = orderGetters.getTotals(order);
  const totalsRecord = totals as Record<string, unknown>;
  const value = roundCurrency(
    toNumber(totalsRecord.itemSumNet, toNumber(totalsRecord.totalNet) - toNumber(totalsRecord.shippingNet)),
  );

  return {
    orderId: createSoluteOrderId(String(orderId)),
    value,
    factor,
  };
};

export const containsSoluteClickId = (url: string) => url.includes('soluteclid');

export const createBilligerDeLandingUrl = (landingPageUrl: string) =>
  `${SOLUTE_LANDING_TRACKING_URL}?url=${encodeURIComponent(landingPageUrl)}`;

export const storeSoluteClick = (storage: Pick<Storage, 'setItem'>, landingPageUrl: string, timestamp = Date.now()) => {
  storage.setItem(SOLUTE_CLICK_STORAGE_KEY, `${timestamp} ${landingPageUrl}`);
};

export const getSoluteLandingPageUrl = (storage: SoluteClickStorage, timestamp = Date.now()) => {
  const storedClick = storage.getItem(SOLUTE_CLICK_STORAGE_KEY);

  if (!storedClick) return null;

  const [storedTimestamp, landingPageUrl] = storedClick.split(' ', 2);
  if (toNumber(storedTimestamp) + SOLUTE_TRACKING_TTL > timestamp) return landingPageUrl;

  storage.removeItem(SOLUTE_CLICK_STORAGE_KEY);
  return null;
};

export const createBilligerDeConversionUrl = (payload: BilligerDePurchasePayload, landingPageUrl: string) => {
  const params = new URLSearchParams({
    val: payload.value.toFixed(2),
    oid: payload.orderId,
    factor: payload.factor,
    url: landingPageUrl,
  });

  return `${SOLUTE_CONVERSION_TRACKING_URL}?${params.toString()}`;
};

export const hasTrackedBilligerDePurchase = (storage: Pick<Storage, 'getItem'>, orderId: string) =>
  storage.getItem(`${BILLIGER_DE_PURCHASE_STORAGE_PREFIX}${orderId}`) === '1';

export const markBilligerDePurchaseTracked = (storage: Pick<Storage, 'setItem'>, orderId: string) => {
  storage.setItem(`${BILLIGER_DE_PURCHASE_STORAGE_PREFIX}${orderId}`, '1');
};

export const sendBilligerDeTrackingRequest = (trackingUrl: string) => {
  const request = new XMLHttpRequest();
  request.open('GET', trackingUrl);
  request.send();
};
