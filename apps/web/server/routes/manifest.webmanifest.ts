import { eventHandler, setHeader } from 'h3';

export default eventHandler((event) => {
  const name = process.env.NUXT_PUBLIC_OG_TITLE || process.env.OG_TITLE || 'PlentyONE Shop';

  setHeader(event, 'content-type', 'application/manifest+json; charset=utf-8');
  setHeader(event, 'cache-control', 'public, max-age=86400');

  return {
    name,
    short_name: name,
    description: process.env.NUXT_PUBLIC_META_DESCRIPTION || process.env.METADESC || 'PlentyONE Shop',
    theme_color: process.env.NUXT_PUBLIC_PRIMARY_COLOR || '#062633',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/_nuxt-plenty/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/_nuxt-plenty/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/_nuxt-plenty/icons/icon-512x512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
});
