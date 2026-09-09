import { LinearGradient } from 'expo-linear-gradient';
import { Search, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { SquircleView } from 'expo-squircle-view';
import { IconButton, spacing, useTheme, withAlpha } from '@ub/ui';
import { AnimatedSearchPlaceholder } from './AnimatedSearchPlaceholder';

export interface HomeSearchRowProps {
  onPressSearch: () => void;
  onPressProfile: () => void;
}

/**
 * The search bar + profile button pair shown on the home screen's header.
 * Rendered twice by index.tsx (inline below the address row, and again as a
 * floating pinned copy once scrolled past) — pulled out here so both copies
 * always stay pixel-identical.
 */
export function HomeSearchRow({ onPressSearch, onPressProfile }: HomeSearchRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <Pressable style={styles.searchPressable} onPress={onPressSearch}>
        <SquircleView
          cornerSmoothing={100}
          style={[styles.searchOuter, { backgroundColor: 'transparent' }]}
        >
          <LinearGradient
            colors={[withAlpha(colors.inputBg, 0.65), withAlpha(colors.inputBg, 0.25)]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.searchOuterFill}
          >
            <SquircleView
              cornerSmoothing={100}
              style={[styles.searchBar, { backgroundColor: 'transparent', overflow: 'hidden' }]}
            >
              <LinearGradient
                colors={[withAlpha(colors.inputBg, 0.95), withAlpha(colors.inputBg, 0.75)]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.searchBarFill}
              >
                <Search size={18} color={colors.placeholder} />
                <AnimatedSearchPlaceholder color={colors.placeholder} />
              </LinearGradient>
            </SquircleView>
          </LinearGradient>
        </SquircleView>
      </Pressable>
      <IconButton
        variant="plain"
        style={[
          styles.profileButton,
          { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.6)' },
        ]}
        onPress={onPressProfile}
      >
        <UserRound size={22} color="#fff" />
      </IconButton>
    </>
  );
}

const styles = StyleSheet.create({
  searchPressable: { flex: 1 },
  searchOuter: {
    borderRadius: 19,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  searchOuterFill: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    paddingTop: 3,
    paddingHorizontal: 2.5,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchBar: { borderRadius: 18 },
  searchBarFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 48,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
