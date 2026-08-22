import { create } from 'zustand';
import type { ResolvedAddress } from '@ub/shared-types';

interface OnboardingFlowState {
  countryCode: string;
  phone: string;
  requestId: string | null;
  email: string;
  address: ResolvedAddress | null;
  setCountryCode: (code: string) => void;
  setPhone: (phone: string) => void;
  setRequestId: (requestId: string) => void;
  setEmail: (email: string) => void;
  setAddress: (address: ResolvedAddress) => void;
  reset: () => void;
}

const initial = {
  countryCode: '+91',
  phone: '',
  requestId: null,
  email: '',
  address: null,
} satisfies Partial<OnboardingFlowState>;

/** In-memory state shared across the onboarding screens (not persisted). */
export const useOnboardingFlowStore = create<OnboardingFlowState>((set) => ({
  ...initial,
  setCountryCode: (countryCode) => set({ countryCode }),
  setPhone: (phone) => set({ phone }),
  setRequestId: (requestId) => set({ requestId }),
  setEmail: (email) => set({ email }),
  setAddress: (address) => set({ address }),
  reset: () => set(initial),
}));
