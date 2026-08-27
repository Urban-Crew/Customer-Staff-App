import { useEffect, useRef } from 'react';
import { router, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin, Search, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, radii, SplashScreen, spacing, Text, useTheme } from '@ub/ui';
import type { SelectedAddress } from '../lib/store/locationStore';
import { AddressSheet } from '../components/AddressSheet';
import { AnimatedSearchPlaceholder } from '../components/AnimatedSearchPlaceholder';
import { ServiceList } from '../components/ServiceList';
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
  const setSelectedAddress = useLocationStore((s) => s.setAddress);
  const addressSheetRef = useRef<BottomSheetModal>(null);

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

  const handleSelectAddress = (address: SelectedAddress) => {
    setSelectedAddress(address);
    addressSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <SafeAreaView edges={['top']}>
          {selectedAddress ? (
            <Pressable
              style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}
              onPress={() => addressSheetRef.current?.present()}
              hitSlop={8}
            >
              <MapPin size={16} color="#fff" />
              <Text fontWeight="600" style={styles.locationLabel} numberOfLines={1}>
                {selectedAddress.formattedAddress}
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.navRow}>
            <Pressable
              style={[styles.searchBar, { backgroundColor: colors.inputBg }]}
              onPress={() => router.push('/search')}
            >
              <Search size={18} color={'#000'} />
              <AnimatedSearchPlaceholder color={colors.placeholder} />
            </Pressable>
            <IconButton
              variant="plain"
              style={[
                styles.profileButton,
                { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.6)' },
              ]}
              onPress={() => router.push('/profile')}
            >
              <UserRound size={22} color="#fff" />
            </IconButton>
          </View>
          <View style={styles.servicesRow}>
            <ServiceList onDark />
          </View>
        </SafeAreaView>
      </View>
      <View style={styles.body} />

      <AddressSheet ref={addressSheetRef} onSelect={handleSelectAddress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingBottom: spacing.lg },
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
    marginTop: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    height: 48,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  servicesRow: { marginTop: spacing.lg },
  body: { flex: 1 },
});
