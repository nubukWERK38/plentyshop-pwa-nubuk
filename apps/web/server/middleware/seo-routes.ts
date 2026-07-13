import { getRequestURL, sendRedirect, setResponseHeader, setResponseStatus } from 'h3';

import seoRoutesJson from '../data/seo-routes.json';

type Redirect = {
  from: string;
  to: string;
};

type SeoRoutes = {
  redirects: Redirect[];
  gone: string[];
};

const normalizePath = (path: string) => (path === '/' ? path : path.replace(/\/+$/, ''));
const isSafePath = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

const createSeoRoutes = (config: SeoRoutes) => {
  const redirects = new Map<string, string>();
  const gone = new Set<string>();

  for (const redirect of config.redirects) {
    if (!isSafePath(redirect.from) || !isSafePath(redirect.to)) {
      throw new Error('SEO redirects must use internal paths beginning with a single slash.');
    }

    const source = normalizePath(redirect.from);
    const target = normalizePath(redirect.to);

    if (source === target || redirects.has(source)) {
      throw new Error(`Invalid or duplicate SEO redirect: ${redirect.from}`);
    }

    redirects.set(source, target);
  }

  for (const path of config.gone) {
    if (!isSafePath(path)) {
      throw new Error('SEO gone entries must use internal paths beginning with a single slash.');
    }

    const normalizedPath = normalizePath(path);

    if (redirects.has(normalizedPath) || gone.has(normalizedPath)) {
      throw new Error(`Conflicting or duplicate SEO route: ${path}`);
    }

    gone.add(normalizedPath);
  }

  return { redirects, gone };
};

const seoRoutes = createSeoRoutes(seoRoutesJson as SeoRoutes);

export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return;

  const path = normalizePath(getRequestURL(event).pathname);
  const redirectTarget = seoRoutes.redirects.get(path);

  if (redirectTarget) return sendRedirect(event, redirectTarget, 301);

  if (seoRoutes.gone.has(path)) {
    setResponseStatus(event, 410, 'Gone');
    setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8');
    return 'Gone';
  }
});
