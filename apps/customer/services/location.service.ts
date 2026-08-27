import { AxiosError } from '@ub/api-client';
import type {
  PlaceAutocompleteRequest,
  PlaceAutocompleteResponse,
  PlaceDetailsRequest,
  ResolvedAddress,
  ReverseGeocodeRequest,
} from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function searchPlaces(
  params: PlaceAutocompleteRequest,
): Promise<PlaceAutocompleteResponse> {
  const { data } = await apiClient.get<PlaceAutocompleteResponse>(
    '/api/v1/geo/places/autocomplete',
    { params },
  );
  return data;
}

export async function getPlaceDetails(params: PlaceDetailsRequest): Promise<ResolvedAddress> {
  const { data } = await apiClient.get<ResolvedAddress>('/api/v1/geo/places/details', { params });
  return data;
}

export async function reverseGeocode(params: ReverseGeocodeRequest): Promise<ResolvedAddress> {
  const { data } = await apiClient.get<ResolvedAddress>('/api/v1/geo/reverse-geocode', { params });
  return data;
}

export function describeLocationError(err: unknown): string {
  if (err instanceof AxiosError) {
    const message = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.length > 0) return message[0];
  }
  return "Couldn't fetch that address. Please try again.";
}
