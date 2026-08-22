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

// --- Phone / OTP onboarding -------------------------------------------------
// No backend exists for these yet. Types + client methods are defined now so
// the onboarding screens have something concrete to call the moment the
// endpoints ship — see @ub/api-client's onboarding module.

export interface SendOtpRequest {
  /** National number without the country code, e.g. "90366027". */
  phone: string;
  /** Dialing code including the leading "+", e.g. "+65". */
  countryCode: string;
}

export interface SendOtpResponse {
  /** Opaque id echoed back on verify to correlate the OTP attempt. */
  requestId: string;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  requestId: string;
  phone: string;
  countryCode: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: AuthUser;
  tokens: AuthTokens;
  isNewUser: boolean;
}

export interface AddEmailRequest {
  email: string;
  marketingOptIn: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedAddress {
  formattedAddress: string;
  /** Short line used as the headline on the confirmation screen, e.g. "Ayer Rajah Cres." */
  shortLine: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: Coordinates;
}

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
}

export interface PlaceAutocompleteResponse {
  suggestions: PlaceSuggestion[];
}
