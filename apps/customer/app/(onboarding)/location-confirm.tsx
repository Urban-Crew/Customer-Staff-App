import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Check, MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@ub/ui';
import { mockFetchCurrentLocation } from '../../lib/onboardingMock';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';
import { useOnboardingStore } from '../../lib/store/onboardingStore';

type Phase = 'fetching' | 'confirmed';

export default function LocationConfirmScreen() {
  const { colors } = useTheme();
  const address = useOnboardingFlowStore((s) => s.address);
  const setAddress = useOnboardingFlowStore((s) => s.setAddress);
  const resetFlow = useOnboardingFlowStore((s) => s.reset);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const [phase, setPhase] = useState<Phase>('fetching');

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (address) {
        await wait(400);
      } else {
        const resolved = await mockFetchCurrentLocation();
        if (cancelled) return;
        setAddress(resolved);
      }
      if (cancelled) return;
      setPhase('confirmed');
    }

    resolve();
    return () => {
      cancelled = true;
    };
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
            <PulsingPin pinColor={colors.ink} />
            <Text style={[styles.fetchingLabel, { color: colors.inkMuted }]}>
              Fetching your location...
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.confirmedIcon, { backgroundColor: colors.primary }]}>
              <Check size={26} color={colors.primaryText} strokeWidth={3} />
            </View>
            <Text style={[styles.confirmedLabel, { color: colors.inkMuted }]}>
              Delivering service at
            </Text>
            <Text style={[styles.confirmedTitle, { color: colors.ink }]}>{address?.shortLine}</Text>
            <Text style={[styles.confirmedSubtitle, { color: colors.inkMuted }]}>
              {address ? `${address.country} ${address.postalCode}` : ''}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function PulsingPin({ pinColor }: { pinColor: string }) {
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
        <MapPin size={22} color="#fff" />
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
  confirmedTitle: { fontSize: 24, fontWeight: '700' },
  confirmedSubtitle: { fontSize: 14 },
});
