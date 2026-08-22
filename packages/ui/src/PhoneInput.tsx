import { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { cardStyle, useTheme } from './theme';

export interface CountryCode {
  /** Dial code including leading "+", e.g. "+65". */
  code: string;
  iso: string;
  name: string;
  flag: string;
}

export const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { code: '+65', iso: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+971', iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', iso: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', iso: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: '+44', iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', iso: 'US', name: 'United States', flag: '🇺🇸' },
  { code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', iso: 'ID', name: 'Indonesia', flag: '🇮🇩' },
];

export interface PhoneInputProps {
  countryCode: string;
  onChangeCountryCode: (code: string) => void;
  value: string;
  onChangeText: (value: string) => void;
  countries?: CountryCode[];
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Plain outlined country-code picker + national number field. */
export function PhoneInput({
  countryCode,
  onChangeCountryCode,
  value,
  onChangeText,
  countries = DEFAULT_COUNTRY_CODES,
  placeholder = 'Enter Phone Number',
  autoFocus,
  style,
}: PhoneInputProps) {
  const { colors } = useTheme();
  const sheetRef = useRef<TrueSheet>(null);

  return (
    <View
      style={[
        cardStyle,
        styles.container,
        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        style,
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.codeSelector, pressed && styles.pressed]}
        onPress={() => sheetRef.current?.present()}
      >
        <Text style={[styles.code, { color: colors.ink }]}>{countryCode}</Text>
        <ChevronDown size={16} color={colors.inkMuted} />
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.hairline }]} />

      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType="number-pad"
        textContentType="telephoneNumber"
        autoFocus={autoFocus}
        style={[styles.numberInput, { color: colors.ink }]}
      />

      <TrueSheet
        ref={sheetRef}
        detents={['auto', 0.6]}
        style={[styles.sheet, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>Select a country</Text>
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
          {countries.map((country) => (
            <Pressable
              key={country.iso}
              style={({ pressed }) => [
                styles.countryRow,
                { borderBottomColor: colors.hairline },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onChangeCountryCode(country.code);
                sheetRef.current?.dismiss();
              }}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={[styles.countryName, { color: colors.ink }]}>{country.name}</Text>
              <Text style={[styles.countryCode, { color: colors.inkMuted }]}>{country.code}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </TrueSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  codeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.6 },
  code: { fontSize: 16, fontWeight: '600' },
  divider: {
    width: 1,
    height: 28,
    marginVertical: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    letterSpacing: 0.3,
    backgroundColor: 'transparent',
  },
  sheet: { padding: 24, gap: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
  sheetList: { maxHeight: 420 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flag: { fontSize: 20 },
  countryName: { flex: 1, fontSize: 15 },
  countryCode: { fontSize: 15 },
});
