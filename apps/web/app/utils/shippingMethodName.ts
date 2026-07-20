const normalizeShippingMethodName = (name: string) => name.replace(/\s+/g, ' ').trim();

export const getShippingMethodNameLines = (name: string): string[] => {
  const normalizedName = normalizeShippingMethodName(name);
  const comparisonName = normalizedName.toLocaleUpperCase('de-DE');

  if (/^DPD\s*-\s*SHIPPING$/.test(comparisonName)) return ['DPD'];
  if (/^DHL\s*-\s*SHIPPING$/.test(comparisonName)) return ['DHL'];
  if (/^GLS\s*-\s*GLS$/.test(comparisonName)) return ['GLS'];

  if (
    /^GO!\s*-\s*BIKE EXPRESS NÄCHSTER TAG 0?8[.:]00\s*-\s*15[.:]00 UHR\s*\(\s*BESTELLUNG BIS 14[.:]00 UHR\s*\)$/.test(
      comparisonName,
    )
  ) {
    return ['GO! - BIKE Express', 'Nächster Tag 08:00 - 15:00 Uhr', '(Bestellung bis 14:00 Uhr)'];
  }

  if (
    /^GO!\s*-\s*BIKE EXPRESS SAMSTAG 0?8[.:]00\s*-\s*15[.:]00 UHR\s*\(\s*BESTELLUNG BIS 14[.:]00 UHR\s*\)$/.test(
      comparisonName,
    )
  ) {
    return ['GO! - BIKE Express', 'Samstag 08:00 - 15:00 Uhr', '(Bestellung bis 14:00 Uhr)'];
  }

  if (/^SELBSTABHOLER\s*-\s*ABHOLUNG IM LADEN SCHW\.?\s*GMÜND$/.test(comparisonName)) {
    return ['Selbstabholer', 'Abholung im Laden Schw. Gmünd'];
  }

  return [normalizedName];
};

export const getShippingMethodDisplayName = (name: string): string => getShippingMethodNameLines(name).join(' ');
