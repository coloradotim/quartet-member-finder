import {
  PROFILE_GOALS,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import {
  parseVoicingPartValue,
  type VoicingPartSelection,
} from "@/lib/parts/voicings";
import type { DistanceUnit } from "@/lib/location/approximate-location";

export type DiscoveryFilters = {
  availability: string | null;
  country: string | null;
  distanceUnit: DistanceUnit;
  experience: string | null;
  goal: ProfileGoal | null;
  locality: string | null;
  part: VoicingPartSelection | null;
  parts: VoicingPartSelection[];
  radius: number | null;
  region: string | null;
  searchFrom: string | null;
  travelRadiusKm: number | null;
};

function normalizeSearchText(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalized = rawValue?.trim();

  return normalized ? normalized : null;
}

function parseDistanceUnit(value: string | string[] | undefined): DistanceUnit {
  return normalizeSearchText(value) === "km" ? "km" : "mi";
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

function parseRadius(value: string | string[] | undefined) {
  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return null;
  }

  const radius = Number(normalized);

  if (!Number.isInteger(radius) || radius <= 0 || radius > 10000) {
    return null;
  }

  return radius;
}

function parsePartList(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => parseVoicingPartValue(normalizeSearchText(item) ?? ""))
    .filter((part): part is VoicingPartSelection => part != null);
}

export function parseDiscoveryFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DiscoveryFilters {
  const parts = parsePartList(searchParams.part);

  return {
    availability: normalizeSearchText(searchParams.availability),
    country: normalizeSearchText(searchParams.country),
    distanceUnit: parseDistanceUnit(searchParams.distanceUnit),
    experience: normalizeSearchText(searchParams.experience),
    goal: parseAllowedValue(searchParams.goal, PROFILE_GOALS),
    locality: normalizeSearchText(searchParams.locality),
    part: parts[0] ?? null,
    parts,
    radius: parseRadius(searchParams.radius),
    region: normalizeSearchText(searchParams.region),
    searchFrom: normalizeSearchText(searchParams.searchFrom),
    travelRadiusKm: parseTravelRadiusKm(searchParams.travelRadiusKm),
  };
}

export function hasDiscoveryFilters(filters: DiscoveryFilters) {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "distanceUnit") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null;
  });
}
