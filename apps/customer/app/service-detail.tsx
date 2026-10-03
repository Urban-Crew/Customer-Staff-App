import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, Text, useTheme } from '@ub/ui';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { ServiceConfigModal } from '../components/ServiceConfigModal';
import { TabHeader } from '../components/TabHeader';
import { useServices } from '../hooks/useServices';

export default function ServiceDetailScreen() {
  const { colors } = useTheme();
  const { serviceId, variantId } = useLocalSearchParams<{
    serviceId?: string;
    variantId?: string;
  }>();
  const { data: services, isLoading } = useServices();
  const service = services?.find(
    (item) => item.id === serviceId || item.variants?.some((variant) => variant.id === variantId),
  );
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <TabHeader title="Service details" />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !service ? (
        <View style={styles.center}>
          <Text style={{ color: colors.inkMuted }}>This service is no longer available.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {service.imageUrl ? (
              <Image source={{ uri: service.imageUrl }} style={styles.image} contentFit="cover" />
            ) : null}
            <Text style={[styles.category, { color: colors.primary }]}>
              {service.subCategoryName || service.categoryName || 'Care service'}
            </Text>
            <Text variant="heading" style={[styles.title, { color: colors.ink }]}>
              {service.name}
            </Text>
            {service.description ? (
              <Text style={[styles.description, { color: colors.inkMuted }]}>
                {service.description}
              </Text>
            ) : null}
            <View style={[styles.packageCard, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.packageTitle, { color: colors.ink }]}>
                Flexible care packages
              </Text>
              <Text style={{ color: colors.inkMuted }}>
                {service.variants?.length
                  ? `${service.variants.length} package${service.variants.length === 1 ? '' : 's'} available`
                  : 'Package options available on request'}
              </Text>
            </View>
          </ScrollView>
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setConfigOpen(true)}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.ctaText}>Choose a package</Text>
            </Pressable>
          </View>
          <ServiceConfigModal
            visible={configOpen}
            service={service}
            onClose={() => setConfigOpen(false)}
            initialVariantId={variantId}
          />
          <FloatingCartBar bottomOffset={0} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  image: { width: '100%', height: 220, borderRadius: 20, marginBottom: spacing.lg },
  category: { fontSize: 13, marginBottom: spacing.xs },
  title: { fontSize: 26 },
  description: { fontSize: 15, lineHeight: 23, marginTop: spacing.sm },
  packageCard: { padding: spacing.lg, borderRadius: 18, marginTop: spacing.xl, gap: spacing.xs },
  packageTitle: { fontSize: 16 },
  footer: { padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { minHeight: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16 },
  pressed: { opacity: 0.8 },
});
