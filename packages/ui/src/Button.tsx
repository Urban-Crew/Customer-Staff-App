import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={variant === 'secondary' ? styles.secondaryLabel : styles.primaryLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#111' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#111' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  primaryLabel: { color: '#fff', fontWeight: '600' },
  secondaryLabel: { color: '#111', fontWeight: '600' },
});
