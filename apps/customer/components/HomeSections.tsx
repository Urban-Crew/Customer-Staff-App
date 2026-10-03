import { StyleSheet, View } from 'react-native';
import { spacing, Text, useTheme } from '@ub/ui';
import type { HomeSection } from '@ub/shared-types';
import { TopIconsGrid } from './TopIconsGrid';

export function HomeSections({ sections }: { sections: HomeSection[] }) {
  const { colors } = useTheme();
  const visibleSections = [...sections]
    .filter((section) => section.items.length > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (!visibleSections.length) return null;

  return (
    <View>
      {visibleSections.map((section) => (
        <View key={section.id}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.section}>
            <Text variant="heading" style={[styles.title, { color: colors.ink }]}>
              {section.title}
            </Text>
            <TopIconsGrid
              showAllServices={false}
              topIcons={section.items.map((item) => ({
                ...item,
                entity: {
                  ...item.entity,
                  iconUrl: item.entity.iconUrl ?? item.entity.thumbnailUrl ?? item.entity.imageUrl,
                },
              }))}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { height: 4 },
  section: { paddingTop: spacing.md },
  title: { fontSize: 18, marginHorizontal: spacing.lg, marginBottom: spacing.xs },
});
