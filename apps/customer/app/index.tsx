import { useEffect } from 'react';
import { router, Redirect } from 'expo-router';
import { Search, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Input, SplashScreen, spacing, useTheme } from '@ub/ui';
import { useAuthStore } from '../lib/store/authStore';
import { useOnboardingStore } from '../lib/store/onboardingStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

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
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <SafeAreaView edges={['top']}>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  searchInput: { flex: 1 },
  body: { flex: 1 },
});
