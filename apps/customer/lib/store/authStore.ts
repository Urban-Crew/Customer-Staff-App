import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { AuthUser, LoginResponse, OtpAuthTokens, OtpAuthUser } from '@ub/shared-types';
import { apiClient, setAuthFailureListener } from '../apiClient';
import { queryClient } from '../queryClient';
import { secureTokenStorage } from '../tokenStorage';
import { useLocationStore } from './locationStore';

const GUEST_STORAGE_KEY = 'ub-customer-guest';
const USER_STORAGE_KEY = 'ub-customer-user';

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
    const [tokens, guestFlag, userJson] = await Promise.all([
      secureTokenStorage.getTokens(),
      AsyncStorage.getItem(GUEST_STORAGE_KEY),
      AsyncStorage.getItem(USER_STORAGE_KEY),
    ]);
    const user = userJson ? (JSON.parse(userJson) as AuthUser | OtpAuthUser) : null;
    const isAuthenticated = !!tokens;
    set({
      user,
      isAuthenticated,
      isGuest: !isAuthenticated && guestFlag === 'true',
      isHydrating: false,
    });
  },

  login: async (email, password) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    await secureTokenStorage.setTokens(data.tokens);
    await Promise.all([
      AsyncStorage.removeItem(GUEST_STORAGE_KEY),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user)),
    ]);
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
    await Promise.all([
      AsyncStorage.removeItem(GUEST_STORAGE_KEY),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)),
    ]);
    set({ user, isAuthenticated: true, isNewUser, isGuest: false });
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
    set({ isGuest: true });
  },

  logout: async () => {
    await secureTokenStorage.setTokens(null);
    await Promise.all([
      AsyncStorage.removeItem(GUEST_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
      AsyncStorage.removeItem('ub-customer-selected-location'),
      AsyncStorage.removeItem('ub-customer-onboarded'),
    ]);
    await useLocationStore.getState().clearAddress();
    queryClient.clear();
    set({ user: null, isAuthenticated: false, isNewUser: false, isGuest: false });
  },
}));

// A refresh failure in the api client (see lib/apiClient.ts) means the
// session is no longer valid — drop the app back to a logged-out state.
setAuthFailureListener(() => {
  useAuthStore.getState().logout();
});
