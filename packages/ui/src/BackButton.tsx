import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from './theme';

export interface BackButtonProps {
  onPress?: () => void;
  /** Icon color. Defaults to the theme's ink color — pass an explicit color when placed over a photo/brand-color backdrop. */
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Plain back-navigation affordance: a long-tailed arrow (long shaft, small
 * head — lucide's ArrowLeft has a fixed 1:1 shaft/head split, so this is a
 * custom path), no button chrome or container around it.
 */
export function BackButton({ onPress, color, size = 24, style }: BackButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={[styles.base, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 12H2M2 12L6 8M2 12L6 16"
          stroke={color ?? colors.ink}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
