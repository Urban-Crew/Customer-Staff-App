import type { AuthTokens } from '@ub/shared-types';

/**
 * Pluggable token persistence so this package stays agnostic of the storage
 * mechanism each app uses (expo-secure-store, AsyncStorage, memory, ...).
 */
export interface TokenStorage {
  getTokens(): Promise<AuthTokens | null>;
  setTokens(tokens: AuthTokens | null): Promise<void>;
}

export interface ApiClientConfig {
  /** Base URL of the backend API, e.g. https://api.example.com */
  baseURL: string;
  /** Reads/writes access + refresh tokens. */
  tokenStorage: TokenStorage;
  /**
   * Called with the stored refresh token to obtain a new token pair.
   * Typically a plain POST /auth/refresh call.
   */
  refreshTokens: (refreshToken: string) => Promise<AuthTokens>;
  /** Called when the refresh flow itself fails (e.g. force logout, navigate to login). */
  onAuthFailure?: () => void | Promise<void>;
  /** Default request timeout in ms. Defaults to 15000. */
  timeoutMs?: number;
  /** Extra default headers to send with every request. */
  headers?: Record<string, string>;
  enableLogging?: boolean;
}
