import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Check, MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, spacing, useTheme } from '@ub/ui';
import { useReverseGeocode } from '../../services/location.service';
import {
  getCurrentCoordinates,
  openLocationSettings,
  LocationError,
  type LocationErrorReason,
} from '../../lib/location';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useOnboardingStore } from '../../lib/store/onboardingStore';
import { createLogger } from '../../lib/logger';
import { Text } from '../../components';

const log = createLogger('LocationConfirmScreen');

type Phase = 'fetching' | 'confirmed' | 'error';

const ERROR_COPY: Record<LocationErrorReason, string> = {
  'permission-denied':
    'Location access was denied. Allow location access to use your current location.',
  'permission-blocked':
    'Location access is blocked for this app. Enable it from Settings to use your current location.',
  'services-disabled':
    'Location services are turned off on your device. Turn them on in Settings to use your current location.',
  unavailable:
    "We couldn't get a location fix. Check your device's location settings and try again.",
};

const isBlocked = (reason: LocationErrorReason) => reason === 'permission-blocked';

export default function LocationConfirmScreen() {
  const { colors } = useTheme();
  const address = useOnboardingFlowStore((s) => s.address);
  const setAddress = useOnboardingFlowStore((s) => s.setAddress);
  const resetFlow = useOnboardingFlowStore((s) => s.reset);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const reverseGeocode = useReverseGeocode();
  const [phase, setPhase] = useState<Phase>('fetching');
  const [errorReason, setErrorReason] = useState<LocationErrorReason>('unavailable');
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const resolveLocation = useCallback(async () => {
    setPhase('fetching');

    if (address) {
      log.info('Address already in store, skipping GPS fetch', address);
      await wait(400);
      if (isMountedRef.current) setPhase('confirmed');
      return;
    }

    log.info('Starting location resolve…');
    try {
      const coordinates = await getCurrentCoordinates();
      if (!isMountedRef.current) return;

      log.info('Reverse-geocoding for display…');
      const resolved = await reverseGeocode.mutateAsync({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
      if (!isMountedRef.current) return;

      const finalAddress = { ...resolved, coordinates };
      log.info('Location resolved', finalAddress);
      setAddress(finalAddress);
      setPhase('confirmed');
    } catch (err) {
      if (!isMountedRef.current) return;
      const reason = err instanceof LocationError ? err.reason : 'unavailable';
      log.error(`Location resolve failed (${reason})`, err);
      setErrorReason(reason);
      setPhase('error');
    }
  }, [address, setAddress, reverseGeocode.mutateAsync]);

  useEffect(() => {
    resolveLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'confirmed') return;
    const timer = setTimeout(async () => {
      await completeOnboarding();
      resetFlow();
      router.replace('/');
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, completeOnboarding, resetFlow]);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.center}>
        {phase === 'fetching' ? (
          <>
            <PulsingPin pinColor={colors.primary} pinIconColor={colors.primaryText} />
            <Text style={[styles.fetchingLabel, { color: colors.inkMuted }]}>
              Fetching your location...
            </Text>
          </>
        ) : phase === 'error' ? (
          <>
            <View style={[styles.confirmedIcon, { backgroundColor: colors.disabledBg }]}>
              <MapPin size={26} color={colors.inkMuted} strokeWidth={2.4} />
            </View>
            <Text style={[styles.confirmedLabel, { color: colors.ink }]}>
              Couldn't get your location
            </Text>
            <Text style={[styles.errorSubtitle, { color: colors.inkMuted }]}>
              {ERROR_COPY[errorReason]}
            </Text>
            <View style={styles.errorActions}>
              {isBlocked(errorReason) ? (
                <Button label="Enable in Settings" onPress={openLocationSettings} />
              ) : (
                <Button label="Try again" onPress={resolveLocation} />
              )}
              <Button
                label="Enter address manually"
                variant="secondary"
                onPress={() => router.replace('/(onboarding)/location-manual')}
              />
              {isBlocked(errorReason) ? (
                <Pressable
                  onPress={resolveLocation}
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.retryPressed}
                >
                  <Text style={[styles.retryLabel, { color: colors.ink }]}>Try Again</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <View style={[styles.confirmedIcon, { backgroundColor: colors.primary }]}>
              <Check size={26} color={colors.primaryText} strokeWidth={3} />
            </View>
            <Text style={[styles.confirmedLabel, { color: colors.inkMuted }]}>
              Delivering service at
            </Text>
            <Text
              variant="heading"
              fontWeight="700"
              style={[styles.confirmedTitle, { color: colors.ink }]}
            >
              {address?.shortLine}
            </Text>
            <Text style={[styles.confirmedSubtitle, { color: colors.inkMuted }]}>
              {address ? `${address.country} ${address.postalCode}` : ''}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function PulsingPin({ pinColor, pinIconColor }: { pinColor: string; pinIconColor: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.8, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, { backgroundColor: pinColor }, ringStyle]} />
      <View style={[styles.pin, { backgroundColor: pinColor }]}>
        <MapPin size={22} color={pinIconColor} />
      </View>
    </View>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PIN_SIZE = 56;

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pulseWrap: { width: PIN_SIZE, height: PIN_SIZE, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
  },
  pin: {
    width: PIN_SIZE * 0.7,
    height: PIN_SIZE * 0.7,
    borderRadius: (PIN_SIZE * 0.7) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fetchingLabel: { fontSize: 15, marginTop: spacing.sm },
  confirmedIcon: {
    width: PIN_SIZE * 0.7,
    height: PIN_SIZE * 0.7,
    borderRadius: (PIN_SIZE * 0.7) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedLabel: { fontSize: 14, marginTop: spacing.sm },
  confirmedTitle: { fontSize: 24 },
  confirmedSubtitle: { fontSize: 14 },
  errorSubtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  errorActions: { width: '100%', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center' },
  retryLabel: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },
  retryPressed: { opacity: 0.6 },
});
