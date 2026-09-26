import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing, Text, useTheme } from '@ub/ui';
import { useCart } from '../hooks/useCart';

interface FloatingCartBarProps {
  bottomOffset?: number;
}

export function FloatingCartBar({ bottomOffset = 64 }: FloatingCartBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: cart } = useCart();

  if (!cart || cart.itemCount === 0) {
    return null;
  }

  const handlePress = () => {
    router.push('/cart');
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset + insets.bottom + 8,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.leftCol}>
          <View style={styles.iconWrap}>
            <ShoppingBag size={18} color="#fff" />
          </View>
          <View>
            <Text fontWeight="800" style={styles.itemCountText}>
              {cart.itemCount} {cart.itemCount === 1 ? 'ITEM' : 'ITEMS'} • ₹
              {cart.pricing.grandTotal.toFixed(0)}
            </Text>
            <Text style={styles.extraText}>Tap to review & book</Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text fontWeight="700" style={styles.viewCartText}>
            View Cart
          </Text>
          <ChevronRight size={18} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 99,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.squircle,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  extraText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
  },
});
