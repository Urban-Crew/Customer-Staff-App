import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'ub-customer-onboarded';

interface OnboardingState {
  hasOnboarded: boolean;
  /** True until we've checked AsyncStorage for a prior completion. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

/**
 * Tracks whether the phone/OTP/email/location onboarding flow has been
 * completed (or skipped) at least once. Deliberately separate from
 * `authStore` — onboarding doesn't issue real session tokens yet since
 * there's no backend for it, so it's tracked in plain AsyncStorage rather
 * than mixed into the secure-token-backed auth session.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: false,
  isHydrating: true,

  hydrate: async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    set({ hasOnboarded: value === 'true', isHydrating: false });
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    set({ hasOnboarded: true });
  },
}));
