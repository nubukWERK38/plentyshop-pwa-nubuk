const DOMAIN_LIKE_URL = /^(?:www\.)?(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}(?::\d+)?(?:[/?#].*)?$/i;

const attributePattern = (name: string) =>
  new RegExp(`(\\s${name}\\s*=\\s*)(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\u0060]+))`, 'i');

const getAttribute = (tag: string, name: string) => {
  const match = tag.match(attributePattern(name));
  return match ? (match[2] ?? match[3] ?? match[4] ?? '') : null;
};

const setAttribute = (tag: string, name: string, value: string) => {
  const pattern = attributePattern(name);
  if (pattern.test(tag)) return tag.replace(pattern, (_match, prefix: string) => `${prefix}"${value}"`);
  return tag.replace(/\s*\/?\s*>$/, (ending) => ` ${name}="${value}"${ending}`);
};

const normalizeHref = (href: string) => {
  const trimmedHref = href.trim();

  if (/^\/\//.test(trimmedHref)) return `https:${trimmedHref}`;
  if (DOMAIN_LIKE_URL.test(trimmedHref)) return `https://${trimmedHref}`;
  return trimmedHref;
};

const isExternalHttpUrl = (href: string, currentOrigin: string) => {
  if (!/^https?:\/\//i.test(href)) return false;

  try {
    const linkOrigin = new URL(href).origin;
    return !currentOrigin || linkOrigin !== new URL(currentOrigin).origin;
  } catch {
    return false;
  }
};

export const normalizeRichTextLinks = (html: string, currentOrigin = '') =>
  html.replace(/<a\b[^>]*>/gi, (anchorTag) => {
    const href = getAttribute(anchorTag, 'href');
    if (href === null) return anchorTag;

    const normalizedHref = normalizeHref(href);
    let normalizedTag = setAttribute(anchorTag, 'href', normalizedHref);

    if (!isExternalHttpUrl(normalizedHref, currentOrigin)) return normalizedTag;

    normalizedTag = setAttribute(normalizedTag, 'target', '_blank');
    const relValues = new Set((getAttribute(normalizedTag, 'rel') ?? '').split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');

    return setAttribute(normalizedTag, 'rel', [...relValues].join(' '));
  });
