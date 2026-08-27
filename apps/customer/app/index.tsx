import { useEffect } from 'react';
import { router, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Search, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Input, radii, SplashScreen, spacing, Text, useTheme } from '@ub/ui';
import { useAuthStore } from '../lib/store/authStore';
import { useLocationStore } from '../lib/store/locationStore';
import { useOnboardingStore } from '../lib/store/onboardingStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const selectedAddress = useLocationStore((s) => s.address);
  const hydrateLocation = useLocationStore((s) => s.hydrate);

  useEffect(() => {
    hydrateOnboarding();
    hydrateLocation();
  }, [hydrateOnboarding, hydrateLocation]);

  if (isOnboardingHydrating) {
    return <SplashScreen logo={require('../assets/splash-icon.png')} loading />;
  }

  // Onboarding also covers phone/OTP login, so an incomplete session sends
  // the user back there whether they've never onboarded or have logged out.
  if (!hasOnboarded || !isAuthenticated) {
    return <Redirect href="/(onboarding)/phone" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <SafeAreaView edges={['top']}>
          {selectedAddress ? (
            <View style={styles.locationRow}>
              <MapPin size={16} color="#fff" />
              <Text fontWeight="600" style={styles.locationLabel} numberOfLines={1}>
                {selectedAddress.formattedAddress}
              </Text>
            </View>
          ) : null}
          <View style={styles.navRow}>
            <Input
              style={styles.searchInput}
              placeholder="Search"
              left={<Search size={18} color={colors.inkFaint} />}
            />
            <IconButton variant="plain" onPress={() => router.push('/profile')}>
              <UserRound size={22} color="#fff" />
            </IconButton>
          </View>
        </SafeAreaView>
      </View>
      <View style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { height: '40%' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  locationLabel: { flex: 1, color: '#fff', fontSize: 13 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  searchInput: { flex: 1, borderRadius: radii.pill },
  body: { flex: 1 },
});
