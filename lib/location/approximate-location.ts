export type DistanceUnit = "km" | "mi";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PrivateLocationInput = {
  countryName?: string | null;
  locality?: string | null;
  locationLabelPublic?: string | null;
  region?: string | null;
};

export type PublicLocationSummary = {
  countryName: string | null;
  locality: string | null;
  locationLabelPublic: string | null;
  region: string | null;
};

const EARTH_RADIUS_KM = 6371.0088;
const KM_PER_MILE = 1.609344;
const MILES_PER_KM = 0.621371;

function trimToNull(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function isValidCoordinate({ latitude, longitude }: Coordinates) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function kilometersToMiles(kilometers: number) {
  return kilometers * MILES_PER_KM;
}

export function milesToKilometers(miles: number) {
  return miles * KM_PER_MILE;
}

export function distanceBetweenCoordinatesKm(
  origin: Coordinates,
  destination: Coordinates,
) {
  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
    return null;
  }

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * centralAngle;
}

export function formatDistance(
  distanceKm: number | null,
  preferredUnit: DistanceUnit = "km",
) {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }

  const roundedKm = Math.round(distanceKm);
  const roundedMiles = Math.round(kilometersToMiles(distanceKm));

  if (preferredUnit === "mi") {
    return `${roundedMiles} mi / ${roundedKm} km`;
  }

  return `${roundedKm} km / ${roundedMiles} mi`;
}

export function formatApproximateDistance(
  distanceKm: number | null,
  preferredUnit: DistanceUnit = "km",
) {
  const formattedDistance = formatDistance(distanceKm, preferredUnit);

  return formattedDistance ? `about ${formattedDistance} away` : null;
}

export function travelRadiusLabel(
  radiusKm: number | null,
  preferredUnit: DistanceUnit = "km",
) {
  return formatDistance(radiusKm, preferredUnit);
}

export function toPublicLocationSummary(
  location: PrivateLocationInput,
): PublicLocationSummary {
  return {
    countryName: trimToNull(location.countryName),
    locality: trimToNull(location.locality),
    locationLabelPublic: trimToNull(location.locationLabelPublic),
    region: trimToNull(location.region),
  };
}

export function approximateLocationLabel(location: PublicLocationSummary) {
  if (location.locationLabelPublic) {
    return location.locationLabelPublic;
  }

  const parts = [location.locality, location.region, location.countryName]
    .filter(Boolean)
    .join(", ");

  return parts ? `${parts} area` : "Location not shared";
}
