import { orderGetters } from '@plentymarkets/shop-api';
import type { Order } from '@plentymarkets/shop-api';

export const OPENAI_COOKIE_NAME = 'CookieBar.marketing.cookies.openAi.name';
export const OPENAI_SCRIPT_ID = 'openai-measurement-pixel';
export const OPENAI_SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
export const OPENAI_PURCHASE_PREFIX = 'openai-purchase-tracked:';

type PixelCommand = (...args: unknown[]) => void;
type QueuedPixelCommand = PixelCommand & { q?: unknown[][] };

declare global {
  interface Window {
    oaiq?: QueuedPixelCommand;
  }
}

export type OpenAiPurchaseEvent = {
  data: {
    type: 'contents';
    amount: number;
    currency: string;
    contents: { id: string; quantity: number }[];
  };
  options: { event_id: string; opt_out: true };
};

export const toOpenAiMinorUnits = (value: unknown, currency: string): number | null => {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim()))
    return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || !/^[A-Z]{3}$/.test(currency)) return null;

  try {
    const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
    const minorUnits = Math.round((amount + Number.EPSILON) * 10 ** (digits ?? 2));
    return Number.isSafeInteger(minorUnits) ? minorUnits : null;
  } catch {
    return null;
  }
};

export const createOpenAiPurchaseEvent = (order: Order): OpenAiPurchaseEvent | null => {
  const sourceOrder = order?.order;
  if (!sourceOrder || !/^[1-9]\d*$/.test(String(sourceOrder.id ?? ''))) return null;
  // Only sales orders belong in purchase reporting, never returns or quotations.
  if (sourceOrder.typeId !== undefined && sourceOrder.typeId !== 1) return null;

  const totals = orderGetters.getTotals(order);
  if (!totals || !Array.isArray(sourceOrder.orderItems)) return null;
  const currency = orderGetters.getCurrency(order) || totals?.currency;
  const amount = toOpenAiMinorUnits(totals?.totalGross, currency || '');
  if (amount === null || !currency) return null;

  const contents = orderGetters
    .getItems(order)
    .filter((item) => item.typeId === 1 && !orderGetters.isBundleItem(item) && !orderGetters.isCouponItem(item))
    .map((item) => ({
      id: String(orderGetters.getItemVariationId(item)),
      quantity: orderGetters.getItemQty(item),
    }))
    .filter((item) => /^[1-9]\d*$/.test(item.id) && Number.isSafeInteger(item.quantity) && item.quantity > 0);

  return {
    data: { type: 'contents', amount, currency, contents },
    options: { event_id: `nubuk_order_${sourceOrder.id}`, opt_out: true },
  };
};

const removePixelCookies = () => {
  const hostname = window.location.hostname;
  const domains = ['', ...hostname.split('.').map((_, index, parts) => parts.slice(index).join('.'))];
  for (const name of ['__oppref', '__obref']) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`;
    }
  }
};

export const createOpenAiTracker = (pixelId: string, hasConsent: () => boolean) => {
  let sdkReady: Promise<boolean> | undefined;
  let initialized = false;
  const tracked = new Set<string>();
  const pending = new Set<string>();
  const allowed = () => Boolean(pixelId && hasConsent());

  const revoke = () => {
    window.oaiq?.('consent', false);
    removePixelCookies();
  };

  const loadSdk = () => {
    if (sdkReady) return sdkReady;
    sdkReady = new Promise<boolean>((resolve) => {
      if (!window.oaiq) {
        const queue: QueuedPixelCommand = (...args) => queue.q?.push(args);
        queue.q = [];
        window.oaiq = queue;
      }
      // The SDK is loaded only after an explicit grant. Reapply that grant
      // before init; denying here would erase attribution cookies on each page.
      window.oaiq('consent', true);
      const existing = document.getElementById(OPENAI_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing?.dataset.loaded === 'true') {
        resolve(true);
        return;
      }

      const script = existing || document.createElement('script');
      const timeout = window.setTimeout(() => finish(false), 10_000);
      const finish = (loaded: boolean) => {
        window.clearTimeout(timeout);
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        if (loaded) script.dataset.loaded = 'true';
        else {
          script.remove();
          sdkReady = undefined;
        }
        resolve(loaded);
      };
      const onLoad = () => finish(true);
      const onError = () => finish(false);
      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', onError, { once: true });
      if (!existing) {
        script.id = OPENAI_SCRIPT_ID;
        script.async = true;
        script.src = OPENAI_SDK_URL;
        const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;
        if (nonce) script.nonce = nonce;
        document.head.appendChild(script);
      }
    });
    return sdkReady;
  };

  const initialize = async () => {
    if (!allowed()) return false;
    if (!(await loadSdk()) || !allowed() || !window.oaiq) return false;
    if (!initialized) {
      window.oaiq('consent', true);
      window.oaiq('init', { pixelId });
      initialized = true;
    }
    window.oaiq('consent', true);
    return true;
  };

  const setConsent = async (granted: boolean) => {
    if (!granted || !allowed()) {
      revoke();
      return false;
    }
    try {
      return await initialize();
    } catch {
      return false;
    }
  };

  const trackPurchase = async (order: Order) => {
    if (!allowed()) return false;
    const event = createOpenAiPurchaseEvent(order);
    if (!event) return false;
    const id = event.options.event_id;
    if (tracked.has(id) || pending.has(id)) return false;
    try {
      if (window.sessionStorage.getItem(`${OPENAI_PURCHASE_PREFIX}${id}`) === '1') return false;
    } catch {
      // In-memory deduplication still works when browser storage is unavailable.
    }

    pending.add(id);
    try {
      if (!(await initialize()) || !allowed()) return false;
      window.oaiq?.('measureSingle', pixelId, 'order_created', event.data, event.options);
      tracked.add(id);
      try {
        window.sessionStorage.setItem(`${OPENAI_PURCHASE_PREFIX}${id}`, '1');
      } catch {
        // Tracking must never interrupt the order confirmation.
      }
      return true;
    } catch {
      return false;
    } finally {
      pending.delete(id);
    }
  };

  return { setConsent, trackPurchase };
};
