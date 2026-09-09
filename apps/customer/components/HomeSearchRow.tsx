import { Search, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { SquircleView } from 'expo-squircle-view';
import { ambientShadow, IconButton, radii, useTheme } from '@ub/ui';
import { AnimatedSearchPlaceholder } from './AnimatedSearchPlaceholder';

export interface HomeSearchRowProps {
  onPressSearch: () => void;
  onPressProfile: () => void;
}

/** The search bar + profile button pair shown on the home screen's header. */
export function HomeSearchRow({ onPressSearch, onPressProfile }: HomeSearchRowProps) {
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
      <IconButton onPress={onPressProfile}>
        <UserRound size={20} color={colors.ink} />
      </IconButton>
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
