import type { Order } from '@plentymarkets/shop-api';
import {
  createPurchasePayload,
  hasTrackedPurchase,
  markPurchaseTracked,
  PURCHASE_STORAGE_PREFIX,
} from '../gtmTracking';
import {
  BILLIGER_DE_PURCHASE_STORAGE_PREFIX,
  SOLUTE_CLICK_STORAGE_KEY,
  createBilligerDeConversionUrl,
  createBilligerDeLandingUrl,
  createBilligerDePurchasePayload,
  getSoluteLandingPageUrl,
  hasTrackedBilligerDePurchase,
  markBilligerDePurchaseTracked,
  storeSoluteClick,
} from '../billigerDeTracking';

const createOrder = (): Order =>
  ({
    order: {
      id: 644506,
      amounts: [
        {
          id: 619859,
          orderId: 644506,
          isSystemCurrency: true,
          isNet: false,
          currency: 'EUR',
          exchangeRate: 1,
          netTotal: 4.16,
          grossTotal: 4.95,
          vatTotal: 0.79,
          invoiceTotal: 4.95,
          paidAmount: 0,
          giftCardAmount: 0,
          createdAt: '2026-07-08T11:11:25+02:00',
          updatedAt: '2026-07-08T11:11:25+02:00',
          shippingCostsGross: 0,
          shippingCostsNet: 0,
          taxlessAmount: 0,
          prepaidAmount: 0,
          vats: [
            {
              id: 537131,
              orderAmountId: 619859,
              countryVatId: 1,
              vatField: 0,
              vatRate: 19,
              value: 0.79,
              createdAt: '2026-07-08T11:11:25+02:00',
              updatedAt: '2026-07-08T11:11:25+02:00',
              netTotal: 4.16,
              grossTotal: 4.95,
            },
          ],
        },
      ],
      orderItems: [
        {
          id: 1850389,
          orderId: 644506,
          typeId: 1,
          referrerId: 1,
          itemVariationId: 147604,
          quantity: 1,
          orderItemName: 'Klingel Kl2',
          attributeValues: null,
          shippingProfileId: 4,
          countryVatId: 1,
          vatField: 0,
          vatRate: 19,
          position: '0',
          createdAt: '2026-07-08T11:11:24+02:00',
          updatedAt: '2026-07-08T11:11:24+02:00',
          warehouseId: 19,
          orderProperties: [],
          properties: [],
          dates: [],
          amounts: [
            {
              id: 1867856,
              orderItemId: 1850389,
              isSystemCurrency: true,
              currency: 'EUR',
              exchangeRate: 1,
              priceOriginalGross: 4.95,
              priceOriginalNet: 4.1597,
              priceGross: 4.95,
              priceNet: 4.1597,
              surcharge: 0,
              discount: 0,
              isPercentage: true,
              createdAt: '2026-07-08T11:11:24+02:00',
              updatedAt: '2026-07-08T11:11:24+02:00',
            },
          ],
          references: [],
        },
        {
          id: 1850390,
          orderId: 644506,
          typeId: 6,
          referrerId: 1,
          itemVariationId: 0,
          quantity: 1,
          orderItemName: 'shipping costs',
          attributeValues: null,
          shippingProfileId: 0,
          countryVatId: 1,
          vatField: 0,
          vatRate: 19,
          position: '0',
          createdAt: '2026-07-08T11:11:25+02:00',
          updatedAt: '2026-07-08T11:11:25+02:00',
          warehouseId: null,
          orderProperties: [],
          properties: [],
          dates: [],
          amounts: [
            {
              id: 1867857,
              orderItemId: 1850390,
              isSystemCurrency: true,
              currency: 'EUR',
              exchangeRate: 1,
              priceOriginalGross: 0,
              priceOriginalNet: 0,
              priceGross: 0,
              priceNet: 0,
              surcharge: 0,
              discount: 0,
              isPercentage: true,
              createdAt: '2026-07-08T11:11:25+02:00',
              updatedAt: '2026-07-08T11:11:25+02:00',
            },
          ],
          references: [],
        },
      ],
    },
    totals: {
      itemSumGross: 4.95,
      itemSumNet: 4.16,
      itemSumRebateGross: 0,
      itemSumRebateNet: 0,
      shippingGross: 0,
      shippingNet: 0,
      vats: [{ rate: 19, value: 0.79 }],
      couponValue: 0,
      openAmount: 4.95,
      couponType: '',
      couponCode: '',
      totalGross: 4.95,
      totalNet: 4.16,
      currency: 'EUR',
      isNet: false,
      additionalCosts: [],
      additionalCostsWithTax: [],
      subAmount: 4.95,
      promotionalCouponsValue: 0,
      giftCardsValue: 0,
      paidAmount: 0,
    },
  }) as unknown as Order;

describe('gtmTracking', () => {
  it('creates a purchase payload from an order and excludes shipping items', () => {
    const payload = createPurchasePayload(createOrder());

    expect(payload).toMatchObject({
      transaction_id: '644506',
      value: 4.95,
      currency: 'EUR',
      tax: 0.79,
      shipping: 0,
      event: 'ecommerceEvent',
      ga4Event: 'purchase',
    });
    expect(payload?.items).toEqual([
      {
        item_id: '147604',
        item_name: 'Klingel Kl2',
        price: 4.95,
        quantity: 1,
      },
    ]);
    expect(payload?.items).toHaveLength(1);
  });

  it('deduplicates purchase tracking by order id', () => {
    const storage = new Map<string, string>();
    const sessionStorageMock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    };

    expect(hasTrackedPurchase(sessionStorageMock, '644506')).toBe(false);

    markPurchaseTracked(sessionStorageMock, '644506');

    expect(storage.get(`${PURCHASE_STORAGE_PREFIX}644506`)).toBe('1');
    expect(hasTrackedPurchase(sessionStorageMock, '644506')).toBe(true);
  });
});

describe('billigerDeTracking', () => {
  it('creates a purchase payload from an order', () => {
    const payload = createBilligerDePurchasePayload(createOrder());

    expect(payload).toEqual({
      orderId: 'NjQ0NTA2',
      value: 4.16,
      factor: '1',
    });
  });

  it('creates tracking urls for solute landing and conversion requests', () => {
    const landingPageUrl = 'https://www.example.com/product?soluteclid=abc-123&gclid=xyz';
    const payload = createBilligerDePurchasePayload(createOrder(), '0.5');

    expect(payload).not.toBeNull();
    expect(createBilligerDeLandingUrl(landingPageUrl)).toBe(
      'https://cmodul.solutenetwork.com/landing?url=https%3A%2F%2Fwww.example.com%2Fproduct%3Fsoluteclid%3Dabc-123%26gclid%3Dxyz',
    );
    expect(createBilligerDeConversionUrl(payload!, landingPageUrl)).toBe(
      'https://cmodul.solutenetwork.com/conversion?val=4.16&oid=NjQ0NTA2&factor=0.5&url=https%3A%2F%2Fwww.example.com%2Fproduct%3Fsoluteclid%3Dabc-123%26gclid%3Dxyz',
    );
  });

  it('stores and expires the solute landing page url', () => {
    const storage = new Map<string, string>();
    const storageMock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };

    storeSoluteClick(storageMock, 'https://www.example.com/product?soluteclid=abc-123', 1000);

    expect(storage.get(SOLUTE_CLICK_STORAGE_KEY)).toBe('1000 https://www.example.com/product?soluteclid=abc-123');
    expect(getSoluteLandingPageUrl(storageMock, 1000)).toBe('https://www.example.com/product?soluteclid=abc-123');
    expect(getSoluteLandingPageUrl(storageMock, 1000 + 1000 * 60 * 60 * 24 * 31)).toBeNull();
    expect(storage.has(SOLUTE_CLICK_STORAGE_KEY)).toBe(false);
  });

  it('deduplicates purchase tracking by order id', () => {
    const storage = new Map<string, string>();
    const sessionStorageMock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    };

    expect(hasTrackedBilligerDePurchase(sessionStorageMock, '644506')).toBe(false);

    markBilligerDePurchaseTracked(sessionStorageMock, '644506');

    expect(storage.get(`${BILLIGER_DE_PURCHASE_STORAGE_PREFIX}644506`)).toBe('1');
    expect(hasTrackedBilligerDePurchase(sessionStorageMock, '644506')).toBe(true);
  });
});
