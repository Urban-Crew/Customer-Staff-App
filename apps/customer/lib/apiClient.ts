import axios from 'axios';
import { createApiClient, createOnboardingApi } from '@ub/api-client';
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
  async refreshTokens(refreshToken) {
    const { data } = await axios.post<AuthTokens>(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    return data;
  },
  onAuthFailure: () => {
    authFailureListener?.();
  },
});

/**
 * Typed phone/OTP/email/location endpoints — not called anywhere yet since
 * the backend doesn't implement them. The onboarding screens run on local
 * mock state (see lib/onboardingMock.ts) until these are wired in.
 */
export const onboardingApi = createOnboardingApi(apiClient);
