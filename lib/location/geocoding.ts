import type { Coordinates } from "@/lib/location/approximate-location";

type GeocodingStorageMode = "permanent" | "temporary";

export type ApproximateGeocodingInput = {
  countryCode?: string | null;
  countryName?: string | null;
  locality?: string | null;
  postalCodePrivate?: string | null;
  region?: string | null;
};

export type ApproximateGeocodingStatus =
  | "failed"
  | "not_configured"
  | "not_found"
  | "resolved";

export type ApproximateGeocodingResult =
  | {
      coordinates: Coordinates;
      status: "resolved";
    }
  | {
      coordinates: null;
      status: Exclude<ApproximateGeocodingStatus, "resolved">;
    };

type MapboxFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
};

type MapboxGeocodingResponse = {
  features?: MapboxFeature[];
};

type GeocodingFetch = typeof fetch;

const MAPBOX_FORWARD_GEOCODING_URL =
  "https://api.mapbox.com/search/geocode/v6/forward";

const APPROXIMATE_TYPES = [
  "postcode",
  "place",
  "locality",
  "region",
  "country",
];

function trimToNull(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function isValidCoordinate(coordinates: Coordinates) {
  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function mapboxPermanentStorageEnabled() {
  return process.env.MAPBOX_GEOCODING_PERMANENT === "true";
}

export function buildApproximateGeocodingQuery(
  input: ApproximateGeocodingInput,
) {
  return [
    trimToNull(input.postalCodePrivate),
    trimToNull(input.locality),
    trimToNull(input.region),
    trimToNull(input.countryName) ?? trimToNull(input.countryCode),
  ]
    .filter(Boolean)
    .join(", ");
}

export function geocodingEnabledForStorage(mode: GeocodingStorageMode) {
  if (!process.env.MAPBOX_GEOCODING_TOKEN) {
    return false;
  }

  return mode === "temporary" || mapboxPermanentStorageEnabled();
}

export async function geocodeApproximateLocation(
  input: ApproximateGeocodingInput,
  {
    fetchImpl = fetch,
    storageMode = "temporary",
  }: {
    fetchImpl?: GeocodingFetch;
    storageMode?: GeocodingStorageMode;
  } = {},
): Promise<ApproximateGeocodingResult> {
  const query = buildApproximateGeocodingQuery(input);
  const token = process.env.MAPBOX_GEOCODING_TOKEN;

  if (!query || !token || !geocodingEnabledForStorage(storageMode)) {
    return { coordinates: null, status: "not_configured" };
  }

  const url = new URL(MAPBOX_FORWARD_GEOCODING_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("types", APPROXIMATE_TYPES.join(","));
  url.searchParams.set("access_token", token);

  if (storageMode === "permanent") {
    url.searchParams.set("permanent", "true");
  }

  try {
    const response = await fetchImpl(url);

    if (!response.ok) {
      return { coordinates: null, status: "failed" };
    }

    const body = (await response.json()) as MapboxGeocodingResponse;
    const [longitude, latitude] =
      body.features?.[0]?.geometry?.coordinates ?? [];

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return { coordinates: null, status: "not_found" };
    }

    const coordinates = { latitude, longitude };

    if (!isValidCoordinate(coordinates)) {
      return { coordinates: null, status: "not_found" };
    }

    return { coordinates, status: "resolved" };
  } catch {
    return { coordinates: null, status: "failed" };
  }
}
