import { useQuery } from '@tanstack/react-query';
import { getServices } from '../services/services.service';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: getServices,
    staleTime: Infinity,
  });
}
