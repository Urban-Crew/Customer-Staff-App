import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { ResolvedAddress } from '@ub/shared-types';

const STORAGE_KEY = 'ub-customer-selected-location';

interface LocationState {
  address: ResolvedAddress | null;
  /** True until we've checked AsyncStorage for a previously selected address. */
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setAddress: (address: ResolvedAddress) => Promise<void>;
}

/**
 * The customer's currently selected service address, shown at the top of
 * the home screen. Kept separate from `onboardingFlowStore` (which is
 * wiped once onboarding completes) so the selection survives app restarts.
 */
export const useLocationStore = create<LocationState>((set) => ({
  address: null,
  isHydrating: true,

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ address: raw ? (JSON.parse(raw) as ResolvedAddress) : null, isHydrating: false });
  },

  setAddress: async (address) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(address));
    set({ address });
  },
}));
