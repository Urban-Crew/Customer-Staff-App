import { forwardRef, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { cardStyle, useTheme } from './theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  left?: ReactNode;
  right?: ReactNode;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

/** Plain outlined text field: white fill, single-tone border, soft ambient shadow, no blur. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { left, right, error, style, inputStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        cardStyle,
        styles.container,
        {
          backgroundColor: colors.inputBg,
          borderColor: error
            ? colors.error
            : focused
              ? colors.inputBorderFocused
              : colors.inputBorder,
        },
        style,
      ]}
    >
      {left}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.placeholder}
        style={[styles.input, { color: colors.ink }, inputStyle]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {right}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    letterSpacing: 0.2,
    backgroundColor: 'transparent',
  },
});
