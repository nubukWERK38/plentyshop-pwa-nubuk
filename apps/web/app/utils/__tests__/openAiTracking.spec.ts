import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@plentymarkets/shop-api';
import {
  createOpenAiPurchaseEvent,
  createOpenAiTracker,
  OPENAI_SCRIPT_ID,
  OPENAI_SDK_URL,
  toOpenAiMinorUnits,
} from '../openAiTracking';

const createOrder = (): Order =>
  ({
    order: {
      id: 12345,
      typeId: 1,
      amounts: [{ currency: 'EUR', isSystemCurrency: true }],
      orderItems: [
        { typeId: 1, itemVariationId: 574055, quantity: 2 },
        { typeId: 6, itemVariationId: 0, quantity: 1 },
      ],
    },
    totals: { totalGross: 1923.95, totalNet: 1616.76, currency: 'EUR', isNet: false },
  }) as unknown as Order;

describe('OpenAI purchase values', () => {
  it('converts monetary values to currency minor units without a factor-of-100 error', () => {
    expect(toOpenAiMinorUnits(1899, 'EUR')).toBe(189900);
    expect(toOpenAiMinorUnits(0.29, 'EUR')).toBe(29);
    expect(toOpenAiMinorUnits(12999, 'JPY')).toBe(12999);
    expect(toOpenAiMinorUnits(1.234, 'KWD')).toBe(1234);
  });

  it.each([undefined, null, '', 'bad', -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid order values: %s',
    (amount) => expect(toOpenAiMinorUnits(amount, 'EUR')).toBeNull(),
  );

  it('uses the actual gross order total and feed variant IDs, excluding shipping rows', () => {
    expect(createOpenAiPurchaseEvent(createOrder())).toEqual({
      data: { type: 'contents', amount: 192395, currency: 'EUR', contents: [{ id: '574055', quantity: 2 }] },
      options: { event_id: 'nubuk_order_12345', opt_out: true },
    });
  });

  it('never reports returns or orders with missing IDs or totals as purchases', () => {
    const order = createOrder();
    order.order.typeId = 4;
    expect(createOpenAiPurchaseEvent(order)).toBeNull();
    expect(createOpenAiPurchaseEvent({ order: {} } as Order)).toBeNull();
    expect(createOpenAiPurchaseEvent({ order: { id: 12345 } } as Order)).toBeNull();
  });
});

describe('OpenAI consent and event delivery', () => {
  let consent: boolean;
  let sdkCommands: unknown[][];
  let script: HTMLScriptElement | undefined;

  beforeEach(() => {
    consent = false;
    sdkCommands = [];
    script = undefined;
    delete window.oaiq;
    window.sessionStorage.clear();
    document.getElementById(OPENAI_SCRIPT_ID)?.remove();
    vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
      script = node as unknown as HTMLScriptElement;
      return node;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.oaiq;
  });

  const completeSdkLoad = () => {
    sdkCommands.push(...(window.oaiq?.q || []));
    window.oaiq = (...args: unknown[]) => sdkCommands.push(args);
    script?.dispatchEvent(new Event('load'));
  };

  it('does not load the SDK or send purchases without explicit consent', async () => {
    const tracker = createOpenAiTracker('test-pixel', () => consent);
    expect(await tracker.setConsent(false)).toBe(false);
    expect(await tracker.trackPurchase(createOrder())).toBe(false);
    expect(document.head.appendChild).not.toHaveBeenCalled();
    expect(window.oaiq).toBeUndefined();
  });

  it('uses the explicit grant before init and sends one purchase for concurrent callbacks', async () => {
    consent = true;
    const tracker = createOpenAiTracker('test-pixel', () => consent);
    const first = tracker.trackPurchase(createOrder());
    const second = tracker.trackPurchase(createOrder());
    expect(script?.src).toBe(OPENAI_SDK_URL);
    expect(window.oaiq?.q?.[0]).toEqual(['consent', true]);
    completeSdkLoad();

    expect(await first).toBe(true);
    expect(await second).toBe(false);
    expect(await tracker.trackPurchase(createOrder())).toBe(false);
    expect(sdkCommands.filter((args) => args[0] === 'measureSingle')).toEqual([
      [
        'measureSingle',
        'test-pixel',
        'order_created',
        createOpenAiPurchaseEvent(createOrder())?.data,
        { event_id: 'nubuk_order_12345', opt_out: true },
      ],
    ]);
    const initIndex = sdkCommands.findIndex((args) => args[0] === 'init');
    expect(sdkCommands[initIndex - 1]).toEqual(['consent', true]);
    expect(sdkCommands.some((args) => args[0] === 'consent' && args[1] === false)).toBe(false);
    expect(sdkCommands[initIndex + 1]).toEqual(['consent', true]);
    consent = false;
    await tracker.setConsent(false);
    expect(sdkCommands.at(-1)).toEqual(['consent', false]);
    expect(await tracker.trackPurchase(createOrder())).toBe(false);
  });

  it('cancels a pending purchase if consent is withdrawn before the SDK finishes loading', async () => {
    consent = true;
    const tracker = createOpenAiTracker('test-pixel', () => consent);
    const result = tracker.trackPurchase(createOrder());
    consent = false;
    await tracker.setConsent(false);
    completeSdkLoad();
    expect(await result).toBe(false);
    expect(sdkCommands.some((args) => args[0] === 'measureSingle')).toBe(false);
  });

  it('keeps confirmation usable after a script error and allows retrying', async () => {
    consent = true;
    const tracker = createOpenAiTracker('test-pixel', () => consent);
    const failed = tracker.trackPurchase(createOrder());
    script?.dispatchEvent(new Event('error'));
    expect(await failed).toBe(false);
    const retry = tracker.trackPurchase(createOrder());
    completeSdkLoad();
    expect(await retry).toBe(true);
  });

  it('still sends only once when browser storage is blocked', async () => {
    consent = true;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const tracker = createOpenAiTracker('test-pixel', () => consent);
    const first = tracker.trackPurchase(createOrder());
    completeSdkLoad();
    expect(await first).toBe(true);
    expect(await tracker.trackPurchase(createOrder())).toBe(false);
  });
});
