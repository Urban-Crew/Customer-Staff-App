import {
  Bug,
  Hammer,
  PaintBucket,
  Scissors,
  Sparkles,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { spacing, Text, useTheme } from '@ub/ui';
import type { Service } from '@ub/shared-types';
import { useServices } from '../hooks/useServices';

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Wrench,
  Wind,
  Sparkles,
  Scissors,
  Bug,
  Hammer,
  PaintBucket,
};

export interface ServiceListProps {
  onDark?: boolean;
}

export function ServiceList({ onDark = false }: ServiceListProps) {
  const { colors } = useTheme();
  const { data: services, isLoading } = useServices();

  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={onDark ? '#fff' : colors.primary} />
      </View>
    );
  }

  if (!services?.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {services.map((service) => (
        <ServiceItem key={service.id} service={service} onDark={onDark} />
      ))}
    </ScrollView>
  );
}

function ServiceItem({ service, onDark }: { service: Service; onDark: boolean }) {
  const { colors } = useTheme();
  const Icon = ICONS[service.icon] ?? Zap;

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
        <Icon size={22} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: onDark ? '#fff' : colors.ink }]} numberOfLines={1}>
        {service.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  loadingRow: { paddingVertical: spacing.lg, alignItems: 'center' },
  item: { alignItems: 'center', width: 72 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
  },
  label: { marginTop: spacing.xs, fontSize: 12, textAlign: 'center' },
});
