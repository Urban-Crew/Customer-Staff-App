import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { TokenStorage } from '@ub/api-client';
import type { AuthTokens } from '@ub/shared-types';

const STORAGE_KEY = 'ub-auth-tokens';
const isWeb = Platform.OS === 'web';

/** Persists auth tokens in the platform keychain/keystore via expo-secure-store with AsyncStorage fallback. */
export const secureTokenStorage: TokenStorage = {
  async getTokens() {
    try {
      if (!isWeb) {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as AuthTokens;
      }
    } catch {
      // SecureStore may fail in certain dev/web environments, fall through to AsyncStorage
    }

    try {
      const fallback = await AsyncStorage.getItem(STORAGE_KEY);
      return fallback ? (JSON.parse(fallback) as AuthTokens) : null;
    } catch {
      return null;
    }
  },
  async setTokens(tokens) {
    const raw = tokens ? JSON.stringify(tokens) : null;

    if (!isWeb) {
      try {
        if (raw) {
          await SecureStore.setItemAsync(STORAGE_KEY, raw);
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      } catch {
        // Fall through to AsyncStorage
      }
    }

    try {
      if (raw) {
        await AsyncStorage.setItem(STORAGE_KEY, raw);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  },
};
