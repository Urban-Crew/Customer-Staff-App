import { useMutation } from '@tanstack/react-query';
import { reverseGeocode } from '../services/location.service';

export function useReverseGeocode() {
  return useMutation({ mutationFn: reverseGeocode });
}
