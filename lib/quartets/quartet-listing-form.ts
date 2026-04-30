import {
  BARBERSHOP_PARTS,
  PROFILE_GOALS,
  normalizeCountryCode,
  normalizeOptionalText,
  parseTravelRadiusKm,
  type BarbershopPart,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";

export type QuartetListingFormValues = {
  availability: string | null;
  countryCode: string | null;
  countryName: string | null;
  description: string | null;
  experienceLevel: string | null;
  goals: ProfileGoal[];
  isVisible: boolean;
  listingId: string | null;
  locality: string | null;
  locationLabelPublic: string | null;
  name: string;
  partsCovered: BarbershopPart[];
  partsNeeded: BarbershopPart[];
  postalCodePrivate: string | null;
  region: string | null;
  travelRadiusKm: number | null;
};

function parseAllowedList<T extends string>(
  values: FormDataEntryValue[],
  allowedValues: readonly T[],
) {
  const allowed = new Set<string>(allowedValues);

  return values
    .filter((value): value is string => typeof value === "string")
    .filter((value): value is T => allowed.has(value));
}

function removePartsAlreadyNeeded(
  covered: BarbershopPart[],
  needed: BarbershopPart[],
) {
  const neededParts = new Set(needed);

  return covered.filter((part) => !neededParts.has(part));
}

export function parseQuartetListingFormData(
  formData: FormData,
): QuartetListingFormValues {
  const name = normalizeOptionalText(formData.get("name"));

  if (!name) {
    throw new Error("Listing name is required.");
  }

  const partsNeeded = parseAllowedList(
    formData.getAll("partsNeeded"),
    BARBERSHOP_PARTS,
  );
  const partsCovered = removePartsAlreadyNeeded(
    parseAllowedList(formData.getAll("partsCovered"), BARBERSHOP_PARTS),
    partsNeeded,
  );

  return {
    availability: normalizeOptionalText(formData.get("availability")),
    countryCode: normalizeCountryCode(formData.get("countryCode")),
    countryName: normalizeOptionalText(formData.get("countryName")),
    description: normalizeOptionalText(formData.get("description")),
    experienceLevel: normalizeOptionalText(formData.get("experienceLevel")),
    goals: parseAllowedList(formData.getAll("goals"), PROFILE_GOALS),
    isVisible: formData.get("isVisible") === "on",
    listingId: normalizeOptionalText(formData.get("listingId")),
    locality: normalizeOptionalText(formData.get("locality")),
    locationLabelPublic: normalizeOptionalText(
      formData.get("locationLabelPublic"),
    ),
    name,
    partsCovered,
    partsNeeded,
    postalCodePrivate: normalizeOptionalText(formData.get("postalCodePrivate")),
    region: normalizeOptionalText(formData.get("region")),
    travelRadiusKm: parseTravelRadiusKm(formData.get("travelRadiusKm")),
  };
}

export function inferQuartetLocationPrecision(
  values: Pick<
    QuartetListingFormValues,
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

export function buildQuartetPublicLocationLabel(
  values: Pick<
    QuartetListingFormValues,
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
