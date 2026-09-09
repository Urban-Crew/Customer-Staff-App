import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './theme';

interface ThemeContextType {
  colors: ThemeColors;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({ colors: lightColors, colorScheme: 'light' });

export interface ThemeProviderProps {
  children: ReactNode;
}

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

export function useTheme() {
  return useContext(ThemeContext);
}
