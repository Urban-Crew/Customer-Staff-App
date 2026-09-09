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
  /** Status accent for success states (toasts, confirmations). */
  success: string;
  /** Brand yellow accent (ratings, badges, highlights) — Urban Company–style. */
  accent: string;
}

/**
 * Single, fixed palette — no light/dark mode. Urban-Company-inspired: black
 * ink/CTAs on a white surface, with a signature yellow accent for ratings
 * and badges. (Approximated from general knowledge of their brand, not
 * scraped exact values — swap these for real brand hex codes if you have them.)
 */
export const colors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F5F5F7',
  ink: '#14141A',
  inkMuted: '#6E6E76',
  inkFaint: '#9C9CA3',

  border: '#E6E6E9',
  hairline: '#EFEFF1',

  primary: '#14141A',
  primaryPressed: '#000000',
  primaryText: '#FFFFFF',

  secondaryBg: '#FFFFFF',
  secondaryBorder: '#E6E6E9',
  secondaryPressed: '#F5F5F7',
  secondaryText: '#14141A',

  disabledBg: '#F0F0F2',
  disabledBorder: '#F0F0F2',
  disabledText: '#B4B4BA',

  inputBg: '#F5F5F7',
  inputBorder: '#E6E6E9',
  inputBorderFocused: '#14141A',
  placeholder: '#9C9CA3',

  error: '#E1523D',
  success: '#1BA672',
  accent: '#FFC900',
};

export const radii = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999, squircle: 15 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

/** Flat, low, cross-platform ambient shadow shared by cards and secondary buttons. */
export const ambientShadow = '0px 1px 3px rgba(0, 0, 0, 0.06)';

/** Converts a `#rrggbb` theme color into an `rgba()` string at the given alpha, for `boxShadow`. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Shared "card" surface: white fill over the app's off-white background, a single
 * hairline border, squircle radius, and one soft cross-platform shadow via `boxShadow`
 * (no ios/android shadow/elevation branching). `overflow` is left at its default
 * ('visible') so the shadow isn't clipped by the surface's own bounds.
 */
export const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderRadius: radii.squircle,
  borderWidth: StyleSheet.hairlineWidth || 1,
  boxShadow: ambientShadow,
};

export { ThemeProvider, useTheme } from './ThemeProvider';
