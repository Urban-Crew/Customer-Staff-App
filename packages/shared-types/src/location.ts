export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedAddress {
  formattedAddress: string;
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
  success: boolean;
  data: {
    suggestions: PlaceSuggestion[];
  };
}

export interface PlaceDetailsRequest {
  placeId: string;
  sessionToken?: string;
}

export interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  flatNo: string;
  areaText: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  zoneId: string;
  zoneName: string;
  isServiceable: boolean;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label?: string;
  flatNo: string;
  areaText: string;
  landmark?: string;
  formattedAddr: string;
  googlePlaceId?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}
