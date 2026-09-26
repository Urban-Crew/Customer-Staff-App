import { useQuery } from '@tanstack/react-query';
import { listAddresses } from '../services/address.service';

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ['customer-addresses'],
    queryFn: listAddresses,
    enabled,
  });
}
