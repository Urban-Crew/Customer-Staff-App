import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { ambientShadow, radii, SquircleView, useTheme } from '@ub/ui';
import { AnimatedSearchPlaceholder } from './AnimatedSearchPlaceholder';

export interface HomeSearchRowProps {
  onPressSearch: () => void;
}

/** The search bar shown on the home screen's header. */
export function HomeSearchRow({ onPressSearch }: HomeSearchRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <Pressable style={styles.searchPressable} onPress={onPressSearch}>
        <SquircleView
          cornerSmoothing={100}
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={18} color={colors.placeholder} />
          <AnimatedSearchPlaceholder color={colors.placeholder} />
        </SquircleView>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  searchPressable: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.squircle,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    boxShadow: ambientShadow,
  },
});
