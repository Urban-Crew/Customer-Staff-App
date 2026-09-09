import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SplashScreen, useTheme } from '@ub/ui';
import { useOnboardingStore } from '../../lib/store/onboardingStore';

// react-navigation's bottom tabs handle the home-indicator inset fine on
// iOS, but on Android (especially with edge-to-edge, the default from
// Android 15/SDK 35) the bar ends up flush against the gesture/nav bar —
// pad it out ourselves there instead.
const BASE_TAB_BAR_HEIGHT = 56;
const ICON_SIZE = 20;

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);

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
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="home" size={ICON_SIZE} color={colors.inkMuted} />
            ) : (
              <Feather name="home" size={ICON_SIZE} color={colors.inkFaint} />
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
