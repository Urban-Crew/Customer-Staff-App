import axios from 'axios';
import { createApiClient } from '@ub/api-client';
import type { AuthTokens } from '@ub/shared-types';
import { secureTokenStorage } from './tokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type AuthFailureListener = () => void;
let authFailureListener: AuthFailureListener | null = null;

/**
 * Registered once (see lib/store/authStore.ts) so that a failed token
 * refresh can clear app state without this module importing the store
 * directly (which would create a circular import).
 */
export function setAuthFailureListener(listener: AuthFailureListener | null) {
  authFailureListener = listener;
}

export const apiClient = createApiClient({
  baseURL: API_URL,
  tokenStorage: secureTokenStorage,
  enableLogging: __DEV__,
  async refreshTokens(refreshToken) {
    const res = await axios.post(`${API_URL}/api/v1/auth/token/refresh`, {
      refreshToken,
    });
    const payload = res.data?.data ?? res.data;
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresIn ? Date.now() + payload.expiresIn * 1000 : payload.expiresAt,
    };
  },
  onAuthFailure: () => {
    authFailureListener?.();
  },
});
