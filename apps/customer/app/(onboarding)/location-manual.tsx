import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Lightbulb, LocateFixed, MapPin } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, radii, spacing, useTheme } from '@ub/ui';
import type { PlaceSuggestion } from '@ub/shared-types';
import {
  describeLocationError,
  usePlacesAutocomplete,
  useResolvePlace,
} from '../../services/location.service';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';

export default function LocationManualScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const setAddress = useOnboardingFlowStore((s) => s.setAddress);
  const { suggestions, isSearching, error, sessionToken, resetSession } =
    usePlacesAutocomplete(query);
  const resolvePlace = useResolvePlace();

  const handleSelect = (suggestion: PlaceSuggestion) => {
    resolvePlace.mutate(
      { placeId: suggestion.placeId, sessionToken },
      {
        onSuccess: (address) => {
          setAddress(address);
          resetSession();
          router.push('/(onboarding)/location-confirm');
        },
      },
    );
  };

  const handleUseCurrentLocation = () => {
    router.push('/(onboarding)/location-confirm');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.topBar, { backgroundColor: colors.primary }]} edges={['top']}>
        <View style={styles.topBarRow}>
          <IconButton variant="plain" onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.primaryText} />
          </IconButton>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Enter address (some tips below)"
            placeholderTextColor={`${colors.primaryText}80`}
            style={[styles.searchInput, { color: colors.primaryText }]}
            autoFocus
          />
        </View>
        <View style={[styles.tipBanner, { backgroundColor: `${colors.primaryText}1A` }]}>
          <Lightbulb size={14} color={colors.primaryText} />
          <Text style={[styles.tipText, { color: `${colors.primaryText}D9` }]}>
            Enter your building name or street for best results
          </Text>
        </View>
      </SafeAreaView>

      {query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: colors.hairline }]} />
            <Text style={[styles.orLabel, { color: colors.inkMuted }]}>Or</Text>
            <View style={[styles.orLine, { backgroundColor: colors.hairline }]} />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.currentLocationRow,
              { backgroundColor: colors.secondaryBg, borderColor: colors.secondaryBorder },
              pressed && styles.pressed,
            ]}
            onPress={handleUseCurrentLocation}
          >
            <LocateFixed size={18} color={colors.ink} />
            <Text style={[styles.currentLocationLabel, { color: colors.ink }]}>
              Use my current location
            </Text>
          </Pressable>
        </View>
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
              onPress={() => handleSelect(suggestion)}
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
          ) : suggestions.length === 0 ? (
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
  topBar: {},
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: spacing.md,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tipText: { flex: 1, fontSize: 12 },
  pressed: { opacity: 0.6 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.lg },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '80%' },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
  orLabel: { fontSize: 13 },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
    marginHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  currentLocationLabel: { fontSize: 15, fontWeight: '600' },
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
});
