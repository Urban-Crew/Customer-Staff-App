import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LongArrow } from './LongArrow';
import { useTheme } from './theme';

export interface BackButtonProps {
  onPress?: () => void;
  /** Icon color. Defaults to the theme's ink color — pass an explicit color when placed over a photo/brand-color backdrop. */
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Plain back-navigation affordance: the long-tailed arrow, no button chrome or container around it. */
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
      <LongArrow direction="left" color={color ?? colors.ink} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
