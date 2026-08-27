import { create } from 'zustand';
import type { AuthUser, LoginResponse, OtpAuthTokens, OtpAuthUser } from '@ub/shared-types';
import { apiClient, setAuthFailureListener } from '../apiClient';
import { secureTokenStorage } from '../tokenStorage';

interface AuthState {
  user: AuthUser | OtpAuthUser | null;
  isAuthenticated: boolean;
  /** Echoes verify-otp's `isNewUser` for the session just started — false once logged out. */
  isNewUser: boolean;
  /** True until we've checked SecureStore for an existing session. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  /** Persists the session issued by POST /auth/client/verify-otp and marks the user signed in. */
  setSession: (user: OtpAuthUser, tokens: OtpAuthTokens, isNewUser: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isNewUser: false,
  isHydrating: true,

  hydrate: async () => {
    const tokens = await secureTokenStorage.getTokens();
    set({ isAuthenticated: !!tokens, isHydrating: false });
  },

  login: async (email, password) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    await secureTokenStorage.setTokens(data.tokens);
    set({ user: data.user, isAuthenticated: true });
  },

  setSession: async (user, tokens, isNewUser) => {
    // The OTP endpoints return `expiresIn` (seconds from issuance); stored
    // tokens carry an absolute `expiresAt` instead, so convert once here.
    await secureTokenStorage.setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    });
    set({ user, isAuthenticated: true, isNewUser });
  },

  logout: async () => {
    await secureTokenStorage.setTokens(null);
    set({ user: null, isAuthenticated: false, isNewUser: false });
  },
}));

// A refresh failure in the api client (see lib/apiClient.ts) means the
// session is no longer valid — drop the app back to a logged-out state.
setAuthFailureListener(() => {
  useAuthStore.getState().logout();
});
