import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { spacing, Text, useTheme } from '@ub/ui';
import type { HomeHeaderConfig, HomeHeaderGradientDirection } from '@ub/shared-types';
import type { SelectedAddress } from '../../lib/store/locationStore';
import { AddressSheet } from '../../components/AddressSheet';
import { HomeSearchRow } from '../../components/HomeSearchRow';
import { PromoBanners } from '../../components/PromoBanners';
import { ServiceList } from '../../components/ServiceList';
import { useHomeFeed } from '../../hooks/useHomeFeed';
import { useLocationStore } from '../../lib/store/locationStore';

// Scroll offset (px) past which the address row has scrolled out and the
// floating search bar should be fully visible/interactive. Crossfades over
// a small range leading up to it, rather than popping in at one instant.
const FLOAT_THRESHOLD = 40;
const FLOAT_FADE_RANGE = 16;

const GRADIENT_POINTS: Record<
  HomeHeaderGradientDirection,
  { start: { x: number; y: number }; end: { x: number; y: number } }
> = {
  LEFT_TO_RIGHT: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
  RIGHT_TO_LEFT: { start: { x: 1, y: 0.5 }, end: { x: 0, y: 0.5 } },
  TOP_TO_BOTTOM: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  BOTTOM_TO_TOP: { start: { x: 0.5, y: 1 }, end: { x: 0.5, y: 0 } },
  DIAGONAL_TOP_LEFT_TO_BOTTOM_RIGHT: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  DIAGONAL_TOP_RIGHT_TO_BOTTOM_LEFT: { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  DIAGONAL_BOTTOM_LEFT_TO_TOP_RIGHT: { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  DIAGONAL_BOTTOM_RIGHT_TO_TOP_LEFT: { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } },
};

/** The color container's fill — a gradient or solid color from the home feed's `header`, falling back to the theme's primary while it loads. */
function HeaderFill({
  header,
  fallback,
  style,
}: {
  header?: HomeHeaderConfig;
  fallback: string;
  style: StyleProp<ViewStyle>;
}) {
  if (header?.backgroundType === 'GRADIENT' && header.gradientColors && header.gradientColors.length >= 2) {
    const points = GRADIENT_POINTS[header.gradientDirection ?? 'LEFT_TO_RIGHT'];
    return (
      <LinearGradient
        colors={header.gradientColors as [string, string, ...string[]]}
        start={points.start}
        end={points.end}
        style={style}
      />
    );
  }
  return <View style={[style, { backgroundColor: header?.solidColor ?? fallback }]} />;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: homeFeed } = useHomeFeed();
  const selectedAddress = useLocationStore((s) => s.address);
  const hydrateLocation = useLocationStore((s) => s.hydrate);
  const setSelectedAddress = useLocationStore((s) => s.setAddress);
  const addressSheetRef = useRef<BottomSheetModal>(null);

  const scrollY = useSharedValue(0);
  const floatingShown = useSharedValue(false);
  const [floatingVisible, setFloatingVisible] = useState(false);

  useEffect(() => {
    hydrateLocation();
  }, [hydrateLocation]);

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

  // Exact inverse of floatingStyle's opacity, computed from the same
  // scrollY — so the inline row and the floating copy are never both
  // (partially) visible at once, in either scroll direction.
  const inlineNavStyle = useAnimatedStyle(() => {
    const start = FLOAT_THRESHOLD - FLOAT_FADE_RANGE;
    const raw = (scrollY.value - start) / FLOAT_FADE_RANGE;
    const progress = Math.min(1, Math.max(0, raw));
    return { opacity: 1 - progress };
  });

  const handleSelectAddress = (address: SelectedAddress) => {
    setSelectedAddress(address);
    addressSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={styles.backdrop}>
        <HeaderFill header={homeFeed?.header} fallback={colors.primary} style={StyleSheet.absoluteFill} />
      </View>

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
              onPressProfile={() => router.push('/account')}
            />
          </Animated.View>

          <View style={styles.bannersWrap}>
            <PromoBanners banners={homeFeed?.promoBanners ?? []} />
          </View>

          <View style={[styles.body, { backgroundColor: colors.background }]}>
            <ServiceList layout="vertical" title="All Services" />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <Animated.View
        pointerEvents={floatingVisible ? 'auto' : 'none'}
        style={[styles.floatingHeader, floatingStyle, { paddingTop: insets.top }]}
      >
        <HeaderFill header={homeFeed?.header} fallback={colors.primary} style={StyleSheet.absoluteFill} />
        <View style={styles.navRow}>
          <HomeSearchRow
            onPressSearch={() => router.push('/search')}
            onPressProfile={() => router.push('/account')}
          />
        </View>
      </Animated.View>

      <AddressSheet ref={addressSheetRef} onSelect={handleSelectAddress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: '34%' },
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
    paddingBottom: spacing.md,
  },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  bannersWrap: { marginTop: spacing.md },
  body: { flex: 1, minHeight: 400, marginTop: spacing.lg, paddingTop: spacing.lg },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
