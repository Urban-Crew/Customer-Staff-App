import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { spacing, Text, useTheme } from '@ub/ui';
import type { HomeTopIcon } from '@ub/shared-types';

export interface TopIconsGridProps {
  topIcons: HomeTopIcon[];
}

const COLUMNS = 3;
const ICON_SIZE = 26;

/** Renders a remote category icon — .svg via react-native-svg's SvgUri, anything else via expo-image. Falls back to a generic tag icon when the API sends no icon at all. */
function EntityIcon({ uri, color }: { uri: string | null; color: string }) {
  if (!uri) {
    return <Feather name="tag" size={ICON_SIZE - 2} color={color} />;
  }
  if (uri.toLowerCase().endsWith('.svg')) {
    return <SvgUri uri={uri} width={ICON_SIZE} height={ICON_SIZE} />;
  }
  return (
    <Image source={{ uri }} style={{ width: ICON_SIZE, height: ICON_SIZE }} contentFit="contain" />
  );
}

/**
 * 3-column grid of the home feed's `topIcons` — CATEGORY, SUB_CATEGORY,
 * SERVICE_VARIANT and SERVICE all share the same `{name, slug, iconUrl}`
 * entity shape, so nothing here branches on entityType yet (per-type
 * behavior is still TBD). A trailing "All Services" tile — not from the
 * API — always closes out the grid, using the same icon as the bottom
 * nav's Services tab.
 */
export function TopIconsGrid({ topIcons }: TopIconsGridProps) {
  const { colors } = useTheme();
  const sorted = [...topIcons].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <View style={styles.grid}>
      {sorted.map((item) => (
        <View key={item.id} style={styles.cell}>
          <Pressable hitSlop={4} style={styles.cellContent}>
            <View style={[styles.iconChip, { backgroundColor: colors.surfaceSubtle }]}>
              <EntityIcon uri={item.entity.iconUrl} color={colors.ink} />
            </View>
            <Text numberOfLines={2} style={[styles.label, { color: colors.ink }]}>
              {item.entity.name}
            </Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.cell}>
        <Pressable hitSlop={4} style={styles.cellContent} onPress={() => router.push('/services')}>
          <View style={[styles.iconChip, { backgroundColor: colors.surfaceSubtle }]}>
            <Feather name="grid" size={ICON_SIZE - 2} color={colors.ink} />
          </View>
          <Text numberOfLines={2} style={[styles.label, { color: colors.ink }]}>
            All Services
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  cell: { width: `${100 / COLUMNS}%` },
  cellContent: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  iconChip: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, textAlign: 'center' },
});
