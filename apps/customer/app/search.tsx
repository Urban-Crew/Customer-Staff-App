import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Search as SearchIcon } from 'lucide-react-native';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, radii, spacing, Text, useTheme } from '@ub/ui';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.topRow}>
        <IconButton variant="plain" onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.ink} />
        </IconButton>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <SearchIcon size={18} color={colors.inkFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for services"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { color: colors.ink }]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={{ color: colors.inkMuted }}>
          {query.trim() ? `No results for "${query.trim()}" yet.` : 'Search for anything…'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, letterSpacing: 0.2 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: spacing.xxl },
});
