import { cartGetters, orderGetters } from '@plentymarkets/shop-api';
import type { Cart, CartItem, Order, OrderItem } from '@plentymarkets/shop-api';

export const GTM_COOKIE_NAME = 'CookieBar.marketing.cookies.googleTagManager.name';
export const PURCHASE_STORAGE_PREFIX = 'gtm-purchase-tracked:';

export type DataLayerPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerPayload[];
  }
}

type EcommerceItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity: number;
};

type LegacyProduct = {
  id: string;
  name: string;
  price?: string;
  quantity: number;
  variant?: string;
};

type PurchasePayload = DataLayerPayload & {
  transaction_id: string;
  value: number;
  currency: string;
  tax: number;
  shipping: number;
  items: EcommerceItem[];
};

const PRODUCT_ORDER_ITEM_TYPE_ID = 1;

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const getCartCurrency = (cart?: Cart | null) => (cart ? cartGetters.getCurrency(cart) || 'EUR' : 'EUR');

const getCartItemValue = (item: CartItem, quantity = cartGetters.getItemQty(item)) =>
  roundCurrency(toNumber(cartGetters.getItemPrice(item) ?? item.price) * quantity);

const getCartItemName = (item: CartItem) => cartGetters.getItemName(item) || item.variation?.texts?.name1 || '';

const getCartLegacyProduct = (item: CartItem, quantity = cartGetters.getItemQty(item)): LegacyProduct => ({
  id: String(cartGetters.getVariationId(item)),
  name: getCartItemName(item),
  price: String(toNumber(cartGetters.getItemPrice(item) ?? item.price)),
  quantity,
});

const getCartEcommerceItem = (item: CartItem, quantity = cartGetters.getItemQty(item)): EcommerceItem => ({
  item_id: String(cartGetters.getVariationId(item)),
  item_name: getCartItemName(item),
  price: toNumber(cartGetters.getItemPrice(item) ?? item.price),
  quantity,
});

const getOrderProductItems = (order: Order) =>
  orderGetters
    .getItems(order)
    .filter(
      (item) =>
        item.typeId === PRODUCT_ORDER_ITEM_TYPE_ID &&
        !orderGetters.isBundleItem(item) &&
        !orderGetters.isCouponItem(item),
    );

const getOrderLegacyProduct = (item: OrderItem): LegacyProduct => ({
  id: String(orderGetters.getItemVariationId(item)),
  name: orderGetters.getItemName(item),
  price: String(toNumber(orderGetters.getOriginalItemPrice(item))),
  quantity: orderGetters.getItemQty(item),
});

const getOrderEcommerceItem = (item: OrderItem): EcommerceItem => ({
  item_id: String(orderGetters.getItemVariationId(item)),
  item_name: orderGetters.getItemName(item),
  price: toNumber(orderGetters.getOriginalItemPrice(item)),
  quantity: orderGetters.getItemQty(item),
});

export const createAddToCartPayload = (item: CartItem, cart?: Cart | null, quantity = cartGetters.getItemQty(item)) => {
  const currency = getCartCurrency(cart);
  const value = getCartItemValue(item, quantity);

  return {
    ecommerce: {
      currencyCode: currency,
      add: {
        products: [getCartLegacyProduct(item, quantity)],
      },
    },
    content_type: 'product',
    content_ids: String(cartGetters.getVariationId(item)),
    contents: [
      {
        id: cartGetters.getVariationId(item),
        quantity,
        item_price: toNumber(cartGetters.getItemPrice(item) ?? item.price),
      },
    ],
    currency,
    value,
    addCartValue: String(toNumber(cartGetters.getItemPrice(item) ?? item.price)),
    addCartQty: quantity,
    addCartId: String(cartGetters.getVariationId(item)),
    addCartName: getCartItemName(item),
    nonInteractionHit: false,
    event: 'ecommerceEvent',
    ga4Event: 'add_to_cart',
    eventCategory: 'E-Commerce',
    eventAction: 'addToCart',
    eventLabel: undefined,
    eventValue: undefined,
    items: [getCartEcommerceItem(item, quantity)],
  };
};

export const createRemoveFromCartPayload = (item: CartItem, cart?: Cart | null) => {
  const currency = getCartCurrency(cart);
  const quantity = cartGetters.getItemQty(item);

  return {
    ecommerce: {
      currencyCode: currency,
      remove: {
        products: [getCartLegacyProduct(item, quantity)],
      },
    },
    content_type: 'product',
    content_ids: String(cartGetters.getVariationId(item)),
    contents: [
      {
        id: cartGetters.getVariationId(item),
        quantity,
        item_price: toNumber(cartGetters.getItemPrice(item) ?? item.price),
      },
    ],
    currency,
    value: getCartItemValue(item, quantity),
    nonInteractionHit: false,
    event: 'ecommerceEvent',
    ga4Event: 'remove_from_cart',
    eventCategory: 'E-Commerce',
    eventAction: 'removeFromCart',
    eventLabel: undefined,
    eventValue: undefined,
    items: [getCartEcommerceItem(item, quantity)],
  };
};

export const createBeginCheckoutPayload = (cart: Cart) => {
  const currency = getCartCurrency(cart);
  const items = cartGetters.getItems(cart).map((item) => getCartEcommerceItem(item));

  return {
    ecommerce: {
      currencyCode: currency,
      checkout: {
        actionField: { step: 1 },
        products: cartGetters.getItems(cart).map((item) => getCartLegacyProduct(item)),
      },
    },
    currency,
    value: roundCurrency(toNumber(cart.basketAmount)),
    event: 'ecommerceEvent',
    ga4Event: 'begin_checkout',
    eventCategory: 'E-Commerce',
    eventAction: 'beginCheckout',
    eventLabel: undefined,
    eventValue: undefined,
    items,
  };
};

export const createWishlistPayload = (variationId: number | string) => ({
  event: 'AddToWishlist',
  ga4Event: 'add_to_wishlist',
  content_type: 'product',
  content_ids: String(variationId),
  currency: 'EUR',
  value: 0.01,
  items: [{ item_id: String(variationId), quantity: 1 }],
});

export const createSearchPayload = (searchTerm: string) => ({
  event: 'ecommerceEvent',
  ga4Event: 'search',
  eventCategory: 'E-Commerce',
  eventAction: 'search',
  search_term: searchTerm,
});

export const createAuthPayload = (event: 'login' | 'sign_up') => ({
  event,
});

export const createPurchasePayload = (order: Order): PurchasePayload | null => {
  const orderId = orderGetters.getId(order);

  if (!orderId) return null;

  const totals = orderGetters.getTotals(order);
  const currency = orderGetters.getCurrency(order) || totals.currency || 'EUR';
  const productItems = getOrderProductItems(order);
  const tax = roundCurrency(
    orderGetters.getOriginalOrderVats(order).reduce((sum, vat) => sum + orderGetters.getOrderVatValue(vat), 0),
  );
  const shipping = roundCurrency(orderGetters.getOriginalShippingCost(order));
  const value = roundCurrency(orderGetters.getTotal(totals));

  return {
    ecommerce: {
      currencyCode: currency,
      purchase: {
        actionField: {
          id: orderId,
          revenue: value,
          tax,
          shipping,
        },
        products: productItems.map(getOrderLegacyProduct),
      },
    },
    transaction_id: orderId,
    value,
    currency,
    tax,
    shipping,
    content_type: 'product',
    content_ids: productItems.map((item) => String(orderGetters.getItemVariationId(item))),
    contents: productItems.map((item) => ({
      id: orderGetters.getItemVariationId(item),
      quantity: orderGetters.getItemQty(item),
      item_price: toNumber(orderGetters.getOriginalItemPrice(item)),
    })),
    event: 'ecommerceEvent',
    ga4Event: 'purchase',
    eventCategory: 'E-Commerce',
    eventAction: 'purchase',
    eventLabel: undefined,
    eventValue: value,
    items: productItems.map(getOrderEcommerceItem),
  };
};

export const hasTrackedPurchase = (storage: Pick<Storage, 'getItem'>, orderId: string) =>
  storage.getItem(`${PURCHASE_STORAGE_PREFIX}${orderId}`) === '1';

export const markPurchaseTracked = (storage: Pick<Storage, 'setItem'>, orderId: string) => {
  storage.setItem(`${PURCHASE_STORAGE_PREFIX}${orderId}`, '1');
};

export const pushToDataLayer = (payload: DataLayerPayload) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

export const pushEcommerceEvent = (payload: DataLayerPayload) => {
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer(payload);
};
