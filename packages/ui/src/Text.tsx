import {
  Text as RNText,
  StyleSheet,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from './theme';

// ---------------------------------------------------------------------------
// Variant
// ---------------------------------------------------------------------------

export type TextVariant = 'heading' | 'body';

// ---------------------------------------------------------------------------
// Font-weight -> font-family maps
// Each key is a CSS-style numeric weight string; the value is the exact
// PostScript / font-family name that Expo registers for the loaded .ttf file.
// Fonts must be loaded at the app root (e.g. _layout.tsx) before use.
// ---------------------------------------------------------------------------

export type FontWeight = '200' | '300' | '400' | '500' | '600' | '700' | '800';

const MANROPE_WEIGHT_MAP: Record<FontWeight, string> = {
  '200': 'Manrope_200ExtraLight',
  '300': 'Manrope_300Light',
  '400': 'Manrope_400Regular',
  '500': 'Manrope_500Medium',
  '600': 'Manrope_600SemiBold',
  '700': 'Manrope_700Bold',
  '800': 'Manrope_800ExtraBold',
};

const ROBOTO_SLAB_WEIGHT_MAP: Record<FontWeight, string> = {
  '200': 'RobotoSlab_200ExtraLight',
  '300': 'RobotoSlab_300Light',
  '400': 'RobotoSlab_400Regular',
  '500': 'RobotoSlab_500Medium',
  '600': 'RobotoSlab_600SemiBold',
  '700': 'RobotoSlab_700Bold',
  '800': 'RobotoSlab_800ExtraBold',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TextProps2 extends Omit<TextProps, 'style'> {
  /** 'heading' -> Roboto Slab  |  'body' (default) -> Manrope */
  variant?: TextVariant;
  /** Numeric font weight. Defaults to '400'. */
  fontWeight?: FontWeight;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Text({
  variant = 'body',
  fontWeight = '400',
  style,
  children,
  ...rest
}: TextProps2) {
  const { colors } = useTheme();
  const fontFamily =
    variant === 'heading' ? ROBOTO_SLAB_WEIGHT_MAP[fontWeight] : MANROPE_WEIGHT_MAP[fontWeight];

  return (
    <RNText style={[styles.base, { fontFamily, color: colors.ink }, style]} {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
  },
});
