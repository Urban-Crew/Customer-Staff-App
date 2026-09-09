import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@ub/ui';
import { Text } from '../../components';
import { ServiceList } from '../../components/ServiceList';

export default function ServicesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <Text variant="heading" fontWeight="700" style={[styles.title, { color: colors.ink }]}>
        Services
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ServiceList layout="vertical" showTitle={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: {
    fontSize: 22,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
});
