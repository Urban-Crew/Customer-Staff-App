import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin } from 'lucide-react-native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, radii, spacing, useTheme } from '@ub/ui';
import type { PlaceSuggestion, ResolvedAddress } from '@ub/shared-types';
import { describeLocationError } from '../services/location.service';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import { useResolvePlace } from '../hooks/useResolvePlace';
import { useAddAddress } from '../hooks/useAddAddress';
import { useLocationStore } from '../lib/store/locationStore';

const LABELS = ['Home', 'Work', 'Other'] as const;

export default function AddressAddScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [resolved, setResolved] = useState<ResolvedAddress | null>(null);
  const [label, setLabel] = useState<(typeof LABELS)[number]>('Home');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { suggestions, isSearching, error, sessionToken, resetSession } =
    usePlacesAutocomplete(query);
  const resolvePlace = useResolvePlace();
  const addAddress = useAddAddress();
  const setSelectedLocation = useLocationStore((s) => s.setAddress);

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    resolvePlace.mutate(
      { placeId: suggestion.placeId, sessionToken },
      {
        onSuccess: (address) => {
          setResolved(address);
          setSelectedPlaceId(suggestion.placeId);
          resetSession();
        },
      },
    );
  };

  const handleSave = () => {
    if (!resolved || !flatNo.trim()) return;
    addAddress.mutate(
      {
        label,
        flatNo: flatNo.trim(),
        areaText: resolved.shortLine,
        landmark: landmark.trim() || undefined,
        formattedAddr: resolved.formattedAddress,
        googlePlaceId: selectedPlaceId ?? undefined,
        latitude: resolved.coordinates.latitude,
        longitude: resolved.coordinates.longitude,
        isDefault,
      },
      {
        onSuccess: (saved) => {
          setSelectedLocation(saved);
          router.back();
        },
      },
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.topBar, { backgroundColor: colors.primary }]} edges={['top']}>
        <View style={styles.topBarRow}>
          <BackButton onPress={() => router.back()} color="#fff" />
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setResolved(null);
            }}
            placeholder="Search for a building, street or area"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.searchInput}
            autoFocus
          />
        </View>
      </SafeAreaView>

      {resolved ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <View style={styles.resolvedRow}>
              <MapPin size={18} color={colors.ink} />
              <Text style={[styles.resolvedText, { color: colors.ink }]} numberOfLines={2}>
                {resolved.formattedAddress}
              </Text>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>
              House / flat / floor *
            </Text>
            <TextInput
              value={flatNo}
              onChangeText={setFlatNo}
              placeholder="e.g. Flat 402, Royal Residency"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                {
                  color: colors.ink,
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBg,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>Landmark</Text>
            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Dominos"
              placeholderTextColor={colors.placeholder}
              style={[
                styles.fieldInput,
                {
                  color: colors.ink,
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBg,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.inkMuted }]}>Save as</Text>
            <View style={styles.labelRow}>
              {LABELS.map((option) => {
                const active = option === label;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setLabel(option)}
                    style={[
                      styles.labelChip,
                      {
                        backgroundColor: active ? colors.primary : colors.secondaryBg,
                        borderColor: active ? colors.primary : colors.secondaryBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? colors.primaryText : colors.ink }}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.defaultRow} onPress={() => setIsDefault((v) => !v)}>
              <Text style={{ color: colors.ink }}>Set as default address</Text>
              <Switch value={isDefault} onValueChange={setIsDefault} />
            </Pressable>

            {addAddress.isError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {describeLocationError(addAddress.error)}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={!flatNo.trim() || addAddress.isPending}
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: !flatNo.trim() || addAddress.isPending ? 0.5 : 1,
                },
              ]}
            >
              {addAddress.isPending ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <Text style={[styles.saveButtonLabel, { color: colors.primaryText }]}>
                  Save address
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion.placeId}
              style={({ pressed }) => [
                styles.resultRow,
                { borderBottomColor: colors.hairline },
                pressed && styles.pressed,
              ]}
              disabled={resolvePlace.isPending}
              onPress={() => handleSelectSuggestion(suggestion)}
            >
              <MapPin size={18} color={colors.ink} />
              <View style={styles.resultTextBlock}>
                <Text style={[styles.resultPrimary, { color: colors.ink }]}>
                  {suggestion.primaryText}
                </Text>
                <Text style={[styles.resultSecondary, { color: colors.inkMuted }]}>
                  {suggestion.secondaryText}
                </Text>
              </View>
            </Pressable>
          ))}
          {isSearching ? (
            <ActivityIndicator style={styles.statusRow} size="small" color={colors.ink} />
          ) : error ? (
            <Text style={[styles.noResults, { color: colors.error }]}>
              {describeLocationError(error)}
            </Text>
          ) : query.trim().length > 0 && suggestions.length === 0 ? (
            <Text style={[styles.noResults, { color: colors.inkMuted }]}>
              No matches yet — keep typing.
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: {},
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 17, paddingVertical: spacing.md },
  pressed: { opacity: 0.6 },
  results: { flex: 1 },
  statusRow: { paddingVertical: spacing.lg },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultTextBlock: { flex: 1 },
  resultPrimary: { fontSize: 15, fontWeight: '600' },
  resultSecondary: { fontSize: 13, marginTop: 2 },
  noResults: { padding: spacing.lg, fontSize: 14 },
  form: { padding: spacing.lg, gap: spacing.xs },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resolvedText: { flex: 1, fontSize: 14 },
  fieldLabel: { fontSize: 12, marginTop: spacing.md, marginBottom: spacing.xs },
  fieldInput: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
  },
  labelRow: { flexDirection: 'row', gap: spacing.sm },
  labelChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  errorText: { marginTop: spacing.md, fontSize: 13 },
  saveButton: {
    marginTop: spacing.xl,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonLabel: { fontSize: 16, fontWeight: '700' },
});
