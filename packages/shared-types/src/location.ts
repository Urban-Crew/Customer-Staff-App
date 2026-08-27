// --- Location / places (geo) ------------------------------------------------
// Matches GET /api/v1/geo/{places/autocomplete,places/details,reverse-geocode}
// — see https://api-stg.ubcrew.in/api/docs (Geo). These are a Google Places
// proxy (API key stays server-side); the docs only give parameter names and
// prose descriptions, no response schemas, so the shapes below follow the
// onboarding location screens' existing usage. See services/location.service.ts
// for the client methods.

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedAddress {
  formattedAddress: string;
  /** Short line used as the headline on the confirmation screen, e.g. "Ayer Rajah Cres." */
  shortLine: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: Coordinates;
}

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
}

export interface PlaceAutocompleteRequest {
  /** Partial address text typed so far. */
  q: string;
  /** Client-generated UUID v4, reused for every keystroke of one search session (Places billing). */
  sessionToken: string;
  /** Biases results near the user. */
  lat?: number;
  lng?: number;
}

export interface PlaceAutocompleteResponse {
  suggestions: PlaceSuggestion[];
}

export interface PlaceDetailsRequest {
  placeId: string;
  /** Same sessionToken used during autocomplete — closes the billing session. */
  sessionToken?: string;
}

export interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}
