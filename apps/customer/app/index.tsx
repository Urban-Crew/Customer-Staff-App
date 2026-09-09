import { useEffect, useRef, useState } from 'react';
import { router, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SplashScreen, spacing, Text, useTheme } from '@ub/ui';
import type { SelectedAddress } from '../lib/store/locationStore';
import { AddressSheet } from '../components/AddressSheet';
import { HomeSearchRow } from '../components/HomeSearchRow';
import { ServiceList } from '../components/ServiceList';
import { useLocationStore } from '../lib/store/locationStore';
import { useOnboardingStore } from '../lib/store/onboardingStore';

// Scroll offset (px) past which the address row has scrolled out and the
// floating search bar should be fully visible/interactive. Crossfades over
// a small range leading up to it, rather than popping in at one instant.
const FLOAT_THRESHOLD = 40;
const FLOAT_FADE_RANGE = 16;

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const selectedAddress = useLocationStore((s) => s.address);
  const hydrateLocation = useLocationStore((s) => s.hydrate);
  const setSelectedAddress = useLocationStore((s) => s.setAddress);
  const addressSheetRef = useRef<BottomSheetModal>(null);

  const scrollY = useSharedValue(0);
  const floatingShown = useSharedValue(false);
  const [floatingVisible, setFloatingVisible] = useState(false);

  useEffect(() => {
    hydrateOnboarding();
    hydrateLocation();
  }, [hydrateOnboarding, hydrateLocation]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    const shouldShow = event.contentOffset.y > FLOAT_THRESHOLD;
    if (shouldShow !== floatingShown.value) {
      floatingShown.value = shouldShow;
      runOnJS(setFloatingVisible)(shouldShow);
    }
  });

  const floatingStyle = useAnimatedStyle(() => {
    const start = FLOAT_THRESHOLD - FLOAT_FADE_RANGE;
    const raw = (scrollY.value - start) / FLOAT_FADE_RANGE;
    const progress = Math.min(1, Math.max(0, raw));
    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * -6 }],
    };
  });


  const inlineNavStyle = useAnimatedStyle(() => {
    const start = FLOAT_THRESHOLD - FLOAT_FADE_RANGE;
    const raw = (scrollY.value - start) / FLOAT_FADE_RANGE;
    const progress = Math.min(1, Math.max(0, raw));
    return { opacity: 1 - progress };
  });

  if (isOnboardingHydrating) {
    return <SplashScreen logo={require('../assets/splash-icon.png')} loading />;
  }


  if (!hasOnboarded) {
    return <Redirect href="/(onboarding)/phone" />;
  }

  const handleSelectAddress = (address: SelectedAddress) => {
    setSelectedAddress(address);
    addressSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[styles.backdrop, { backgroundColor: colors.primary }]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}
            onPress={() => addressSheetRef.current?.present()}
            hitSlop={8}
          >
            <MapPin size={16} color="#fff" />
            <Text fontWeight="600" style={styles.locationLabel} numberOfLines={1}>
              {selectedAddress?.formattedAddress ?? 'Select delivery address'}
            </Text>
          </Pressable>

          <Animated.View style={[styles.navRow, inlineNavStyle]}>
            <HomeSearchRow
              onPressSearch={() => router.push('/search')}
              onPressProfile={() => router.push('/profile')}
            />
          </Animated.View>

          <View style={styles.horizontalListWrap}>
            <ServiceList onDark />
          </View>
          <View style={[styles.body, { backgroundColor: colors.background }]}>
            <ServiceList layout="vertical" title="All Services" />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <Animated.View
        pointerEvents={floatingVisible ? 'auto' : 'none'}
        style={[
          styles.floatingHeader,
          floatingStyle,
          { paddingTop: insets.top, backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.navRow}>
          <HomeSearchRow
            onPressSearch={() => router.push('/search')}
            onPressProfile={() => router.push('/profile')}
          />
        </View>
      </Animated.View>

      <AddressSheet ref={addressSheetRef} onSelect={handleSelectAddress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: '70%' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  locationLabel: { flex: 1, color: '#fff', fontSize: 13 },
  pressed: { opacity: 0.6 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  horizontalListWrap: { marginTop: spacing.lg },
  body: { flex: 1, minHeight: 400, paddingTop: spacing.lg },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
