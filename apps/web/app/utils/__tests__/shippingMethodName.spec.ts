import { getShippingMethodDisplayName, getShippingMethodNameLines } from '../shippingMethodName';

describe('shippingMethodName', () => {
  it.each([
    ['DPD - SHIPPING', ['DPD']],
    ['DHL - Shipping', ['DHL']],
    ['GLS - GLS', ['GLS']],
    [
      'GO! - BIKE EXPRESS NÄCHSTER TAG 8.00 - 15.00 UHR (BESTELLUNG BIS 14.00 UHR )',
      ['GO! - BIKE Express', 'Nächster Tag 08:00 - 15:00 Uhr', '(Bestellung bis 14:00 Uhr)'],
    ],
    [
      'GO! - BIKE EXPRESS SAMSTAG 8.00 - 15.00 UHR (BESTELLUNG BIS 14.00 UHR )',
      ['GO! - BIKE Express', 'Samstag 08:00 - 15:00 Uhr', '(Bestellung bis 14:00 Uhr)'],
    ],
    ['Selbstabholer - Abholung im Laden Schw.Gmünd', ['Selbstabholer', 'Abholung im Laden Schw. Gmünd']],
  ])('formats %s', (name, expectedLines) => {
    expect(getShippingMethodNameLines(name)).toEqual(expectedLines);
  });

  it('keeps unknown names as plain text and normalizes whitespace', () => {
    expect(getShippingMethodNameLines('  Andere   Versandart  ')).toEqual(['Andere Versandart']);
  });

  it('returns a single-line display name for surrounding checkout text', () => {
    expect(getShippingMethodDisplayName('GLS - GLS')).toBe('GLS');
  });
});
