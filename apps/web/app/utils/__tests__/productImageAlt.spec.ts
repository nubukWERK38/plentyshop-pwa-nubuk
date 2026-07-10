import { describe, expect, it, vi } from 'vitest';
import { getProductImageAlt, getProductImageFallbackAlt } from '../productImageAlt';

vi.mock('@plentymarkets/shop-api', () => ({
  productImageGetters: {
    getImageAlternate: vi.fn((image: { alternate?: string }) => image.alternate),
  },
}));

describe('productImageAlt', () => {
  it('uses the maintained product image alternate text', () => {
    expect(getProductImageAlt({ alternate: 'Detailansicht' } as never, 'Testartikel', 1)).toBe('Detailansicht');
  });

  it('falls back to product name and one-based image index', () => {
    expect(getProductImageAlt({ alternate: '' } as never, 'Testartikel', 1)).toBe('Testartikel - Produktbild - 2');
  });

  it('falls back without product name', () => {
    expect(getProductImageFallbackAlt('', 0)).toBe('Produktbild - 1');
  });
});
