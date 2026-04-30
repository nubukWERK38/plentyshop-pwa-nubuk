import { getPaletteFromColor } from '../utils/tailwindHelper';
import type { Shade } from '../utils/tailwindHelper';

const paletteCache = new Map<string, Array<Shade & { type: string }>>();
const MAX_CACHE_SIZE = 50;

export default defineNuxtPlugin({
  name: 'generate-color-palette',
  dependsOn: ['init-initial-data'],
  enforce: 'post',
  async setup() {
    const buildPalette = (colorType: string, baseColor?: string): Array<Shade & { type: string }> => {
      if (!baseColor) return [];

      const cacheKey = `${colorType}:${baseColor}`;
      const cached = paletteCache.get(cacheKey);
      if (cached) {
        paletteCache.delete(cacheKey);
        paletteCache.set(cacheKey, cached);
        return cached;
      }

      const palette = getPaletteFromColor(colorType, baseColor).map((item: Shade) => ({
        ...item,
        type: colorType,
      }));

      if (paletteCache.size >= MAX_CACHE_SIZE) {
        const firstKey = paletteCache.keys().next().value;
        if (firstKey) paletteCache.delete(firstKey);
      }

      paletteCache.set(cacheKey, palette);
      return palette;
    };

    try {
      const { getSetting: getPrimaryColor } = useSiteSettings('primaryColor');
      const { getSetting: getSecondaryColor } = useSiteSettings('secondaryColor');
      const { getSetting: getAccentColor1 } = useSiteSettings('accentColor1');
      const { getSetting: getAccentColor2 } = useSiteSettings('accentColor2');
      const { getSetting: getAccentColor3 } = useSiteSettings('accentColor3');
      const { getSetting: getAccentColor4 } = useSiteSettings('accentColor4');
      const { getSetting: getHeaderBackgroundColor } = useSiteSettings('headerBackgroundColor');

      const primaryColor = getPrimaryColor() || '#062633';
      const secondaryColor = getSecondaryColor() || '#31687d';
      const accentColor1 = getAccentColor1() || '#1f3a5f';
      const accentColor2 = getAccentColor2() || '#2f5d62';
      const accentColor3 = getAccentColor3() || '#6a8d73';
      const accentColor4 = getAccentColor4() || '#d98324';
      const headerColor = getHeaderBackgroundColor() || primaryColor || '#062633';
      const primaryPalette = buildPalette('primary', primaryColor);
      const secondaryPalette = buildPalette('secondary', secondaryColor);
      const accentPalette1 = buildPalette('accent1', accentColor1);
      const accentPalette2 = buildPalette('accent2', accentColor2);
      const accentPalette3 = buildPalette('accent3', accentColor3);
      const accentPalette4 = buildPalette('accent4', accentColor4);
      const headerPalette = buildPalette('header', headerColor);

      const colors = [
        ...primaryPalette,
        ...secondaryPalette,
        ...accentPalette1,
        ...accentPalette2,
        ...accentPalette3,
        ...accentPalette4,
        ...headerPalette,
      ];

      const styleString = colors.reduce((acc, { type, weight, rgb }) => {
        return acc + `--colors-2-${type}-${weight}: ${rgb};`;
      }, '');

      useHead({
        style: [
          {
            innerHTML: `:root { ${styleString} }`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  },
});
