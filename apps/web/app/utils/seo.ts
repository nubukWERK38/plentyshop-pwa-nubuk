export const SEO_SITE_NAME = 'Nubuk Bikes';

export const stripHtmlForSeo = (value?: string | null) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getSiteOrigin = (domain?: string) => (domain || 'https://www.nubuk-bikes.de').replace(/\/+$/, '');

export const toAbsoluteUrl = (url: string | null | undefined, origin = getSiteOrigin()) => {
  const value = (url ?? '').trim();
  if (!value || value === '#') return origin;
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
};

export const buildSeoLinkTitle = (label: string, context = 'Shop') => {
  const text = stripHtmlForSeo(label);
  const suffix = context ? ` im ${context}` : '';
  return text ? `${text}${suffix} bei ${SEO_SITE_NAME} entdecken` : `${SEO_SITE_NAME} Onlineshop entdecken`;
};

export const buildProductLinkTitle = (productName: string) =>
  `${stripHtmlForSeo(productName)} bei ${SEO_SITE_NAME} ansehen`;

export const CANONICAL_TRACKING_QUERY_PARAMS = [
  'ReferrerID',
  'referrerID',
  'referrerid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
] as const;

const canonicalTrackingQueryParams = new Set(CANONICAL_TRACKING_QUERY_PARAMS.map((param) => param.toLowerCase()));

export const removeTrackingParamsFromCanonicalUrl = (url: string | null | undefined) => {
  const value = (url ?? '').trim();
  if (!value.includes('?')) return value;

  const hashIndex = value.indexOf('#');
  const urlWithoutHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : value.slice(hashIndex);
  const queryIndex = urlWithoutHash.indexOf('?');

  if (queryIndex === -1) return value;

  const baseUrl = urlWithoutHash.slice(0, queryIndex);
  const searchParams = new URLSearchParams(urlWithoutHash.slice(queryIndex + 1));
  const normalizedSearchParams = new URLSearchParams();

  searchParams.forEach((paramValue, paramName) => {
    if (!canonicalTrackingQueryParams.has(paramName.toLowerCase())) {
      normalizedSearchParams.append(paramName, paramValue);
    }
  });

  const queryString = normalizedSearchParams.toString();

  return `${baseUrl}${queryString ? `?${queryString}` : ''}${hash}`;
};
