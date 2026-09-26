import type {
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  RazorpayPaymentIntent,
} from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  const { data } = await apiClient.post<VerifyPaymentResponse>('/api/v1/payments/verify', payload);
  return data;
}

export async function createPaymentIntent(bookingId: string): Promise<RazorpayPaymentIntent> {
  const { data } = await apiClient.post<RazorpayPaymentIntent>(
    `/api/v1/payments/${bookingId}/intent`,
  );
  return data;
}
