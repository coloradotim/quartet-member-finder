import {
  parseVoicingPartValue,
  type VoicingPartSelection,
} from "@/lib/parts/voicings";

export const PROFILE_GOALS = [
  "casual",
  "pickup",
  "regular_rehearsal",
  "contest",
  "paid_gigs",
  "learning",
] as const;

export type ProfileGoal = (typeof PROFILE_GOALS)[number];

export type SingerProfileFormValues = {
  availability: string | null;
  bio: string | null;
  countryCode: string | null;
  countryName: string | null;
  displayName: string;
  experienceLevel: string | null;
  goals: ProfileGoal[];
  isVisible: boolean;
  locality: string | null;
  locationLabelPublic: string | null;
  parts: VoicingPartSelection[];
  postalCodePrivate: string | null;
  region: string | null;
  travelRadiusKm: number | null;
};

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeCountryCode(value: FormDataEntryValue | null) {
  const normalized = normalizeOptionalText(value)?.toUpperCase() ?? null;

  if (!normalized) {
    return null;
  }

  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function parseTravelRadiusKm(value: FormDataEntryValue | null) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  const radius = Number(normalized);

  if (!Number.isInteger(radius) || radius < 0 || radius > 10000) {
    return null;
  }

  return radius;
}

export function parseAllowedList<T extends string>(
  values: FormDataEntryValue[],
  allowedValues: readonly T[],
) {
  const allowed = new Set<string>(allowedValues);

  return values
    .filter((value): value is string => typeof value === "string")
    .filter((value): value is T => allowed.has(value));
}

export function parseVoicingPartList(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => parseVoicingPartValue(value))
    .filter((value): value is VoicingPartSelection => value != null);
}

export function parseSingerProfileFormData(
  formData: FormData,
): SingerProfileFormValues {
  const displayName = normalizeOptionalText(formData.get("displayName"));

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  return {
    availability: normalizeOptionalText(formData.get("availability")),
    bio: normalizeOptionalText(formData.get("bio")),
    countryCode: normalizeCountryCode(formData.get("countryCode")),
    countryName: normalizeOptionalText(formData.get("countryName")),
    displayName,
    experienceLevel: normalizeOptionalText(formData.get("experienceLevel")),
    goals: parseAllowedList(formData.getAll("goals"), PROFILE_GOALS),
    isVisible: formData.get("isVisible") === "on",
    locality: normalizeOptionalText(formData.get("locality")),
    locationLabelPublic: normalizeOptionalText(
      formData.get("locationLabelPublic"),
    ),
    parts: parseVoicingPartList(formData.getAll("parts")),
    postalCodePrivate: normalizeOptionalText(formData.get("postalCodePrivate")),
    region: normalizeOptionalText(formData.get("region")),
    travelRadiusKm: parseTravelRadiusKm(formData.get("travelRadiusKm")),
  };
}

export function inferLocationPrecision(
  values: Pick<
    SingerProfileFormValues,
    "countryCode" | "countryName" | "locality" | "postalCodePrivate" | "region"
  >,
) {
  if (values.postalCodePrivate) {
    return "postal_code";
  }

  if (values.locality) {
    return "locality";
  }

  if (values.region) {
    return "region";
  }

  if (values.countryCode || values.countryName) {
    return "country";
  }

  return "unknown";
}

export function buildPublicLocationLabel(
  values: Pick<
    SingerProfileFormValues,
    "countryName" | "locality" | "locationLabelPublic" | "region"
  >,
) {
  if (values.locationLabelPublic) {
    return values.locationLabelPublic;
  }

  const locationParts = [values.locality, values.region, values.countryName]
    .filter(Boolean)
    .join(", ");

  return locationParts ? `${locationParts} area` : null;
}
