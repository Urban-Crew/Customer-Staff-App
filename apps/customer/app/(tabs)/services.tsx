import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@ub/ui';
import { Text } from '../../components';
import { FloatingCartBar } from '../../components/FloatingCartBar';
import { ServiceList } from '../../components/ServiceList';

export default function ServicesScreen() {
  const { colors } = useTheme();
  const { serviceId, categoryName } = useLocalSearchParams<{
    serviceId?: string;
    categoryName?: string;
  }>();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <Text variant="heading" fontWeight="700" style={[styles.title, { color: colors.ink }]}>
        {categoryName || 'Services'}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ServiceList
          layout="vertical"
          showTitle={false}
          initialServiceId={serviceId}
          categoryFilter={categoryName}
        />
      </ScrollView>

      <FloatingCartBar bottomOffset={56} />
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
