import { useQuery } from '@tanstack/react-query';
import { getHomeFeed } from '../services/home.service';

export function useHomeFeed() {
  return useQuery({
    queryKey: ['home-feed'],
    queryFn: getHomeFeed,
    // Real endpoint now (see home.service.ts) — banners/header can change
    // server-side, so unlike the old mock this shouldn't cache forever.
    staleTime: 5 * 60 * 1000,
  });
}
