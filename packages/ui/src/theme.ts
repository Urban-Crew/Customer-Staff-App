import { StyleSheet, type ViewStyle } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;

  // Borders & dividers
  border: string;
  hairline: string;

  // Primary (filled) button/CTA
  primary: string;
  primaryPressed: string;
  primaryText: string;

  // Secondary (outlined) button — Skip, pills, chips
  secondaryBg: string;
  secondaryBorder: string;
  secondaryPressed: string;
  secondaryText: string;

  // Disabled state (buttons/inputs)
  disabledBg: string;
  disabledBorder: string;
  disabledText: string;

  // Input fields
  inputBg: string;
  inputBorder: string;
  inputBorderFocused: string;
  placeholder: string;

  error: string;
}

/** Single, fixed palette — no light/dark mode. */
export const colors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  ink: '#0F172A',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',

  border: '#E8E4E6',
  hairline: '#E8E4E6',

  primary: '#0F172A',
  primaryPressed: '#1F2937',
  primaryText: '#FFFFFF',

  secondaryBg: '#FFFFFF',
  secondaryBorder: '#E8E4E6',
  secondaryPressed: '#F3F4F6',
  secondaryText: '#0F172A',

  disabledBg: '#F3F4F6',
  disabledBorder: '#F3F4F6',
  disabledText: '#9CA3AF',

  inputBg: '#FFFFFF',
  inputBorder: '#E8E4E6',
  inputBorderFocused: '#0F172A',
  placeholder: '#9CA3AF',

  error: '#EF4444',
};

export const radii = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

/**
 * Shared "card" surface: white fill over the app's off-white background, a single
 * hairline border, radius 16, and one soft cross-platform shadow via `boxShadow`
 * (no ios/android shadow/elevation branching).
 */
export const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: 16,
  borderWidth: StyleSheet.hairlineWidth || 1,
  overflow: 'hidden',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.03)',
};

export { ThemeProvider, useTheme } from './ThemeProvider';
