import { describe, expect, it } from "vitest";
import {
  buildQuartetPublicLocationLabel,
  inferQuartetLocationPrecision,
  parseQuartetListingFormData,
} from "@/lib/quartets/quartet-listing-form";

function formData(entries: Array<[string, string]>) {
  const data = new FormData();

  for (const [key, value] of entries) {
    data.append(key, value);
  }

  return data;
}

describe("quartet listing form parsing", () => {
  it("accepts globally tolerant location fields without US-only requirements", () => {
    const values = parseQuartetListingFormData(
      formData([
        ["name", "Harbour Lights"],
        ["countryCode", "ca"],
        ["countryName", "Canada"],
        ["region", "Ontario"],
        ["locality", "Toronto"],
        ["postalCodePrivate", "M5V"],
        ["partsCovered", "lead"],
        ["partsCovered", "bass"],
        ["partsNeeded", "tenor"],
        ["goals", "regular_rehearsal"],
        ["travelRadiusKm", "75"],
      ]),
    );

    expect(values.countryCode).toBe("CA");
    expect(values.postalCodePrivate).toBe("M5V");
    expect(values.partsCovered).toEqual(["lead", "bass"]);
    expect(values.partsNeeded).toEqual(["tenor"]);
    expect(values.goals).toEqual(["regular_rehearsal"]);
    expect(values.travelRadiusKm).toBe(75);
  });

  it("keeps needed parts distinct from covered parts", () => {
    const values = parseQuartetListingFormData(
      formData([
        ["name", "Chord Project"],
        ["partsCovered", "lead"],
        ["partsCovered", "bass"],
        ["partsNeeded", "lead"],
        ["partsNeeded", "baritone"],
      ]),
    );

    expect(values.partsCovered).toEqual(["bass"]);
    expect(values.partsNeeded).toEqual(["lead", "baritone"]);
  });

  it("builds an approximate public location without postal code", () => {
    const values = parseQuartetListingFormData(
      formData([
        ["name", "Afterglow Four"],
        ["countryName", "Australia"],
        ["region", "Victoria"],
        ["locality", "Melbourne"],
        ["postalCodePrivate", "3000"],
      ]),
    );

    expect(buildQuartetPublicLocationLabel(values)).toBe(
      "Melbourne, Victoria, Australia area",
    );
    expect(buildQuartetPublicLocationLabel(values)).not.toContain("3000");
    expect(inferQuartetLocationPrecision(values)).toBe("postal_code");
  });

  it("requires a listing name", () => {
    expect(() => parseQuartetListingFormData(formData([]))).toThrow(
      "Listing name is required.",
    );
  });
});
