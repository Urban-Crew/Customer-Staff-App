import { create } from 'zustand';
import type { ResolvedAddress } from '@ub/shared-types';

interface OnboardingFlowState {
  countryCode: string;
  phone: string;
  requestId: string | null;
  /** Seconds to wait before the resend endpoint can be called again, from the last send/resend response. */
  resendAvailableInSeconds: number;
  email: string;
  address: ResolvedAddress | null;
  setCountryCode: (code: string) => void;
  setPhone: (phone: string) => void;
  setOtpRequest: (requestId: string, resendAvailableInSeconds: number) => void;
  setEmail: (email: string) => void;
  setAddress: (address: ResolvedAddress) => void;
  reset: () => void;
}

const initial = {
  countryCode: '+91',
  phone: '',
  requestId: null,
  resendAvailableInSeconds: 30,
  email: '',
  address: null,
} satisfies Partial<OnboardingFlowState>;

/** In-memory state shared across the onboarding screens (not persisted). */
export const useOnboardingFlowStore = create<OnboardingFlowState>((set) => ({
  ...initial,
  setCountryCode: (countryCode) => set({ countryCode }),
  setPhone: (phone) => set({ phone }),
  setOtpRequest: (requestId, resendAvailableInSeconds) =>
    set({ requestId, resendAvailableInSeconds }),
  setEmail: (email) => set({ email }),
  setAddress: (address) => set({ address }),
  reset: () => set(initial),
}));
