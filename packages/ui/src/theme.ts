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
  /** Status accent for success states (toasts, confirmations) — same tone in both schemes. */
  success: string;
}

/** Light palette — cobalt/navy ubcrew brand tokens. Used when the system is in light mode. */
export const lightColors: ThemeColors = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceSubtle: '#EEF2F8',
  ink: '#12172A',
  inkMuted: '#4C5670',
  inkFaint: '#6B7690',

  border: '#E1E7F0',
  hairline: '#EEF2F8',

  primary: '#2F5FFF',
  primaryPressed: '#1533AD',
  primaryText: '#FFFFFF',

  secondaryBg: '#FFFFFF',
  secondaryBorder: '#E1E7F0',
  secondaryPressed: '#EEF2F8',
  secondaryText: '#12172A',

  disabledBg: '#EEF2F8',
  disabledBorder: '#EEF2F8',
  disabledText: '#C7D0E0',

  inputBg: '#FFFFFF',
  inputBorder: '#E1E7F0',
  inputBorderFocused: '#2F5FFF',
  placeholder: '#6B7690',

  error: '#E5484D',
  success: '#22B36B',
};


export const darkColors: ThemeColors = {
  background: '#050A16',
  surface: '#0A1426',
  surfaceSubtle: '#101D35',
  ink: '#FFFFFF',
  inkMuted: '#C7D0E0',
  inkFaint: '#98A3BD',

  border: '#253A5E',
  hairline: '#182948',

  primary: '#4C81FF',
  primaryPressed: '#2F5FFF',
  primaryText: '#FFFFFF',

  secondaryBg: '#0A1426',
  secondaryBorder: '#253A5E',
  secondaryPressed: '#182948',
  secondaryText: '#FFFFFF',

  disabledBg: '#182948',
  disabledBorder: '#182948',
  disabledText: '#98A3BD',

  inputBg: '#0A1426',
  inputBorder: '#253A5E',
  inputBorderFocused: '#4C81FF',
  placeholder: '#98A3BD',

  error: '#FF6B6B',
  success: '#22B36B',
};

/** @deprecated Use `lightColors` (or `useTheme()` for the active scheme's palette). Kept for existing static imports. */
export const colors = lightColors;

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
