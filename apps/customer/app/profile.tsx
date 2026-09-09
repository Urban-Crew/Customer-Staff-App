import { useState } from 'react';
import { router } from 'expo-router';
import { LogOut, UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton, Button, spacing, useTheme } from '@ub/ui';
import type { AuthUser, OtpAuthUser } from '@ub/shared-types';
import { Text } from '../components';
import { useAuthStore } from '../lib/store/authStore';
import { useOnboardingFlowStore } from '../lib/store/onboardingFlowStore';

function getDisplayName(user: AuthUser | OtpAuthUser | null): string {
  if (!user) return 'Guest';
  if (user.name) return user.name;
  if ('phone' in user && user.phone) return user.phone;
  if (user.email) return user.email;
  return 'Guest';
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetOnboardingFlow = useOnboardingFlowStore((s) => s.reset);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = getDisplayName(user);

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

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.topNav}>
        <BackButton onPress={() => router.back()} color={colors.ink} />
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.secondaryBg, borderColor: colors.secondaryBorder }]}>
            <UserRound size={28} color={colors.ink} />
          </View>
          <Text variant="heading" fontWeight="700" style={[styles.name, { color: colors.ink }]}>
            {displayName}
          </Text>
          {user?.email ? (
            <Text style={[styles.email, { color: colors.inkMuted }]}>{user.email}</Text>
          ) : null}
        </View>

        <Button
          label="Log out"
          variant="secondary"
          icon={<LogOut size={18} color={colors.error} />}
          style={{ borderColor: colors.error }}
          labelStyle={{ color: colors.error }}
          loading={loggingOut}
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  identity: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20 },
  email: { fontSize: 14 },
});
