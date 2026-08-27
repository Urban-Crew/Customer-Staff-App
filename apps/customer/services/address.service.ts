import type { CreateAddressRequest, SavedAddress } from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function listAddresses(): Promise<SavedAddress[]> {
  const { data } = await apiClient.get<SavedAddress[]>('/api/v1/customer/addresses');
  return data;
}

export async function addAddress(body: CreateAddressRequest): Promise<SavedAddress> {
  const { data } = await apiClient.post<SavedAddress>('/api/v1/customer/addresses', body);
  return data;
}
