import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from '@ub/ui';

const SEARCH_PLACEHOLDER_PREFIX = 'Search for';
const SEARCH_PLACEHOLDER_TERMS = [
  'electrician',
  'plumber',
  'AC repair',
  'home cleaning',
  'salon at home',
];
const SEARCH_PLACEHOLDER_INTERVAL_MS = 1500;

export function AnimatedSearchPlaceholder({ color }: { color: string }) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDER_TERMS.length);
        slideAnim.setValue(10);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, SEARCH_PLACEHOLDER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {SEARCH_PLACEHOLDER_PREFIX}{' '}
      </Text>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={[styles.text, { color }]} numberOfLines={1}>
          {SEARCH_PLACEHOLDER_TERMS[index]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 16, letterSpacing: 0.2 },
});
