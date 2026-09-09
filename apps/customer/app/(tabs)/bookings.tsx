import { router } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, spacing, useTheme } from '@ub/ui';
import { Text } from '../../components';

export default function BookingsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <Text variant="heading" fontWeight="700" style={[styles.title, { color: colors.ink }]}>
        Bookings
      </Text>

      <View style={styles.empty}>
        <View
          style={[
            styles.icon,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
        >
          <Calendar size={26} color={colors.inkFaint} strokeWidth={2} />
        </View>
        <Text variant="heading" fontWeight="700" style={[styles.emptyTitle, { color: colors.ink }]}>
          No bookings yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.inkMuted }]}>
          Once you book a service, you'll see it here.
        </Text>
        <Button label="Browse services" onPress={() => router.push('/services')} fullWidth={false} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: {
    fontSize: 22,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: { fontSize: 17 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.md },
});
