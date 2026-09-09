import { Pressable, StyleSheet } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  LinearTransition,
  SlideInDown,
  SlideOutDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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

// How far (and how fast) a downward drag has to go before it counts as a dismiss swipe.
const DISMISS_DISTANCE = 48;
const DISMISS_VELOCITY = 700;
const FLING_OUT_DISTANCE = 160;

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

  // Gesture-driven offset, layered under the enter/exit slide so dragging
  // doesn't fight the mount/unmount animation below.
  const dragY = useSharedValue(0);
  const dragOpacity = useSharedValue(1);

  const dismiss = () => onDismiss(toast.id);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-16, 16])
    .onUpdate((event) => {
      // Follow downward drags 1:1; rubber-band a dragged-up toast instead of letting it fly off.
      dragY.value = event.translationY > 0 ? event.translationY : event.translationY * 0.2;
    })
    .onEnd((event) => {
      const shouldDismiss =
        dragY.value > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        dragY.value = withTiming(FLING_OUT_DISTANCE, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
        dragOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) runOnJS(dismiss)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 18, stiffness: 220 });
        dragOpacity.value = withTiming(1, { duration: 150 });
      }
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
    opacity: dragOpacity.value,
  }));

  return (
    <Animated.View
      entering={SlideInDown.duration(380).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutDown.duration(220).easing(Easing.in(Easing.cubic))}
      layout={LinearTransition.duration(220).easing(Easing.out(Easing.cubic))}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={dragStyle}>
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
            <Text
              style={[styles.message, { color: foreground }]}
              fontWeight="600"
              numberOfLines={3}
            >
              {toast.message}
            </Text>
            <Pressable
              onPress={dismiss}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              style={styles.dismissBtn}
            >
              <X size={16} color={foreground} />
            </Pressable>
          </SquircleView>
        </Animated.View>
      </GestureDetector>
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
    <KeyboardStickyView
      pointerEvents="box-none"
      offset={{ opened: -spacing.sm }}
      style={[styles.host, { bottom: insets.bottom + spacing.md }]}
    >
      {toasts.map((toast) => (
        <ToastPill key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </KeyboardStickyView>
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
