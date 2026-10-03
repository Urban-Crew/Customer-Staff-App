import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@ub/ui';
import { FloatingCartBar } from '../../components/FloatingCartBar';
import { ServiceList } from '../../components/ServiceList';
import { TabHeader } from '../../components/TabHeader';

export default function ServicesScreen() {
  const { colors } = useTheme();
  const { serviceId, categoryName, subCategoryName } = useLocalSearchParams<{
    serviceId?: string;
    categoryName?: string;
    subCategoryName?: string;
  }>();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <TabHeader title={subCategoryName || categoryName || 'Services'} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ServiceList
          layout="vertical"
          showTitle={false}
          showEmptyState
          initialServiceId={serviceId}
          categoryFilter={categoryName}
          subCategoryFilter={subCategoryName}
        />
      </ScrollView>

      <FloatingCartBar bottomOffset={56} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
});
