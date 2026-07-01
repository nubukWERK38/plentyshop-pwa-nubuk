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
