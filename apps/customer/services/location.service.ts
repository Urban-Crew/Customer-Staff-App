import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { AxiosError } from '@ub/api-client';
import type {
  Coordinates,
  PlaceAutocompleteRequest,
  PlaceAutocompleteResponse,
  PlaceDetailsRequest,
  PlaceSuggestion,
  ResolvedAddress,
  ReverseGeocodeRequest,
} from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

/**
 * Geo (Google Places proxy) endpoints — see https://api-stg.ubcrew.in/api/docs
 * (Geo → places/autocomplete, places/details, reverse-geocode). The docs only
 * give parameter names and prose descriptions, no response schemas; the
 * `{ success, data }` envelope, when present, is unwrapped centrally by
 * @ub/api-client.
 */

async function searchPlaces(params: PlaceAutocompleteRequest): Promise<PlaceAutocompleteResponse> {
  const { data } = await apiClient.get<PlaceAutocompleteResponse>(
    '/api/v1/geo/places/autocomplete',
    { params },
  );
  return data;
}

async function getPlaceDetails(params: PlaceDetailsRequest): Promise<ResolvedAddress> {
  const { data } = await apiClient.get<ResolvedAddress>('/api/v1/geo/places/details', { params });
  return data;
}

async function reverseGeocode(params: ReverseGeocodeRequest): Promise<ResolvedAddress> {
  const { data } = await apiClient.get<ResolvedAddress>('/api/v1/geo/reverse-geocode', { params });
  return data;
}

const DEBOUNCE_MS = 300;

/**
 * Debounced Places autocomplete, scoped to a single "search session" per
 * Google's session-token billing model: the same sessionToken is reused
 * across every keystroke and should be rotated (via `resetSession`) once a
 * suggestion's details have been resolved or the search is abandoned.
 */
export function usePlacesAutocomplete(query: string, coords?: Coordinates) {
  const [sessionToken, setSessionToken] = useState(() => Crypto.randomUUID());
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => setDebouncedQuery(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching, error } = useQuery({
    queryKey: [
      'places-autocomplete',
      debouncedQuery,
      sessionToken,
      coords?.latitude,
      coords?.longitude,
    ],
    queryFn: () =>
      searchPlaces({
        q: debouncedQuery,
        sessionToken,
        lat: coords?.latitude,
        lng: coords?.longitude,
      }),
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  return {
    suggestions: (data?.suggestions ?? []) as PlaceSuggestion[],
    isSearching: isFetching,
    error,
    sessionToken,
    /** Call once a suggestion is resolved (or the search is abandoned) to start a fresh billing session. */
    resetSession: () => setSessionToken(Crypto.randomUUID()),
  };
}

export function useResolvePlace() {
  return useMutation({ mutationFn: getPlaceDetails });
}

export function useReverseGeocode() {
  return useMutation({ mutationFn: reverseGeocode });
}

export function describeLocationError(err: unknown): string {
  if (err instanceof AxiosError) {
    const message = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.length > 0) return message[0];
  }
  return "Couldn't fetch that address. Please try again.";
}
