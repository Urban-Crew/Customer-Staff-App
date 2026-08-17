import { create } from 'zustand';
import type { AuthUser, LoginResponse } from '@ub/shared-types';
import { apiClient, setAuthFailureListener } from '../apiClient';
import { secureTokenStorage } from '../tokenStorage';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until we've checked SecureStore for an existing session. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
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

  logout: async () => {
    await secureTokenStorage.setTokens(null);
    set({ user: null, isAuthenticated: false });
  },
}));

// A refresh failure in the api client (see lib/apiClient.ts) means the
// session is no longer valid — drop the app back to a logged-out state.
setAuthFailureListener(() => {
  useAuthStore.getState().logout();
});
