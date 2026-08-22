import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import type { Coordinates } from '@ub/shared-types';
import { createLogger } from './logger';

const log = createLogger('Location');

export type LocationErrorReason =
  'permission-denied' | 'permission-blocked' | 'services-disabled' | 'unavailable';

export class LocationError extends Error {
  reason: LocationErrorReason;

  constructor(reason: LocationErrorReason, message: string) {
    super(message);
    this.name = 'LocationError';
    this.reason = reason;
  }
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  // Check device-wide Location Services *before* permission. On iOS in particular,
  // when Location Services is off system-wide, requestForegroundPermissionsAsync()
  // reports the app's permission as "denied" even if it was previously granted —
  // there's no way for the OS to distinguish the two in that state. Checking
  // services first avoids misreporting a GPS-off device as a permission problem.
  log.info('Checking device location services…');
  let servicesEnabled = await Location.hasServicesEnabledAsync();

  if (!servicesEnabled && Platform.OS === 'android') {
    // Android (via Google Play services) can prompt the user with a native system
    // dialog to turn location on right here, no trip to Settings needed. iOS has
    // no equivalent API — Apple only allows deep-linking to the Settings app.
    log.info('Location services are off — showing the Android system dialog to enable them…');
    try {
      await Location.enableNetworkProviderAsync();
      servicesEnabled = true;
      log.info('User enabled location services from the system dialog');
    } catch (err) {
      log.warn('User dismissed/declined the system location-services dialog', err);
    }
  }

  if (!servicesEnabled) {
    log.warn('Location services are disabled on this device');
    throw new LocationError('services-disabled', 'Location services are turned off.');
  }
  log.info('Location services are enabled');

  log.info('Requesting foreground location permission…');
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    const reason = canAskAgain ? 'permission-denied' : 'permission-blocked';
    log.warn('Permission not granted', { status, canAskAgain, reason });
    throw new LocationError(reason, 'Location permission was not granted.');
  }
  log.info('Permission granted');

  try {
    log.info('Requesting current GPS fix (accuracy: balanced)…');
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coordinates: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    log.info('Got GPS fix', coordinates);
    return coordinates;
  } catch (err) {
    log.error('Failed to get a GPS fix', err);
    throw new LocationError('unavailable', 'Could not determine the current location.');
  }
}

export function openLocationSettings() {
  log.info('Opening OS Settings for this app');
  return Linking.openSettings();
}
