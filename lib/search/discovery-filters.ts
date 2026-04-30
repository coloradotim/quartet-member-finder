import {
  PROFILE_GOALS,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import {
  parseVoicingPartValue,
  type VoicingPartSelection,
} from "@/lib/parts/voicings";

export type DiscoveryFilters = {
  availability: string | null;
  country: string | null;
  experience: string | null;
  goal: ProfileGoal | null;
  locality: string | null;
  part: VoicingPartSelection | null;
  region: string | null;
  travelRadiusKm: number | null;
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
    part: parseVoicingPartValue(normalizeSearchText(searchParams.part) ?? ""),
    region: normalizeSearchText(searchParams.region),
    travelRadiusKm: parseTravelRadiusKm(searchParams.travelRadiusKm),
  };
}

export function hasDiscoveryFilters(filters: DiscoveryFilters) {
  return Object.values(filters).some((value) => value !== null);
}
