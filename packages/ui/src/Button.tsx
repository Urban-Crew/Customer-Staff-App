import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SquircleView } from 'expo-squircle-view';
import { ambientShadow, radii, withAlpha, useTheme } from './theme';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth = true,
  icon,
  style,
  labelStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled);
  const isSm = size === 'sm';
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  // Same squircle radius as the input fields, so buttons and inputs read as one shape language.
  const buttonRadius = radii.squircle;

  const dynamicVariantStyle: ViewStyle = isPrimary
    ? {
        backgroundColor: colors.primary,
        borderWidth: 0,
        boxShadow: `0px 10px 20px -8px ${withAlpha(colors.primary, 0.5)}`,
      }
    : isSecondary
      ? {
          backgroundColor: colors.secondaryBg,
          borderWidth: 1,
          borderColor: colors.secondaryBorder,
          boxShadow: ambientShadow,
        }
      : { backgroundColor: 'transparent', borderWidth: 0 };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || loading}
      style={fullWidth && styles.fullWidth}
    >
      {({ pressed }) => (
        <SquircleView
          cornerSmoothing={100}
          style={[
            styles.base,
            { borderRadius: buttonRadius },
            isSm ? styles.sizeSm : styles.sizeMd,
            dynamicVariantStyle,

            isPrimary && loading && { backgroundColor: colors.primaryPressed },
            isDisabled &&
              !loading && {
                backgroundColor: colors.disabledBg,
                borderColor: colors.disabledBorder,
                borderWidth: isPrimary || isSecondary ? 1 : 0,
                boxShadow: 'none',
              },
            pressed &&
              !isDisabled &&
              !loading && {
                backgroundColor: isPrimary
                  ? colors.primaryPressed
                  : isSecondary
                    ? colors.secondaryPressed
                    : 'transparent',
              },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={isPrimary ? colors.primaryText : colors.ink} />
          ) : (
            <View style={styles.contentRow}>
              {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
              <Text
                style={[
                  styles.label,
                  isSm && styles.labelSm,
                  {
                    color: isDisabled
                      ? colors.disabledText
                      : isPrimary
                        ? colors.primaryText
                        : colors.secondaryText,
                  },
                  labelStyle,
                ]}
              >
                {label}
              </Text>
            </View>
          )}
        </SquircleView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  sizeMd: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  sizeSm: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    minHeight: 38,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
