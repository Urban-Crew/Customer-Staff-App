import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../lib/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op: fails harmlessly if already hidden
});

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrating) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isHydrating]);

  if (isHydrating) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
