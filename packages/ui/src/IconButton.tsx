import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SquircleView } from 'expo-squircle-view';
import { radii, useTheme } from './theme';

export interface IconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'outlined' | 'plain';
  style?: StyleProp<ViewStyle>;
}

/** Icon-only pressable: a plain bordered squircle, or unstyled when overlaid on a solid surface. */
export function IconButton({ children, onPress, variant = 'outlined', style }: IconButtonProps) {
  const { colors } = useTheme();
  const isOutlined = variant === 'outlined';

  return (
    <Pressable onPress={onPress} hitSlop={12}>
      {({ pressed }) => (
        <SquircleView
          cornerSmoothing={100}
          style={[
            styles.base,
            isOutlined && {
              backgroundColor: colors.secondaryBg,
              borderColor: colors.secondaryBorder,
            },
            pressed && (isOutlined ? styles.pressedOutlined : styles.pressedPlain),
            style,
          ]}
        >
          {children}
        </SquircleView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressedPlain: { opacity: 0.5 },
  pressedOutlined: { opacity: 0.6 },
});
