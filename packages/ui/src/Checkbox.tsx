import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from './theme';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({ checked, onChange, label, style }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      hitSlop={8}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.inputBg,
            borderColor: checked ? colors.primary : colors.inputBorder,
          },
        ]}
      >
        {checked ? <Check size={13} color={colors.primaryText} strokeWidth={3} /> : null}
      </View>
      {label ? <Text style={[styles.label, { color: colors.inkMuted }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});
