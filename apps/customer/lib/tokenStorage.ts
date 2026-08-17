import * as SecureStore from 'expo-secure-store';
import type { TokenStorage } from '@ub/api-client';
import type { AuthTokens } from '@ub/shared-types';

const STORAGE_KEY = 'ub-auth-tokens';

/** Persists auth tokens in the platform keychain/keystore via expo-secure-store. */
export const secureTokenStorage: TokenStorage = {
  async getTokens() {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  },
  async setTokens(tokens) {
    if (tokens) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  },
};
