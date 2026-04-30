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
        ["voicing", "TTBB"],
        ["partsCovered", "TTBB:Lead"],
        ["partsCovered", "TTBB:Bass"],
        ["partsNeeded", "TTBB:Tenor"],
        ["goals", "regular_rehearsal"],
        ["travelRadiusKm", "75"],
      ]),
    );

    expect(values.countryCode).toBe("CA");
    expect(values.postalCodePrivate).toBe("M5V");
    expect(values.partsCovered).toEqual([
      { part: "Lead", voicing: "TTBB" },
      { part: "Bass", voicing: "TTBB" },
    ]);
    expect(values.partsNeeded).toEqual([{ part: "Tenor", voicing: "TTBB" }]);
    expect(values.goals).toEqual(["regular_rehearsal"]);
    expect(values.travelRadiusKm).toBe(75);
  });

  it("keeps needed parts distinct from covered parts", () => {
    const values = parseQuartetListingFormData(
      formData([
        ["name", "Chord Project"],
        ["voicing", "SATB"],
        ["partsCovered", "SATB:Alto"],
        ["partsCovered", "SATB:Bass"],
        ["partsNeeded", "SATB:Alto"],
        ["partsNeeded", "SATB:Tenor"],
      ]),
    );

    expect(values.partsCovered).toEqual([{ part: "Bass", voicing: "SATB" }]);
    expect(values.partsNeeded).toEqual([
      { part: "Alto", voicing: "SATB" },
      { part: "Tenor", voicing: "SATB" },
    ]);
  });

  it("preserves every valid needed part for an incomplete quartet", () => {
    const values = parseQuartetListingFormData(
      formData([
        ["name", "Festival Pickup Quartet"],
        ["voicing", "SSAA"],
        ["partsCovered", "SSAA:Alto 1"],
        ["partsNeeded", "SSAA:Soprano 1"],
        ["partsNeeded", "SSAA:Soprano 2"],
        ["partsNeeded", "SSAA:Alto 2"],
      ]),
    );

    expect(values.partsCovered).toEqual([{ part: "Alto 1", voicing: "SSAA" }]);
    expect(values.partsNeeded).toEqual([
      { part: "Soprano 1", voicing: "SSAA" },
      { part: "Soprano 2", voicing: "SSAA" },
      { part: "Alto 2", voicing: "SSAA" },
    ]);
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
