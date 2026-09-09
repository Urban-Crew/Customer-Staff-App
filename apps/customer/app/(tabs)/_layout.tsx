import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SplashScreen, useTheme } from '@ub/ui';
import { useOnboardingStore } from '../../lib/store/onboardingStore';

export default function TabsLayout() {
  const { colors } = useTheme();
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
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.hairline,
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
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <Ionicons name="home" size={size} color={colors.inkMuted} />
            ) : (
              <Feather name="home" size={size} color={colors.inkFaint} />
            ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <Ionicons name="calendar" size={size} color={colors.inkMuted} />
            ) : (
              <Feather name="calendar" size={size} color={colors.inkFaint} />
            ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <Ionicons name="grid" size={size} color={colors.inkMuted} />
            ) : (
              <Feather name="grid" size={size} color={colors.inkFaint} />
            ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <Ionicons name="person" size={size} color={colors.inkMuted} />
            ) : (
              <Feather name="user" size={size} color={colors.inkFaint} />
            ),
        }}
      />
    </Tabs>
  );
}
