import type { HomeFeedResponse } from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function getHomeFeed(): Promise<HomeFeedResponse> {
  const { data } = await apiClient.get<HomeFeedResponse>('/api/v1/catalog/home');
  return data;
}
