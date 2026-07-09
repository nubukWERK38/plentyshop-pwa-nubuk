const knownImageAspectRatios: Record<string, number> = {
  'specialized-headline.svg': 225.4545455 / 979.7402597,
};

const getAttribute = (tag: string, attributeName: string) => {
  const match = tag.match(new RegExp(`\\s${attributeName}=(["'])(.*?)\\1`, 'i'));
  return match?.[2];
};

const hasAttribute = (tag: string, attributeName: string) =>
  new RegExp(`\\s${attributeName}(?:\\s*=|\\s|>|/)`, 'i').test(tag);

const getKnownImageAspectRatio = (src?: string) => {
  if (!src) return null;

  const normalizedSrc = src.replace(/\?.*$/, '').toLowerCase();
  const matchedImage = Object.keys(knownImageAspectRatios).find((imageName) => normalizedSrc.endsWith(imageName));

  return matchedImage ? (knownImageAspectRatios[matchedImage] ?? null) : null;
};

export const normalizeRichTextImages = (html?: string | null) => {
  if (!html) return '';

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (hasAttribute(tag, 'height')) return tag;

    const width = Number.parseInt(getAttribute(tag, 'width') ?? '', 10);
    const aspectRatio = getKnownImageAspectRatio(getAttribute(tag, 'src'));

    if (!Number.isFinite(width) || width <= 0 || !aspectRatio) return tag;

    return tag.replace(/<img\b/i, `<img height="${Math.round(width * aspectRatio)}"`);
  });
};
