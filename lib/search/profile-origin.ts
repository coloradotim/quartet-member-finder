import {
  approximateLocationLabel,
  type Coordinates,
} from "@/lib/location/approximate-location";

export type ProfileOriginRow = {
  country_name: string | null;
  latitude_private: number | string | null;
  locality: string | null;
  location_label_public: string | null;
  longitude_private: number | string | null;
  postal_code_private: string | null;
  region: string | null;
};

export type ProfileOriginStatus =
  | "incomplete_location"
  | "missing_profile"
  | "needs_geocoding"
  | "usable";

export type ProfileOriginState = {
  coordinates: Coordinates | null;
  label: string;
  status: ProfileOriginStatus;
};

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

export function coordinatesFromPrivateRow(
  row: ProfileOriginRow | null,
): Coordinates | null {
  if (row?.latitude_private == null || row.longitude_private == null) {
    return null;
  }

  const latitude = Number(row.latitude_private);
  const longitude = Number(row.longitude_private);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function profileOriginHasCompleteTextLocation(
  row: ProfileOriginRow | null,
) {
  return Boolean(
    row &&
    hasText(row.country_name) &&
    hasText(row.region) &&
    hasText(row.locality) &&
    hasText(row.postal_code_private),
  );
}

export function labelForProfileOrigin(row: ProfileOriginRow | null) {
  if (!row) {
    return "your singer profile";
  }

  return approximateLocationLabel({
    countryName: row.country_name,
    locality: row.locality,
    locationLabelPublic: row.location_label_public,
    region: row.region,
  });
}

export function profileOriginState(row: ProfileOriginRow | null) {
  if (!row) {
    return {
      coordinates: null,
      label: "your singer profile",
      status: "missing_profile",
    } satisfies ProfileOriginState;
  }

  const coordinates = coordinatesFromPrivateRow(row);
  const label = labelForProfileOrigin(row);

  if (coordinates) {
    return {
      coordinates,
      label,
      status: "usable",
    } satisfies ProfileOriginState;
  }

  if (profileOriginHasCompleteTextLocation(row)) {
    return {
      coordinates: null,
      label,
      status: "needs_geocoding",
    } satisfies ProfileOriginState;
  }

  return {
    coordinates: null,
    label,
    status: "incomplete_location",
  } satisfies ProfileOriginState;
}

export function profileOriginUnavailableMessage(status: ProfileOriginStatus) {
  return profileOriginUnavailableMessageFor(status, "My Singer Profile");
}

export function profileOriginUnavailableMessageFor(
  status: ProfileOriginStatus,
  profileName: "My Quartet Profile" | "My Singer Profile",
) {
  if (status === "missing_profile") {
    return `Create ${profileName} with country, region, city, and ZIP/postal code, or search from another location.`;
  }

  if (status === "incomplete_location") {
    return `${profileName} needs country, region, city, and ZIP/postal code before it can be used for distance search. Edit ${profileName} or search from another location.`;
  }

  if (status === "needs_geocoding") {
    return `${profileName} has location text but does not have saved approximate coordinates yet. Re-save ${profileName} so the location can be prepared for distance search, or search from another location.`;
  }

  return null;
}
