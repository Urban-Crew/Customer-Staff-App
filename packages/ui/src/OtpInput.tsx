import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { cardStyle, useTheme } from './theme';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** 6-box OTP field with plain outlined tiles and SMS autofill support. */
export function OtpInput({ length = 6, value, onChangeText, autoFocus, style }: OtpInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable style={[styles.row, style]} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length }).map((_, index) => {
        const isCurrent = focused && index === activeIndex;
        const hasVal = Boolean(value[index]);

        return (
          <View
            key={index}
            style={[
              cardStyle,
              styles.box,
              {
                backgroundColor: colors.inputBg,
                borderColor: isCurrent || hasVal ? colors.inputBorderFocused : colors.inputBorder,
              },
            ]}
          >
            <Text style={[styles.digit, { color: colors.ink }]}>{value[index] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const BOX_SIZE = 48;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { fontSize: 22, fontWeight: '700' },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});
