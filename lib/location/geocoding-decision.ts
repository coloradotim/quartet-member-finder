import type {
  ApproximateGeocodingInput,
  GeocodingStorageMode,
} from "@/lib/location/geocoding";
import type { Coordinates } from "@/lib/location/approximate-location";

export type StoredApproximateLocation = {
  countryCode?: string | null;
  countryName?: string | null;
  latitudePrivate?: number | null;
  locality?: string | null;
  locationPrecision?: string | null;
  longitudePrivate?: number | null;
  postalCodePrivate?: string | null;
  region?: string | null;
};

function normalized(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function sameLocationField(
  current: string | null | undefined,
  stored: string | null | undefined,
) {
  return normalized(current) === normalized(stored);
}

export function locationFieldsChanged(
  input: ApproximateGeocodingInput,
  stored: StoredApproximateLocation | null,
) {
  if (!stored) {
    return true;
  }

  return !(
    sameLocationField(input.countryCode, stored.countryCode) &&
    sameLocationField(input.countryName, stored.countryName) &&
    sameLocationField(input.locality, stored.locality) &&
    sameLocationField(input.postalCodePrivate, stored.postalCodePrivate) &&
    sameLocationField(input.region, stored.region)
  );
}

export function storedApproximateCoordinates(
  stored: StoredApproximateLocation | null,
): Coordinates | null {
  if (
    typeof stored?.latitudePrivate !== "number" ||
    typeof stored.longitudePrivate !== "number"
  ) {
    return null;
  }

  return {
    latitude: stored.latitudePrivate,
    longitude: stored.longitudePrivate,
  };
}

export function shouldGeocodeApproximateLocation({
  input,
  storageMode,
  stored,
}: {
  input: ApproximateGeocodingInput;
  storageMode: GeocodingStorageMode;
  stored: StoredApproximateLocation | null;
}) {
  if (storageMode === "temporary") {
    return true;
  }

  return (
    locationFieldsChanged(input, stored) ||
    !storedApproximateCoordinates(stored)
  );
}
