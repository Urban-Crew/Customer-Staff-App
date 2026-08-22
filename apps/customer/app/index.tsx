import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Badge, Button, GlassBackdrop, SplashScreen, useTheme } from '@ub/ui';
import { useOnboardingStore } from '../lib/store/onboardingStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const sheet = useRef<TrueSheet>(null);
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const isOnboardingHydrating = useOnboardingStore((s) => s.isHydrating);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  if (isOnboardingHydrating) {
    return <SplashScreen logo={require('../assets/splash-icon.png')} loading />;
  }

  if (!hasOnboarded) {
    return <Redirect href="/(onboarding)/phone" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlassBackdrop />
      <Badge icon={<Sparkles size={20} color={colors.primaryText} />} label="Customer app" />
      <Text style={[styles.hint, { color: colors.inkMuted }]}>
        Open up app/index.tsx to start working on it!
      </Text>
      <Button label="Open sheet" onPress={() => sheet.current?.present()} />

      <TrueSheet
        ref={sheet}
        detents={['auto', 0.6, 1]}
        style={[styles.sheetContent, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>A true native bottom sheet</Text>
        <Button label="Close" variant="secondary" onPress={() => sheet.current?.dismiss()} />
      </TrueSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  hint: { fontSize: 14 },
  sheetContent: {
    padding: 24,
    gap: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
});
