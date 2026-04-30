import type { DistanceUnit } from "@/lib/location/approximate-location";

type LocationFieldLabels = {
  locality: string;
  postalCode: string;
  region: string;
};

const countryNameAliases: Record<string, string> = {
  britain: "GB",
  canada: "CA",
  england: "GB",
  "great britain": "GB",
  ireland: "IE",
  "new zealand": "NZ",
  scotland: "GB",
  "united kingdom": "GB",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  wales: "GB",
};

const mileCountries = new Set(["GB", "LR", "MM", "UK", "US"]);

const labelOverrides: Record<string, LocationFieldLabels> = {
  AU: {
    locality: "Suburb/city",
    postalCode: "Postcode",
    region: "State/territory",
  },
  CA: {
    locality: "City/locality",
    postalCode: "Postal code",
    region: "Province/territory",
  },
  GB: {
    locality: "Town/city",
    postalCode: "Postcode",
    region: "Nation/county/region",
  },
  IE: {
    locality: "Town/city",
    postalCode: "Eircode/postal code",
    region: "County/region",
  },
  NZ: {
    locality: "Town/city",
    postalCode: "Postcode",
    region: "Region",
  },
  US: {
    locality: "City/locality",
    postalCode: "ZIP code",
    region: "State/region",
  },
};

const defaultLocationFieldLabels: LocationFieldLabels = {
  locality: "Locality/city",
  postalCode: "Postal code",
  region: "Region/admin area",
};

function normalizeCountryCodeValue(countryCode: string | null | undefined) {
  const normalized = countryCode?.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  return normalized === "UK" ? "GB" : normalized;
}

export function countryCodeFromName(countryName: string | null | undefined) {
  const normalized = countryName?.trim().toLowerCase();

  return normalized ? (countryNameAliases[normalized] ?? null) : null;
}

export function effectiveCountryCode(
  countryCode: string | null | undefined,
  countryName: string | null | undefined,
) {
  return (
    normalizeCountryCodeValue(countryCode) ?? countryCodeFromName(countryName)
  );
}

export function distanceUnitForCountry(
  countryCode: string | null | undefined,
  countryName?: string | null,
): DistanceUnit {
  const effectiveCode = effectiveCountryCode(countryCode, countryName);

  return effectiveCode && mileCountries.has(effectiveCode) ? "mi" : "km";
}

export function locationFieldLabelsForCountry(
  countryCode: string | null | undefined,
  countryName?: string | null,
) {
  const effectiveCode = effectiveCountryCode(countryCode, countryName);

  return effectiveCode && labelOverrides[effectiveCode]
    ? labelOverrides[effectiveCode]
    : defaultLocationFieldLabels;
}
