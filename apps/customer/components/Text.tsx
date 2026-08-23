import { useFonts as useManropeFonts } from '@expo-google-fonts/manrope';
import { useFonts as useRobotoSlabFonts } from '@expo-google-fonts/roboto-slab';
import {
  Text as RNText,
  StyleSheet,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

// ---------------------------------------------------------------------------
// Variant
// ---------------------------------------------------------------------------

export type TextVariant = 'heading' | 'body';

// ---------------------------------------------------------------------------
// Font-weight -> font-family maps
// Each key is a CSS-style numeric weight string; the value is the exact
// PostScript / font-family name that Expo registers for the loaded .ttf file.
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

export interface TextComponentProps extends Omit<TextProps, 'style'> {
  /** 'heading' -> Roboto Slab  |  'body' (default) -> Manrope */
  variant?: TextVariant;
  /** Numeric font weight. Defaults to '400'. */
  fontWeight?: FontWeight;
  /** Render the text in italic. */
  isItalic?: boolean;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Text({
  variant = 'body',
  fontWeight = '400',
  isItalic = false,
  style,
  children,
  ...rest
}: TextComponentProps) {
  const [manropeLoaded] = useManropeFonts({
    Manrope_200ExtraLight: require('@expo-google-fonts/manrope/200ExtraLight/Manrope_200ExtraLight.ttf'),
    Manrope_300Light: require('@expo-google-fonts/manrope/300Light/Manrope_300Light.ttf'),
    Manrope_400Regular: require('@expo-google-fonts/manrope/400Regular/Manrope_400Regular.ttf'),
    Manrope_500Medium: require('@expo-google-fonts/manrope/500Medium/Manrope_500Medium.ttf'),
    Manrope_600SemiBold: require('@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf'),
    Manrope_700Bold: require('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
    Manrope_800ExtraBold: require('@expo-google-fonts/manrope/800ExtraBold/Manrope_800ExtraBold.ttf'),
  });

  const [robotoSlabLoaded] = useRobotoSlabFonts({
    RobotoSlab_200ExtraLight: require('@expo-google-fonts/roboto-slab/200ExtraLight/RobotoSlab_200ExtraLight.ttf'),
    RobotoSlab_300Light: require('@expo-google-fonts/roboto-slab/300Light/RobotoSlab_300Light.ttf'),
    RobotoSlab_400Regular: require('@expo-google-fonts/roboto-slab/400Regular/RobotoSlab_400Regular.ttf'),
    RobotoSlab_500Medium: require('@expo-google-fonts/roboto-slab/500Medium/RobotoSlab_500Medium.ttf'),
    RobotoSlab_600SemiBold: require('@expo-google-fonts/roboto-slab/600SemiBold/RobotoSlab_600SemiBold.ttf'),
    RobotoSlab_700Bold: require('@expo-google-fonts/roboto-slab/700Bold/RobotoSlab_700Bold.ttf'),
    RobotoSlab_800ExtraBold: require('@expo-google-fonts/roboto-slab/800ExtraBold/RobotoSlab_800ExtraBold.ttf'),
  });

  const isHeading = variant === 'heading';
  const fontsReady = isHeading ? robotoSlabLoaded : manropeLoaded;

  const fontFamily = isHeading
    ? ROBOTO_SLAB_WEIGHT_MAP[fontWeight]
    : MANROPE_WEIGHT_MAP[fontWeight];

  return (
    <RNText
      style={[styles.base, fontsReady && { fontFamily }, isItalic && styles.italic, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    color: '#0F172A',
  },
  italic: {
    fontStyle: 'italic',
  },
});
