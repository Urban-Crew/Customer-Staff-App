import { useRef, useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  LogOut,
  MapPin,
  Pencil,
  UserRound,
} from 'lucide-react-native';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { cardStyle, spacing, SquircleView, Text, useTheme } from '@ub/ui';
import type { AuthUser, OtpAuthUser, SavedAddress } from '@ub/shared-types';
import { AddressSheet } from '../../components/AddressSheet';
import { TabHeader } from '../../components/TabHeader';
import { useAuthStore } from '../../lib/store/authStore';
import { useLocationStore } from '../../lib/store/locationStore';
import { useOnboardingFlowStore } from '../../lib/store/onboardingFlowStore';

const PRIVACY_URL = 'https://ubcrew.in/privacy';
const SUPPORT_EMAIL = 'support@ubcrew.in';
const BIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#AAA" d="M11.6068 21.9998H12.3937C15.1012 21.9998 16.4549 21.9998 17.3351 21.1366C18.2153 20.2734 18.3054 18.8575 18.4855 16.0256L18.745 11.945C18.8427 10.4085 18.8916 9.6402 18.45 9.15335C18.0084 8.6665 17.2628 8.6665 15.7714 8.6665H8.22905C6.73771 8.6665 5.99204 8.6665 5.55047 9.15335C5.10891 9.6402 5.15777 10.4085 5.25549 11.945L5.515 16.0256C5.6951 18.8575 5.78515 20.2734 6.66534 21.1366C7.54553 21.9998 8.89927 21.9998 11.6068 21.9998Z"/><path fill="#111" d="M3 6.52381C3 6.12932 3.32671 5.80952 3.72973 5.80952H8.51787C8.52437 4.9683 8.61554 3.81504 9.45037 3.01668C10.1074 2.38839 11.0081 2 12 2C12.9919 2 13.8926 2.38839 14.5496 3.01668C15.3844 3.81504 15.4756 4.9683 15.4821 5.80952H20.2703C20.6733 5.80952 21 6.12932 21 6.52381C21 6.9183 20.6733 7.2381 20.2703 7.2381H3.72973C3.32671 7.2381 3 6.9183 3 6.52381Z"/></svg>`;

function getDisplayName(user: AuthUser | OtpAuthUser | null): string {
  if (!user) return 'Guest';
  if (user.name) return user.name;
  if (user.email) return user.email;
  if ('phone' in user && user.phone) return user.phone;
  return 'Guest';
}

function AccountOption({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <SquircleView style={[styles.option, cardStyle, { borderColor: colors.border }]}>
        <View style={styles.optionIcon}>{icon}</View>
        <Text
          fontWeight="600"
          style={[styles.optionLabel, { color: destructive ? colors.error : colors.ink }]}
        >
          {label}
        </Text>
        <ChevronRight size={18} color={colors.inkFaint} />
      </SquircleView>
    </Pressable>
  );
}

export default function AccountScreen() {
  const { colors } = useTheme();
  const addressSheetRef = useRef<BottomSheetModal>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setAddress = useLocationStore((state) => state.setAddress);
  const resetOnboardingFlow = useOnboardingFlowStore((state) => state.reset);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      resetOnboardingFlow();
      router.replace('/(onboarding)/phone');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setAddress(address);
    addressSheetRef.current?.dismiss();
  };

  const requestAccountDeletion = () =>
    Alert.alert('Delete account', 'Account deletion requires a verified request to support.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Contact support',
        style: 'destructive',
        onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20account`),
      },
    ]);

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <TabHeader title="Account" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SquircleView style={[styles.profile, cardStyle, { borderColor: colors.border }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.secondaryBg, borderColor: colors.secondaryBorder },
            ]}
          >
            <UserRound size={30} color={colors.ink} />
          </View>
          <View style={styles.profileText}>
            <Text variant="heading" fontWeight="700" style={[styles.name, { color: colors.ink }]}>
              {getDisplayName(user)}
            </Text>
            {user?.email && user.email !== getDisplayName(user) ? (
              <Text style={[styles.detail, { color: colors.inkMuted }]}>{user.email}</Text>
            ) : null}
            {user && 'phone' in user && user.phone ? (
              <Text style={[styles.detail, { color: colors.inkMuted }]}>{user.phone}</Text>
            ) : null}
          </View>
        </SquircleView>

        <View style={styles.options}>
          <AccountOption
            icon={<Pencil size={19} color={colors.inkMuted} />}
            label="Edit account details"
            onPress={() =>
              Alert.alert(
                'Coming soon',
                'Account detail editing is not supported by the service yet.',
              )
            }
          />
          <AccountOption
            icon={<MapPin size={19} color={colors.inkMuted} />}
            label="My saved addresses"
            onPress={() => addressSheetRef.current?.present()}
          />
          <AccountOption
            icon={<CreditCard size={19} color={colors.inkMuted} />}
            label="Payment history"
            onPress={() => router.push('/(tabs)/bookings')}
          />
          <AccountOption
            icon={<FileText size={19} color={colors.inkMuted} />}
            label="Privacy policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <AccountOption
            icon={<CircleHelp size={19} color={colors.inkMuted} />}
            label="Help & support"
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
          <AccountOption
            icon={<LogOut size={19} color={colors.error} />}
            label={loggingOut ? 'Logging out…' : 'Log out'}
            onPress={handleLogout}
            destructive
          />
          <AccountOption
            icon={<SvgXml xml={BIN_ICON} width={19} height={19} />}
            label="Delete account"
            onPress={requestAccountDeletion}
            destructive
          />
        </View>
      </ScrollView>

      <AddressSheet ref={addressSheetRef} onSelect={handleAddressSelect} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1, gap: 3 },
  name: { fontSize: 19 },
  detail: { fontSize: 13 },
  options: { gap: spacing.sm },
  option: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { flex: 1, fontSize: 15 },
  pressed: { opacity: 0.65 },
});
