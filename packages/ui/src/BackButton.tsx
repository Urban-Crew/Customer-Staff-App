import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from './theme';

export interface BackButtonProps {
  onPress?: () => void;
  /** Icon color. Defaults to the theme's ink color — pass an explicit color when placed over a photo/brand-color backdrop. */
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Plain back-navigation affordance: a long-tail arrow, no button chrome or container around it. */
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
      <ArrowLeft size={size} color={color ?? colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
