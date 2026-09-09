import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { spacing, Text, useTheme } from '@ub/ui';
import type { Service } from '@ub/shared-types';
import { useServices } from '../hooks/useServices';

const GOLD = '#D4AF37';

export interface ServiceListProps {
  onDark?: boolean;
}

export function ServiceList({ onDark = false }: ServiceListProps) {
  const { colors } = useTheme();
  const { data: services, isLoading } = useServices();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        variant="heading"
        fontWeight="700"
        numberOfLines={1}
        style={[styles.title, { color: onDark ? '#fff' : colors.ink }]}
      >
        SERVICES AT A GLANCE
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
      <LinearGradient
        colors={[GOLD, `${GOLD}00`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.outerCard}
      >
        <View style={[styles.innerCard, { backgroundColor: colors.primary }]}>
          <Image source={{ uri: service.imageUrl }} style={styles.iconImage} contentFit="cover" />
        </View>
      </LinearGradient>
      <Text
        style={[styles.label, { color: onDark ? '#fff' : colors.ink }]}
        fontWeight="800"
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
    letterSpacing: 1,
  },
  row: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  loadingRow: { paddingVertical: spacing.lg, alignItems: 'center' },
  item: { alignItems: 'center', width: 84 },
  outerCard: {
    width: 84,
    height: 92,
    borderRadius: 22,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: 48, height: 48 },
  label: { marginTop: spacing.sm, fontSize: 14, textAlign: 'center' },
});
