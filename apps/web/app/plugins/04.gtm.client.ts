import type { Cart, CartItem } from '@plentymarkets/shop-api';
import {
  createAddToCartPayload,
  createAuthPayload,
  createBeginCheckoutPayload,
  createRemoveFromCartPayload,
  createSearchPayload,
  createWishlistPayload,
  GTM_COOKIE_NAME,
  pushEcommerceEvent,
  pushToDataLayer,
} from '~/utils/gtmTracking';

const GTM_SCRIPT_ID = 'google-tag-manager-script';
const GOOGLE_ADS_SCRIPT_ID = 'google-ads-script';

type GtagCommand = [string, ...unknown[]];

const pushGtag = (...args: GtagCommand) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args as unknown as Record<string, unknown>);
};

const updateConsent = (granted: boolean) => {
  pushGtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
};

const loadGtmScript = (gtmId: string) => {
  if (!gtmId || document.getElementById(GTM_SCRIPT_ID)) return;

  pushToDataLayer({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(script);
};

const loadGoogleAdsScript = (googleAdsId: string) => {
  if (!googleAdsId || document.getElementById(GOOGLE_ADS_SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = GOOGLE_ADS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAdsId)}`;
  document.head.appendChild(script);

  pushGtag('js', new Date());
  pushGtag('config', googleAdsId);
};

export default defineNuxtPlugin({
  name: 'google-tag-manager',
  parallel: true,
  setup() {
    const config = useRuntimeConfig().public;
    const enabled = Boolean(config.enableGtm && config.gtmId);

    if (!enabled) return;

    window.dataLayer = window.dataLayer || [];
    pushGtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });

    const { consent } = useCookieConsent(GTM_COOKIE_NAME);
    const initialize = () => {
      updateConsent(true);
      loadGtmScript(String(config.gtmId));
      loadGoogleAdsScript(String(config.googleAdsId || ''));
    };

    if (consent.value) initialize();

    watch(consent, (value) => {
      updateConsent(value);
      pushToDataLayer({ event: 'consentChanged' });
      if (value) initialize();
    });

    const { on } = usePlentyEvent();

    on('frontend:addToCart', (data: { item: CartItem; cart?: Cart; addItemParams?: { quantity?: number } }) => {
      if (!consent.value) return;
      pushEcommerceEvent(createAddToCartPayload(data.item, data.cart, data.addItemParams?.quantity));
    });

    on('frontend:removeFromCart', (data: { item?: CartItem; cart?: Cart }) => {
      if (!consent.value || !data.item) return;
      pushEcommerceEvent(createRemoveFromCartPayload(data.item, data.cart));
    });

    on('frontend:beginCheckout', (cart: Cart) => {
      if (!consent.value) return;
      pushEcommerceEvent(createBeginCheckoutPayload(cart));
    });

    on('frontend:addToWishlist', (data: { variationId: number | string }) => {
      if (!consent.value) return;
      pushEcommerceEvent(createWishlistPayload(data.variationId));
    });

    on('frontend:login', () => {
      if (!consent.value) return;
      pushToDataLayer(createAuthPayload('login'));
    });

    on('frontend:signUp', () => {
      if (!consent.value) return;
      pushToDataLayer(createAuthPayload('sign_up'));
    });

    on('frontend:searchProduct', (searchTerm: string) => {
      if (!consent.value) return;
      pushEcommerceEvent(createSearchPayload(searchTerm));
    });
  },
});
