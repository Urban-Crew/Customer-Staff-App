import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export interface BadgeProps {
  icon?: ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ icon, label, style }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  label: { color: '#fff', fontWeight: 'bold' },
});
