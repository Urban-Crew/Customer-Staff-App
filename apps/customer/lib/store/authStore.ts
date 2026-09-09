import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { AuthUser, LoginResponse, OtpAuthTokens, OtpAuthUser } from '@ub/shared-types';
import { apiClient, setAuthFailureListener } from '../apiClient';
import { secureTokenStorage } from '../tokenStorage';

const GUEST_STORAGE_KEY = 'ub-customer-guest';

interface AuthState {
  user: AuthUser | OtpAuthUser | null;
  isAuthenticated: boolean;
  /** Echoes verify-otp's `isNewUser` for the session just started — false once logged out. */
  isNewUser: boolean;
  /** True once the user has explicitly skipped phone/OTP login and completed the guest location flow instead. Persisted, so they land straight back on home next launch instead of the login screen. */
  isGuest: boolean;
  /** True until we've checked SecureStore/AsyncStorage for an existing session. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  /** Persists the session issued by POST /auth/client/verify-otp and marks the user signed in. */
  setSession: (user: OtpAuthUser, tokens: OtpAuthTokens, isNewUser: boolean) => Promise<void>;
  /** Marks the device as a guest session (Skip on phone → location flow, no OTP). */
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isNewUser: false,
  isGuest: false,
  isHydrating: true,

  hydrate: async () => {
    const [tokens, guestFlag] = await Promise.all([
      secureTokenStorage.getTokens(),
      AsyncStorage.getItem(GUEST_STORAGE_KEY),
    ]);
    set({ isAuthenticated: !!tokens, isGuest: guestFlag === 'true', isHydrating: false });
  },

  login: async (email, password) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    await secureTokenStorage.setTokens(data.tokens);
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    set({ user: data.user, isAuthenticated: true, isGuest: false });
  },

  setSession: async (user, tokens, isNewUser) => {
    // The OTP endpoints return `expiresIn` (seconds from issuance); stored
    // tokens carry an absolute `expiresAt` instead, so convert once here.
    await secureTokenStorage.setTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    });
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    set({ user, isAuthenticated: true, isNewUser, isGuest: false });
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
    set({ isGuest: true });
  },

  logout: async () => {
    await secureTokenStorage.setTokens(null);
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
    set({ user: null, isAuthenticated: false, isNewUser: false, isGuest: false });
  },
}));

// A refresh failure in the api client (see lib/apiClient.ts) means the
// session is no longer valid — drop the app back to a logged-out state.
setAuthFailureListener(() => {
  useAuthStore.getState().logout();
});
