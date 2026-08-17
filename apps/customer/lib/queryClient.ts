import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // retry 2 times
      staleTime: 60_000, // 1 minute
    },
  },
});
