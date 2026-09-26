import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAddress } from '../services/address.service';

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
    },
  });
}
