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

// --- Phone / OTP auth (client) ----------------------------------------------
// Matches POST /api/v1/auth/client/{request-otp,request-otp/resend/:requestId,
// verify-otp} — see https://api-stg.ubcrew.in/api/docs. That spec only
// documents these as prose descriptions (no response schemas), so the shapes
// below follow those descriptions; the token shape is confirmed by the
// admin-login example, which the docs say is reused unchanged across the OTP
// flows. See @ub/api-client's onboarding module for the client methods.

export type OtpChannel = 'sms' | 'wapp';

export interface SendOtpRequest {
  /** Mobile number in E.164 format, e.g. "+919876543210". */
  phone: string;
  /** Delivery channel. Defaults to "sms" server-side when omitted. */
  channel?: OtpChannel;
}

export interface SendOtpResponse {
  /** Opaque id echoed back on verify/resend to correlate the OTP attempt. */
  requestId: string;
  channel: OtpChannel;
  /** Seconds to wait before the resend endpoint can be called again. */
  resendAvailableInSeconds: number;
}

export interface ResendOtpRequest {
  /** requestId from the original send-otp call — sent as a URL path segment, not in the body. */
  requestId: string;
  /** Lets the resend switch delivery channel, e.g. retry via WhatsApp after SMS. */
  channel?: OtpChannel;
}

/** Same requestId comes back unchanged — only the OTP value/TTL rotate server-side. */
export type ResendOtpResponse = SendOtpResponse;

export interface VerifyOtpRequest {
  phone: string;
  /** requestId returned by send-otp or resend-otp. */
  requestId: string;
  /** 6-digit code. */
  otp: string;
}

export interface OtpAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires, from issuance. */
  expiresIn: number;
}

/** Customer identity as auto-provisioned from a phone number — no email/name yet. */
export interface OtpAuthUser {
  id: string;
  phone: string;
  role: 'customer';
  email: string | null;
  name: string | null;
}

export interface VerifyOtpResponse {
  user: OtpAuthUser;
  tokens: OtpAuthTokens;
  isNewUser: boolean;
}

/**
 * 429 response body shared by request-otp/resend-otp — `error` identifies
 * which guard fired. Wait time also comes back in the `Retry-After` header.
 */
export interface OtpThrottledError {
  success: false;
  statusCode: 429;
  error: 'OTP_COOLDOWN_ACTIVE' | 'OTP_IP_COOLDOWN_ACTIVE' | 'OTP_RATE_LIMIT_EXCEEDED';
  message: string;
  retryAfterSeconds: number;
  retryAt: string;
}

export interface AddEmailRequest {
  email: string;
  marketingOptIn: boolean;
}
