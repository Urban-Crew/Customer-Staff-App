import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Platform, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SplashScreen, useTheme } from '@ub/ui';
import { useCart } from '../../hooks/useCart';
import { useOnboardingStore } from '../../lib/store/onboardingStore';
import { CartIcon } from '../../components/CartIcon';

// react-navigation's bottom tabs handle the home-indicator inset fine on
// iOS, but on Android (especially with edge-to-edge, the default from
// Android 15/SDK 35) the bar ends up flush against the gesture/nav bar —
// pad it out ourselves there instead.
const BASE_TAB_BAR_HEIGHT = 56;
const ICON_SIZE = 20;
const homeSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="m38.22 17-1.95-1.59v-5.25a1.4 1.4 0 1 0-2.79 0v2.93L28.43 9a7 7 0 0 0-8.86 0l-9.79 8a6.92 6.92 0 0 0-2.56 5.38v11.3a7 7 0 0 0 7 7h19.57a7 7 0 0 0 7-7V22.34A6.92 6.92 0 0 0 38.22 17ZM19.81 37.83v-9.68a4.2 4.2 0 0 1 8.39 0v9.68ZM38 33.64a4.2 4.2 0 0 1-4.19 4.19H31v-9.68a7 7 0 0 0-14 0v9.68h-2.8a4.2 4.2 0 0 1-4.2-4.19v-11.3a4.19 4.19 0 0 1 1.54-3.25l9.79-8a4.21 4.21 0 0 1 5.3 0l9.79 8A4.19 4.19 0 0 1 38 22.34Z" fill="${color}"/></svg>`;

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const { data: cart } = useCart();

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  if (isOnboardingHydrating) {
    return <SplashScreen logo={require('../../assets/splash-icon.png')} loading />;
  }

  // Guards every tab, not just Home — a direct/deep link into e.g. /bookings
  // shouldn't skip onboarding. Intentionally doesn't require `isAuthenticated`;
  // see the note in (tabs)/index.tsx.
  if (!hasOnboarded) {
    return <Redirect href="/(onboarding)/phone" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        // The default tabBarButton is a PlatformPressable, which shows
        // Android's ripple touch feedback (not present on iOS) — swap in a
        // plain Pressable with the ripple color zeroed out to drop it.
        tabBarButton: ({ ref: _ref, ...props }) => (
          <Pressable {...props} android_ripple={{ color: 'transparent' }} />
        ),
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.hairline,
          ...(Platform.OS === 'android'
            ? {
                height: BASE_TAB_BAR_HEIGHT + insets.bottom,
                paddingBottom: insets.bottom,
              }
            : null),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // Feather (outline) when inactive — it has no filled variant, so the
          // active state swaps to the matching solid Ionicons glyph instead.
          tabBarIcon: ({ focused }) => (
            <SvgXml
              xml={homeSvg(focused ? colors.primary : colors.inkFaint)}
              width={ICON_SIZE}
              height={ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="grid" size={ICON_SIZE} color={colors.inkMuted} />
            ) : (
              <Feather name="grid" size={ICON_SIZE} color={colors.inkFaint} />
            ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cart && cart.itemCount > 0 ? cart.itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: '#fff',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 14,
          },
          tabBarIcon: ({ focused }) => (
            <CartIcon color={focused ? colors.primary : colors.inkFaint} size={ICON_SIZE} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="calendar" size={ICON_SIZE} color={colors.inkMuted} />
            ) : (
              <Feather name="calendar" size={ICON_SIZE} color={colors.inkFaint} />
            ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={ICON_SIZE} color={colors.inkMuted} />
            ) : (
              <Feather name="user" size={ICON_SIZE} color={colors.inkFaint} />
            ),
        }}
      />
    </Tabs>
  );
}
