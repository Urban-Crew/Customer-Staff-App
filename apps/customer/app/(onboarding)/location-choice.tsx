import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, spacing, useTheme } from '@ub/ui';

export default function LocationChoiceScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        <View style={styles.body}>
          <MapPin size={32} color={colors.ink} />
          <Text style={[styles.title, { color: colors.ink }]}>Where do you want your service?</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Set your location to see available services and verified staff in your area.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            label="At my current location"
            onPress={() => router.push('/(onboarding)/location-confirm')}
          />
          <Button
            label="I'll enter my location manually"
            variant="secondary"
            onPress={() => router.push('/(onboarding)/location-manual')}
          />
        </View>
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
    paddingTop: spacing.sm,
    minHeight: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  body: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  footer: { gap: spacing.md },
});
