import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SquircleView } from 'expo-squircle-view';
import { Text } from './Text';
import { useToastStore, type ToastItem, type ToastType } from './toastStore';
import { radii, spacing, useTheme, withAlpha, type ThemeColors } from './theme';

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

function appearance(type: ToastType, colors: ThemeColors) {
  switch (type) {
    case 'success':
      return { background: colors.success, foreground: '#FFFFFF' };
    case 'error':
      return { background: colors.error, foreground: '#FFFFFF' };
    default:
      // Neutral toast: an inverted-surface pill so it reads clearly in both schemes.
      return { background: colors.ink, foreground: colors.background };
  }
}

interface ToastPillProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastPill({ toast, onDismiss }: ToastPillProps) {
  const { colors } = useTheme();
  const { background, foreground } = appearance(toast.type, colors);
  const Icon = ICONS[toast.type];

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18).mass(0.6)}
      exiting={SlideOutDown.duration(180)}
      layout={LinearTransition.duration(200)}
    >
      <SquircleView
        cornerSmoothing={100}
        style={[
          styles.pill,
          {
            backgroundColor: background,
            boxShadow: `0px 14px 28px -8px ${withAlpha('#000000', 0.32)}`,
          },
        ]}
      >
        <Icon size={20} color={foreground} style={styles.icon} />
        <Text style={[styles.message, { color: foreground }]} fontWeight="600" numberOfLines={3}>
          {toast.message}
        </Text>
        <Pressable
          onPress={() => onDismiss(toast.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.dismissBtn}
        >
          <X size={16} color={foreground} />
        </Pressable>
      </SquircleView>
    </Animated.View>
  );
}

export interface ToastHostProps {
  onDismiss: (id: string) => void;
}

/** Renders the active toast stack, anchored above the bottom safe area. Mounted once by ToastProvider. */
export function ToastHost({ onDismiss }: ToastHostProps) {
  const toasts = useToastStore((state) => state.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: insets.bottom + spacing.md }]}
    >
      {toasts.map((toast) => (
        <ToastPill key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: 'column-reverse',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.squircle,
    gap: 12,
  },
  icon: { flexShrink: 0 },
  message: { flex: 1, fontSize: 14, lineHeight: 19 },
  dismissBtn: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
