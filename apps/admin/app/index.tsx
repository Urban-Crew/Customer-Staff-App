import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LayoutDashboard } from 'lucide-react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Badge, Button, GlassBackdrop, useTheme } from '@ub/ui';

export default function HomeScreen() {
  const { colors } = useTheme();
  const sheet = useRef<TrueSheet>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlassBackdrop />
      <Badge icon={<LayoutDashboard size={20} color={colors.primaryText} />} label="Admin app" />
      <Text style={[styles.hint, { color: colors.inkMuted }]}>
        Open up app/index.tsx to start working on it!
      </Text>
      <Button label="Open sheet" onPress={() => sheet.current?.present()} />

      <TrueSheet
        ref={sheet}
        detents={['auto', 0.6, 1]}
        style={[styles.sheetContent, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sheetTitle, { color: colors.ink }]}>A true native bottom sheet</Text>
        <Button label="Close" variant="secondary" onPress={() => sheet.current?.dismiss()} />
      </TrueSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  hint: { fontSize: 14 },
  sheetContent: {
    padding: 24,
    gap: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
});
