import type { Service } from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function getServices(): Promise<Service[]> {
  const { data } = await apiClient.get<Service[]>('/api/v1/catalog/services');
  return data;
}
