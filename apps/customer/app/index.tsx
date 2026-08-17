import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import AnimatedGlow, { type PresetConfig } from 'react-native-animated-glow';
import { Badge } from '@ub/ui';

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
  return (
    <View style={styles.container}>
      <AnimatedGlow preset={glowPreset}>
        <Badge icon={<Sparkles size={20} color="#fff" />} label="Customer app" />
      </AnimatedGlow>
      <Text style={styles.hint}>Open up app/index.tsx to start working on it!</Text>
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
});
