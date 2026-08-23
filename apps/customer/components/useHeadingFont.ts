/**
 * Returns the Roboto Slab font-family name for the given weight.
 * Fonts are pre-loaded in _layout.tsx during the splash screen,
 * so no useFonts call is needed here.
 */
export function useHeadingFont(weight: '400' | '500' | '600' | '700' | '800' = '700'): string {
  const fontMap = {
    '400': 'RobotoSlab_400Regular',
    '500': 'RobotoSlab_500Medium',
    '600': 'RobotoSlab_600SemiBold',
    '700': 'RobotoSlab_700Bold',
    '800': 'RobotoSlab_800ExtraBold',
  } as const;

  return fontMap[weight];
}
