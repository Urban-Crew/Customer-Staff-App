import { Image } from 'expo-image';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { spacing, Text, useTheme } from '@ub/ui';
import type { Service } from '@ub/shared-types';
import { useServices } from '../hooks/useServices';

export interface ServiceListProps {
  onDark?: boolean;
}

export function ServiceList({ onDark = false }: ServiceListProps) {
  const { colors } = useTheme();
  const { data: services, isLoading } = useServices();

  return (
    <View>
      <Text
        variant="heading"
        fontWeight="700"
        numberOfLines={1}
        style={[styles.title, { color: onDark ? '#fff' : colors.ink }]}
      >
        Our Services
      </Text>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={onDark ? '#fff' : colors.primary} />
        </View>
      ) : !services?.length ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} onDark={onDark} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ServiceItem({ service, onDark }: { service: Service; onDark: boolean }) {
  const { colors } = useTheme();

  return (
    <View style={styles.item}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surface,
            borderColor: onDark ? 'rgba(255,255,255,0.4)' : colors.border,
          },
        ]}
      >
        <Image source={{ uri: service.imageUrl }} style={styles.iconImage} contentFit="cover" />
      </View>
      <Text
        style={[styles.label, { color: onDark ? '#fff' : colors.ink }]}
        fontWeight="600"
        numberOfLines={1}
      >
        {service.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  row: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  loadingRow: { paddingVertical: spacing.lg, alignItems: 'center' },
  item: { alignItems: 'center', width: 72 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
    gap: 20,
  },
  iconImage: { width: 48, height: 48 },
  label: { marginTop: spacing.xs, fontSize: 12, textAlign: 'center' },
});
