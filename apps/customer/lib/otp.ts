import { AxiosError } from '@ub/api-client';
import type { OtpThrottledError } from '@ub/shared-types';

/** Combines a dial code ("+91") and a national number ("9876543210") into the E.164 shape the OTP API expects. */
export function toE164(countryCode: string, phone: string): string {
  const digits = `${countryCode}${phone}`.replace(/[^0-9+]/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

/**
 * Turns a failed send-otp/resend-otp/verify-otp call into a message fit for
 * display. Mirrors the throttling/validation errors documented at
 * https://api-stg.ubcrew.in/api/docs for the client OTP endpoints.
 */
export function describeOtpError(err: unknown): string {
  if (err instanceof AxiosError) {
    const status = err.response?.status;

    if (status === 429) {
      const body = err.response?.data as Partial<OtpThrottledError> | undefined;
      if (body?.error === 'OTP_RATE_LIMIT_EXCEEDED') {
        return "Too many attempts — you've hit the limit for now. Try again in a few minutes.";
      }
      const seconds = body?.retryAfterSeconds;
      return seconds
        ? `Please wait ${seconds}s before trying again.`
        : 'Please wait a moment before trying again.';
    }

    if (status === 400) {
      return "That code didn't work — try again.";
    }

    const message = (err.response?.data as { message?: string } | undefined)?.message;
    if (typeof message === 'string') return message;
  }

  return 'Something went wrong. Please try again.';
}
