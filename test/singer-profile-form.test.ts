import { describe, expect, it } from "vitest";
import {
  buildPublicLocationLabel,
  inferLocationPrecision,
  parseSingerProfileFormData,
} from "@/lib/profiles/singer-profile-form";
import { partsByVoicing, satbDisplayLabels } from "@/lib/parts/voicings";

function formData(entries: Array<[string, string]>) {
  const data = new FormData();

  for (const [key, value] of entries) {
    data.append(key, value);
  }

  return data;
}

describe("singer profile form parsing", () => {
  it("keeps barbershop part constants explicit and does not rename Lead", () => {
    expect(partsByVoicing.TTBB).toEqual(["Tenor", "Lead", "Baritone", "Bass"]);
    expect(partsByVoicing.TTBB).toContain("Lead");
    expect(partsByVoicing.TTBB).not.toContain("Melody");
    expect(partsByVoicing.SSAA).toEqual([
      "Soprano 1",
      "Soprano 2",
      "Alto 1",
      "Alto 2",
    ]);
    expect(satbDisplayLabels.Soprano).toBe("Soprano / Mixed Tenor");
  });

  it("accepts globally tolerant location fields without US-only requirements", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Priya"],
        ["countryName", "United Kingdom"],
        ["locality", "Manchester"],
        ["postalCodePrivate", "M1 1AE"],
        ["parts", "TTBB:Lead"],
        ["parts", "SATB:Soprano"],
        ["goals", "pickup"],
        ["travelRadiusMiles", "25"],
      ]),
    );

    expect(values.countryCode).toBe("GB");
    expect(values.postalCodePrivate).toBe("M1 1AE");
    expect(values.parts).toEqual([
      { part: "Lead", voicing: "TTBB" },
      { part: "Soprano", voicing: "SATB" },
    ]);
    expect(values.goals).toEqual(["pickup"]);
    expect(values.travelRadiusKm).toBe(40);
  });

  it("filters unexpected parts and goals", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Jordan"],
        ["countryName", "Other / not listed"],
        ["parts", "TTBB:Lead"],
        ["parts", "melody"],
        ["goals", "contest"],
        ["goals", "viral_video"],
      ]),
    );

    expect(values.countryCode).toBeNull();
    expect(values.parts).toEqual([{ part: "Lead", voicing: "TTBB" }]);
    expect(values.goals).toEqual(["contest"]);
  });

  it("builds an approximate public location without postal code", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Ari"],
        ["countryName", "Canada"],
        ["locality", "Toronto"],
        ["postalCodePrivate", "M5V"],
      ]),
    );

    expect(buildPublicLocationLabel(values)).toBe("Toronto, Canada area");
    expect(buildPublicLocationLabel(values)).not.toContain("M5V");
    expect(inferLocationPrecision(values)).toBe("postal_code");
  });

  it("requires a display name", () => {
    expect(() => parseSingerProfileFormData(formData([]))).toThrow(
      "Display name is required.",
    );
  });
});
