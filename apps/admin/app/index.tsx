import { StyleSheet, Text, View } from 'react-native';
import { LayoutDashboard } from 'lucide-react-native';
import { Badge } from '@ub/ui';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Badge icon={<LayoutDashboard size={20} color="#fff" />} label="Admin app" />
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
