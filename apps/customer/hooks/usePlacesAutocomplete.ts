import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import type { Coordinates, PlaceSuggestion } from '@ub/shared-types';
import { searchPlaces } from '../services/location.service';

const DEBOUNCE_MS = 300;

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
    suggestions: (data ?? []) as PlaceSuggestion[],
    isSearching: isFetching,
    error,
    sessionToken,
    resetSession: () => setSessionToken(Crypto.randomUUID()),
  };
}
