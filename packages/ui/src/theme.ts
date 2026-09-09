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
};

/**
 * Dark palette — same cobalt/navy brand, dark surfaces. Mirrors the dark
 * tokens from the ubcrew brand-system mockup (navy 950 canvas, cobalt 500
 * brand). Used when the system is in dark mode.
 */
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
};

/** @deprecated Use `lightColors` (or `useTheme()` for the active scheme's palette). Kept for existing static imports. */
export const colors = lightColors;

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
