import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { colors } from './theme';

export interface SplashScreenProps {
  /** Local image asset, e.g. `require('../assets/splash-icon.png')`. */
  logo: ImageSource | number;
  /** Width/height of the logo in dp. Defaults to 120. */
  logoSize?: number;
  backgroundColor?: string;
  /** Shows a small activity indicator below the logo. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * JS-rendered splash screen matching the native splash (same logo,
 * background), meant to be shown while app state is hydrating so there's
 * no flash of blank content between the native splash hiding and the first
 * screen rendering.
 */
export function SplashScreen({
  logo,
  logoSize = 120,
  backgroundColor = colors.background,
  loading = false,
  style,
}: SplashScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Image source={logo} style={{ width: logoSize, height: logoSize }} contentFit="contain" />
      {loading ? <ActivityIndicator style={styles.indicator} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    marginTop: 24,
  },
});
