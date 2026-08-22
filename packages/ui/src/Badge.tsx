import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, useTheme } from './theme';

export interface BadgeProps {
  icon?: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ icon, label, variant = 'primary', style }: BadgeProps) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <View
      style={[
        styles.badge,
        isPrimary
          ? { backgroundColor: colors.primary, borderWidth: 0 }
          : {
              backgroundColor: colors.secondaryBg,
              borderWidth: 1,
              borderColor: colors.secondaryBorder,
            },
        style,
      ]}
    >
      {icon}
      <Text
        style={[styles.label, { color: isPrimary ? colors.primaryText : colors.secondaryText }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
  },
  label: { fontWeight: '600', fontSize: 14, letterSpacing: 0.2 },
});
