import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@ub/ui';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { ServiceList } from '../components/ServiceList';
import { TabHeader } from '../components/TabHeader';

export default function CategoryServicesScreen() {
  const { colors } = useTheme();
  const { categoryId, categoryName, subCategoryId, subCategoryName } = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
    subCategoryId?: string;
    subCategoryName?: string;
  }>();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <TabHeader title={subCategoryName || categoryName || 'Services'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ServiceList
          layout="vertical"
          showTitle={false}
          showEmptyState
          categoryIdFilter={categoryId}
          categoryFilter={categoryName}
          subCategoryIdFilter={subCategoryId}
          subCategoryFilter={subCategoryName}
          onSelectService={(service) =>
            router.push({ pathname: '/service-detail', params: { serviceId: service.id } })
          }
        />
      </ScrollView>
      <FloatingCartBar bottomOffset={0} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xxl },
});
