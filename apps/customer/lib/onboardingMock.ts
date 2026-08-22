import type { PlaceSuggestion, ResolvedAddress } from '@ub/shared-types';

/**
 * Local stand-ins for the phone/OTP/email/location endpoints, which don't
 * exist server-side yet. Typed, ready-to-call versions of these live in
 * `@ub/api-client`'s `createOnboardingApi` — swap a call below for the
 * matching `onboardingApi.*` method once the backend ships.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockSendOtp(): Promise<{ requestId: string; expiresInSeconds: number }> {
  await delay(600);
  return { requestId: `mock-${Date.now()}`, expiresInSeconds: 30 };
}

export async function mockVerifyOtp(otp: string): Promise<boolean> {
  await delay(600);
  return otp.length === 6;
}

export async function mockAddEmail(): Promise<void> {
  await delay(500);
}

const MOCK_PLACES: (PlaceSuggestion & { address: ResolvedAddress })[] = [
  {
    placeId: '1',
    primaryText: '75 Ayer Rajah Crescent',
    secondaryText: 'Ayer Rajah Crescent, Singapore',
    address: {
      formattedAddress: '75 Ayer Rajah Crescent, Singapore 139953',
      shortLine: 'Ayer Rajah Cres.',
      city: 'Singapore',
      postalCode: '139953',
      country: 'Singapore',
      coordinates: { latitude: 1.2988, longitude: 103.7873 },
    },
  },
  {
    placeId: '2',
    primaryText: '75 Ayer Rajah Avenue',
    secondaryText: 'Singapore',
    address: {
      formattedAddress: '75 Ayer Rajah Avenue, Singapore 139952',
      shortLine: 'Ayer Rajah Ave.',
      city: 'Singapore',
      postalCode: '139952',
      country: 'Singapore',
      coordinates: { latitude: 1.2991, longitude: 103.7881 },
    },
  },
  {
    placeId: '3',
    primaryText: '75 Ayer Rajah Expressway',
    secondaryText: 'Ayer Rajah Expressway, Singapore',
    address: {
      formattedAddress: '75 Ayer Rajah Expressway, Singapore 139954',
      shortLine: 'Ayer Rajah Exp.',
      city: 'Singapore',
      postalCode: '139954',
      country: 'Singapore',
      coordinates: { latitude: 1.3001, longitude: 103.789 },
    },
  },
  {
    placeId: '4',
    primaryText: 'One-North MRT Station',
    secondaryText: 'Ayer Rajah Crescent, Singapore',
    address: {
      formattedAddress: '1 One-North, Singapore 138650',
      shortLine: 'One-North MRT',
      city: 'Singapore',
      postalCode: '138650',
      country: 'Singapore',
      coordinates: { latitude: 1.2995, longitude: 103.7876 },
    },
  },
];

export function mockSearchPlaces(query: string): PlaceSuggestion[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return MOCK_PLACES.filter((place) => place.primaryText.toLowerCase().includes(trimmed)).map(
    ({ placeId, primaryText, secondaryText }) => ({ placeId, primaryText, secondaryText }),
  );
}

export async function mockResolvePlace(placeId: string): Promise<ResolvedAddress> {
  await delay(400);
  const match = MOCK_PLACES.find((place) => place.placeId === placeId);
  return match?.address ?? MOCK_PLACES[0].address;
}

/** Simulates a GPS fix + reverse geocode; always resolves to the same demo address. */
export async function mockFetchCurrentLocation(): Promise<ResolvedAddress> {
  await delay(1500);
  return MOCK_PLACES[0].address;
}
