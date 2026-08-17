import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import AnimatedGlow, { type PresetConfig } from 'react-native-animated-glow';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Badge, Button } from '@ub/ui';

const glowPreset: PresetConfig = {
  metadata: { name: 'Customer Accent', textColor: '#FFFFFF', category: 'Custom', tags: [] },
  states: [
    {
      name: 'default',
      preset: {
        cornerRadius: 16,
        outlineWidth: 2,
        borderColor: '#E0FFFF',
        glowLayers: [{ colors: ['#00BFFF', '#87CEEB'], opacity: 0.5, glowSize: 24 }],
      },
    },
    { name: 'press', transition: 100, preset: { glowLayers: [{ glowSize: 32, opacity: 0.65 }] } },
  ],
};

export default function HomeScreen() {
  const sheet = useRef<TrueSheet>(null);

  return (
    <View style={styles.container}>
      <AnimatedGlow preset={glowPreset}>
        <Badge icon={<Sparkles size={20} color="#fff" />} label="Customer app" />
      </AnimatedGlow>
      <Text style={styles.hint}>Open up app/index.tsx to start working on it!</Text>
      <Button label="Open sheet" onPress={() => sheet.current?.present()} />

      <TrueSheet ref={sheet} detents={['auto', 0.6, 1]} style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>A true native bottom sheet</Text>
        <Button label="Close" variant="secondary" onPress={() => sheet.current?.dismiss()} />
      </TrueSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  hint: { color: '#666' },
  sheetContent: {
    padding: 24,
    gap: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
});
