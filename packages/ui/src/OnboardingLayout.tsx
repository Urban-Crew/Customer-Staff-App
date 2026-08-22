import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Button, type ButtonProps } from './Button';
import { IconButton } from './IconButton';
import { spacing, useTheme } from './theme';

export interface OnboardingLayoutProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  children?: ReactNode;
  /** Text/links shown above the primary action, e.g. "By continuing, you agree to…" */
  footnote?: ReactNode;
  /** Primary CTA. Omit to render a fully custom `footer` instead. */
  primaryAction?: ButtonProps;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Plain, flat page scaffold for the onboarding flow: white background, single-tone
 * borders, no gradients or shadows. Content scrolls in the middle; the primary
 * action stays docked to the bottom.
 */
export function OnboardingLayout({
  icon,
  title,
  description,
  onBack,
  onSkip,
  children,
  footnote,
  primaryAction,
  footer,
  style,
}: OnboardingLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }, style]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {/* Top navigation row */}
        <View style={styles.topNav}>
          <View style={styles.navLeft}>
            {onBack ? (
              <IconButton onPress={onBack}>
                <ChevronLeft size={22} color={colors.ink} />
              </IconButton>
            ) : (
              <View style={styles.navSpacer} />
            )}
          </View>

          <View style={styles.navRight}>
            {onSkip ? (
              <Button
                label="Skip"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={onSkip}
              />
            ) : null}
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, { color: colors.inkMuted }]}>{description}</Text>
          ) : null}
          {children ? <View style={styles.body}>{children}</View> : null}
        </ScrollView>

        {/* Bottom Action Footer */}
        {footer || footnote || primaryAction ? (
          <View style={styles.footer}>
            {footer ?? (
              <>
                {footnote ? (
                  <Text style={[styles.footnote, { color: colors.inkMuted }]}>{footnote}</Text>
                ) : null}
                {primaryAction ? <Button {...primaryAction} /> : null}
              </>
            )}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navSpacer: { width: 40, height: 40 },
  iconWrap: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  body: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md + 10,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
