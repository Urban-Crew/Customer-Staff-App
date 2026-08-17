export type UserRole = 'customer' | 'admin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp (ms) the access token expires at. */
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
