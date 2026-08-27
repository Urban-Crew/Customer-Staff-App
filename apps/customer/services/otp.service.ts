import { useMutation } from '@tanstack/react-query';
import type {
  ResendOtpRequest,
  ResendOtpResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

/**
 * Client OTP auth endpoints — see https://api-stg.ubcrew.in/api/docs
 * (Auth → client OTP endpoints). Each request fn below has a matching
 * TanStack Query mutation hook for use in screens. The `{ success, data }`
 * envelope, when present, is unwrapped centrally by @ub/api-client.
 */

async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>(
    '/api/v1/auth/client/request-otp',
    payload,
  );
  return data;
}

async function resendOtp({ requestId, channel }: ResendOtpRequest): Promise<ResendOtpResponse> {
  const { data } = await apiClient.post<ResendOtpResponse>(
    `/api/v1/auth/client/request-otp/resend/${encodeURIComponent(requestId)}`,
    channel ? { channel } : {},
  );
  return data;
}

async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<VerifyOtpResponse>(
    '/api/v1/auth/client/verify-otp',
    payload,
  );
  return data;
}

export function useSendOtp() {
  return useMutation({ mutationFn: sendOtp });
}

export function useResendOtp() {
  return useMutation({ mutationFn: resendOtp });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: verifyOtp });
}
