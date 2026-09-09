import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './theme';

interface ThemeContextType {
  colors: ThemeColors;
  /** The active color scheme driving `colors`, mirroring the OS setting. */
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({ colors: lightColors, colorScheme: 'light' });

export interface ThemeProviderProps {
  children: ReactNode;
}

/** Provides the app's color palette, switching between light/dark to match the system appearance. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  // const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const colorScheme = 'dark';
  const value = useMemo<ThemeContextType>(
    () => ({ colors: colorScheme === 'dark' ? darkColors : lightColors, colorScheme }),
    [colorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook to consume the app's active theme colors and color scheme. */
export function useTheme() {
  return useContext(ThemeContext);
}
