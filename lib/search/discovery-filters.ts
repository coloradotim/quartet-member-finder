import {
  BARBERSHOP_PARTS,
  PROFILE_GOALS,
  type BarbershopPart,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";

export type DiscoveryFilters = {
  availability: string | null;
  country: string | null;
  experience: string | null;
  goal: ProfileGoal | null;
  locality: string | null;
  part: BarbershopPart | null;
  region: string | null;
  travelRadiusKm: number | null;
};

export type LocationSummary = {
  country_name: string | null;
  locality: string | null;
  location_label_public: string | null;
  region: string | null;
};

function normalizeSearchText(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalized = rawValue?.trim();

  return normalized ? normalized : null;
}

function parseAllowedValue<T extends string>(
  value: string | string[] | undefined,
  allowedValues: readonly T[],
) {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return null;
  }

  return allowedValues.includes(normalized as T) ? (normalized as T) : null;
}

function parseTravelRadiusKm(value: string | string[] | undefined) {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return null;
  }

  const radius = Number(normalized);

  if (!Number.isInteger(radius) || radius < 0 || radius > 10000) {
    return null;
  }

  return radius;
}

export function parseDiscoveryFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DiscoveryFilters {
  return {
    availability: normalizeSearchText(searchParams.availability),
    country: normalizeSearchText(searchParams.country),
    experience: normalizeSearchText(searchParams.experience),
    goal: parseAllowedValue(searchParams.goal, PROFILE_GOALS),
    locality: normalizeSearchText(searchParams.locality),
    part: parseAllowedValue(searchParams.part, BARBERSHOP_PARTS),
    region: normalizeSearchText(searchParams.region),
    travelRadiusKm: parseTravelRadiusKm(searchParams.travelRadiusKm),
  };
}

export function hasDiscoveryFilters(filters: DiscoveryFilters) {
  return Object.values(filters).some((value) => value !== null);
}

export function approximateLocationLabel(location: LocationSummary) {
  if (location.location_label_public) {
    return location.location_label_public;
  }

  const parts = [location.locality, location.region, location.country_name]
    .filter(Boolean)
    .join(", ");

  return parts ? `${parts} area` : "Location not shared";
}

export function travelRadiusLabel(radiusKm: number | null) {
  if (radiusKm == null) {
    return null;
  }

  const miles = Math.round(radiusKm * 0.621371);
  return `${radiusKm} km / ${miles} mi`;
}
