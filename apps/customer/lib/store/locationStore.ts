import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { ResolvedAddress, SavedAddress } from '@ub/shared-types';

const STORAGE_KEY = 'ub-customer-selected-location';

export type SelectedAddress = ResolvedAddress | SavedAddress;

interface LocationState {
  address: SelectedAddress | null;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  setAddress: (address: SelectedAddress) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  address: null,
  isHydrating: true,

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ address: raw ? (JSON.parse(raw) as SelectedAddress) : null, isHydrating: false });
  },

  setAddress: async (address) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(address));
    set({ address });
  },
}));
