import {
  PROFILE_GOALS,
  normalizeCountryCode,
  normalizeOptionalText,
  parseAllowedList,
  parseTravelRadiusMilesAsKm,
  parseVoicingPartList,
  type ProfileGoal,
} from "@/lib/profiles/singer-profile-form";
import {
  type Voicing,
  type VoicingPartSelection,
  isVoicing,
} from "@/lib/parts/voicings";
import { countryCodeFromName } from "@/lib/location/country-location-defaults";

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
  partsCovered: VoicingPartSelection[];
  partsNeeded: VoicingPartSelection[];
  postalCodePrivate: string | null;
  region: string | null;
  travelRadiusKm: number | null;
  voicing: Voicing;
};

function removePartsAlreadyNeeded(
  covered: VoicingPartSelection[],
  needed: VoicingPartSelection[],
) {
  const neededParts = new Set(
    needed.map((part) => `${part.voicing}:${part.part}`),
  );

  return covered.filter(
    (part) => !neededParts.has(`${part.voicing}:${part.part}`),
  );
}

function selectedVoicing(value: FormDataEntryValue | null) {
  return typeof value === "string" && isVoicing(value) ? value : "TTBB";
}

export function parseQuartetListingFormData(
  formData: FormData,
): QuartetListingFormValues {
  const name = normalizeOptionalText(formData.get("name"));
  const countryName = normalizeOptionalText(formData.get("countryName"));

  if (!name) {
    throw new Error("Listing name is required.");
  }

  const voicing = selectedVoicing(formData.get("voicing"));
  const partsNeeded = parseVoicingPartList(
    formData.getAll("partsNeeded"),
  ).filter((part) => part.voicing === voicing);
  const partsCovered = removePartsAlreadyNeeded(
    parseVoicingPartList(formData.getAll("partsCovered")).filter(
      (part) => part.voicing === voicing,
    ),
    partsNeeded,
  );

  return {
    availability: normalizeOptionalText(formData.get("availability")),
    countryCode:
      normalizeCountryCode(formData.get("countryCode")) ??
      countryCodeFromName(countryName),
    countryName,
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
    travelRadiusKm: parseTravelRadiusMilesAsKm(
      formData.get("travelRadiusMiles") ?? formData.get("travelRadiusKm"),
    ),
    voicing,
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
