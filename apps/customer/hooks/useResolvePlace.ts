import { useMutation } from '@tanstack/react-query';
import { getPlaceDetails } from '../services/location.service';

export function useResolvePlace() {
  return useMutation({ mutationFn: getPlaceDetails });
}
