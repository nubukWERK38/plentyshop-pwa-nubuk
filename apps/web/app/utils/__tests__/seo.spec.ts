import { removeTrackingParamsFromCanonicalUrl } from '~/utils/seo';

describe('removeTrackingParamsFromCanonicalUrl', () => {
  it('keeps clean canonical urls unchanged', () => {
    expect(
      removeTrackingParamsFromCanonicalUrl(
        'https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000',
      ),
    ).toBe('https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000');
  });

  it('removes referrer params from canonical urls', () => {
    expect(
      removeTrackingParamsFromCanonicalUrl(
        'https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000?ReferrerID=7',
      ),
    ).toBe('https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000');
  });

  it('removes utm and click tracking params from canonical urls', () => {
    expect(
      removeTrackingParamsFromCanonicalUrl(
        'https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000?ReferrerID=7&utm_source=google&gclid=abc',
      ),
    ).toBe('https://www.nubuk-bikes.de/teile-parts/sp-phone-case-spc-s24-ultra_21400610_524000');
  });

  it('keeps non-tracking params in canonical urls', () => {
    expect(
      removeTrackingParamsFromCanonicalUrl(
        'https://www.nubuk-bikes.de/category?page=2&ReferrerID=7&sort=price&utm_medium=cpc',
      ),
    ).toBe('https://www.nubuk-bikes.de/category?page=2&sort=price');
  });

  it('handles relative urls and param casing', () => {
    expect(removeTrackingParamsFromCanonicalUrl('/category?referrerID=7&foo=bar&UTM_SOURCE=google')).toBe(
      '/category?foo=bar',
    );
  });
});
