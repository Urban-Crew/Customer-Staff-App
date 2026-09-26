import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  cardStyle,
  LongArrow,
  radii,
  spacing,
  SquircleView,
  Text,
  useTheme,
  withAlpha,
} from '@ub/ui';
import type { Service } from '@ub/shared-types';
import { useServices } from '../hooks/useServices';
import { ServiceConfigModal } from './ServiceConfigModal';

const PLACEHOLDER_RATING = 4.8;

export interface ServiceListProps {
  onDark?: boolean;
  layout?: 'horizontal' | 'vertical';
  title?: string;
  /** Set false when the screen already has its own page heading (e.g. the Services tab). */
  showTitle?: boolean;
  onSelectService?: (service: Service) => void;
  initialServiceId?: string;
  categoryFilter?: string;
}

export function ServiceList({
  onDark = false,
  layout = 'horizontal',
  title = 'SERVICES AT A GLANCE',
  showTitle = true,
  onSelectService,
  initialServiceId,
  categoryFilter,
}: ServiceListProps) {
  const { colors } = useTheme();
  const { data: services, isLoading } = useServices();
  const [modalService, setModalService] = useState<Service | null>(null);

  useEffect(() => {
    if (initialServiceId && services?.length) {
      const match = services.find((s) => s.id === initialServiceId);
      if (match) {
        setModalService(match);
      }
    }
  }, [initialServiceId, services]);

  const displayedServices = useMemo(() => {
    if (!services) return [];
    if (!categoryFilter) return services;
    const filtered = services.filter(
      (s) => s.categoryName?.toLowerCase() === categoryFilter.toLowerCase(),
    );
    return filtered.length > 0 ? filtered : services;
  }, [services, categoryFilter]);

  const handleCardPress = (service: Service) => {
    if (onSelectService) {
      onSelectService(service);
    } else {
      setModalService(service);
    }
  };

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {showTitle ? (
        <Text
          variant="heading"
          fontWeight="700"
          numberOfLines={1}
          style={[
            styles.title,
            layout === 'vertical' && styles.titleVertical,
            { color: onDark ? '#fff' : colors.ink },
          ]}
        >
          {title}
        </Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={onDark ? '#fff' : colors.primary} />
        </View>
      ) : !displayedServices.length ? null : layout === 'vertical' ? (
        <View style={styles.list}>
          {displayedServices.map((service, index) => (
            <VerticalItem
              key={service.id}
              service={service}
              onDark={onDark}
              index={index}
              onPress={() => handleCardPress(service)}
            />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {displayedServices.map((service) => (
            <HorizontalItem
              key={service.id}
              service={service}
              onDark={onDark}
              onPress={() => handleCardPress(service)}
            />
          ))}
        </ScrollView>
      )}

      {/* Built-in variant/addon configurator modal */}
      <ServiceConfigModal
        visible={!!modalService}
        service={
          modalService
            ? {
                id: modalService.id,
                name: modalService.name,
                imageUrl: modalService.imageUrl,
                categoryName: modalService.categoryName,
                variants: modalService.variants,
                addons: modalService.addons,
              }
            : null
        }
        onClose={() => setModalService(null)}
      />
    </View>
  );
}

function HorizontalItem({
  service,
  onDark,
  onPress,
}: {
  service: Service;
  onDark: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const tint = onDark ? colors.primaryText : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={[withAlpha(tint, 0.22), withAlpha(tint, 0)]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.outerCard}
      >
        <View
          style={[
            styles.innerCard,
            { backgroundColor: withAlpha(tint, 0.14), borderColor: withAlpha(tint, 0.24) },
          ]}
        >
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
    </Pressable>
  );
}

/** Its own squircle card, icon chip + name + rating + a trailing chevron. Top-rated services get a shining gold border and a flag chip straddling it; the rest get a small grey top shine instead. */

function VerticalItem({
  service,
  onDark,
  index,
  onPress,
}: {
  service: Service;
  onDark: boolean;
  index: number;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const rating = service.rating ?? PLACEHOLDER_RATING;
  const isTopRated = service.topRated ?? index === 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardWrap,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
    >
      <SquircleView
        cornerSmoothing={100}
        style={[
          cardStyle,
          styles.card,
          {
            backgroundColor: onDark ? withAlpha(colors.primaryText, 0.1) : colors.surface,
            borderColor: onDark ? withAlpha(colors.primaryText, 0.18) : colors.border,
          },
          isTopRated && {
            borderColor: colors.accent,
            borderWidth: 1.5,
            boxShadow: `0px 0px 14px ${withAlpha(colors.accent, 0.55)}`,
          },
        ]}
      >
        {!isTopRated ? (
          <LinearGradient
            colors={[withAlpha(colors.ink, 0.16), withAlpha(colors.ink, 0)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.topShade}
          />
        ) : null}
        <View style={styles.rowIconChip}>
          <Image
            source={{ uri: service.imageUrl }}
            style={styles.rowIconImage}
            contentFit="contain"
          />
        </View>
        <View style={styles.rowTextCol}>
          <Text
            style={[styles.rowLabel, { color: onDark ? '#fff' : colors.ink }]}
            fontWeight="700"
            numberOfLines={1}
          >
            {service.name}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={12} color={colors.accent} fill={colors.accent} />
            <Text
              fontWeight="600"
              style={[
                styles.ratingText,
                { color: onDark ? withAlpha(colors.primaryText, 0.75) : colors.inkFaint },
              ]}
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <LongArrow
          direction="right"
          size={20}
          color={onDark ? withAlpha(colors.primaryText, 0.7) : colors.inkFaint}
        />
      </SquircleView>

      {isTopRated ? (
        <View style={[styles.topRatedBadge, { backgroundColor: colors.accent }]}>
          <Text fontWeight="700" style={styles.topRatedText}>
            Top Rated
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const ROW_ICON_SIZE = 48;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleVertical: {
    fontSize: 16,
    textAlign: 'left',
    textTransform: 'none',
    letterSpacing: 0,
  },
  loadingRow: { paddingVertical: spacing.lg, alignItems: 'center' },

  // horizontal layout
  row: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  item: { alignItems: 'center', width: 84, overflow: 'hidden' },
  outerCard: {
    width: 84,
    height: 78,
    borderRadius: 22,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCard: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: 48, height: 48 },
  label: { marginTop: spacing.sm, fontSize: 14, textAlign: 'center' },

  // vertical layout
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
  cardWrap: { position: 'relative' },
  topShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    borderTopLeftRadius: radii.squircle,
    borderTopRightRadius: radii.squircle,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowIconChip: {
    width: ROW_ICON_SIZE,
    height: ROW_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconImage: { width: 36, height: 36 },
  rowTextCol: { flex: 1, gap: 3 },
  rowLabel: { fontSize: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12 },
  topRatedBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
  },
  topRatedText: { fontSize: 10, color: '#fff', letterSpacing: 0.2 },
});
