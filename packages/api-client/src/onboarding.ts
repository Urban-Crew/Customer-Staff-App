import type { AxiosInstance } from 'axios';
import type {
  AddEmailRequest,
  Coordinates,
  PlaceAutocompleteResponse,
  ResolvedAddress,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@ub/shared-types';

/**
 * Typed endpoint methods for the phone/OTP/email/location onboarding flow.
 *
 * None of these endpoints exist server-side yet, so nothing in the app calls
 * this today — the onboarding screens run on local mock state instead. This
 * is here so wiring up the real backend later is a matter of swapping the
 * mock calls in the screens for `onboardingApi.*`, not designing a new
 * client from scratch.
 */
export function createOnboardingApi(client: AxiosInstance) {
  return {
    sendOtp: async (payload: SendOtpRequest) => {
      const { data } = await client.post<SendOtpResponse>('/auth/otp/send', payload);
      return data;
    },
    verifyOtp: async (payload: VerifyOtpRequest) => {
      const { data } = await client.post<VerifyOtpResponse>('/auth/otp/verify', payload);
      return data;
    },
    addEmail: async (payload: AddEmailRequest) => {
      const { data } = await client.post<{ ok: true }>('/auth/email', payload);
      return data;
    },
    searchPlaces: async (query: string) => {
      const { data } = await client.get<PlaceAutocompleteResponse>('/places/autocomplete', {
        params: { query },
      });
      return data;
    },
    resolvePlace: async (placeId: string) => {
      const { data } = await client.get<ResolvedAddress>(`/places/${placeId}`);
      return data;
    },
    reverseGeocode: async (coordinates: Coordinates) => {
      const { data } = await client.post<ResolvedAddress>('/places/reverse-geocode', coordinates);
      return data;
    },
  };
}

export type OnboardingApi = ReturnType<typeof createOnboardingApi>;
