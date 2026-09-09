import React, { createContext, useContext, type ReactNode } from 'react';
import { colors, type ThemeColors } from './theme';

interface ThemeContextType {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({ colors });

export interface ThemeProviderProps {
  children: ReactNode;
}

/** Provides the app's single fixed color palette — there is no light/dark mode. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={{ colors }}>{children}</ThemeContext.Provider>;
}

/** Hook to consume the app's theme colors. */
export function useTheme() {
  return useContext(ThemeContext);
}
