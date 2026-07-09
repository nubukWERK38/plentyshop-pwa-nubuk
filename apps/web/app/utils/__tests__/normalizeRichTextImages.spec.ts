import { describe, expect, it } from 'vitest';
import { normalizeRichTextImages } from '../normalizeRichTextImages';

describe('normalizeRichTextImages', () => {
  it('adds a matching height for known SVG images with width only', () => {
    const html =
      '<img width="700" style="margin-left: -50px" src="https://cdn03.plentymarkets.com/0bcmhf2jth7k/frontend/Images/specialized-headline.svg" alt="specialized headline" />';

    expect(normalizeRichTextImages(html)).toContain('<img height="161" width="700"');
  });

  it('keeps existing image dimensions untouched', () => {
    const html = '<img width="700" height="161" src="/frontend/Images/specialized-headline.svg" alt="" />';

    expect(normalizeRichTextImages(html)).toBe(html);
  });

  it('ignores unknown images', () => {
    const html = '<img width="700" src="/frontend/Images/unknown.svg" alt="" />';

    expect(normalizeRichTextImages(html)).toBe(html);
  });
});
