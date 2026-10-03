import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { spacing, Text, useTheme } from '@ub/ui';

export function TabHeader({ title }: { title: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft size={22} color={colors.ink} />
      </Pressable>
      <Text
        variant="heading"
        fontWeight="700"
        numberOfLines={1}
        style={[styles.title, { color: colors.ink }]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.5 },
  title: { fontSize: 18, textAlign: 'center' },
});
