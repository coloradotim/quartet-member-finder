import { describe, expect, it } from "vitest";
import {
  BARBERSHOP_PARTS,
  buildPublicLocationLabel,
  inferLocationPrecision,
  parseSingerProfileFormData,
} from "@/lib/profiles/singer-profile-form";

function formData(entries: Array<[string, string]>) {
  const data = new FormData();

  for (const [key, value] of entries) {
    data.append(key, value);
  }

  return data;
}

describe("singer profile form parsing", () => {
  it("keeps barbershop part constants explicit and does not rename Lead", () => {
    expect(BARBERSHOP_PARTS).toEqual(["tenor", "lead", "baritone", "bass"]);
    expect(BARBERSHOP_PARTS).toContain("lead");
    expect(BARBERSHOP_PARTS).not.toContain("melody");
  });

  it("accepts globally tolerant location fields without US-only requirements", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Priya"],
        ["countryCode", "gb"],
        ["countryName", "United Kingdom"],
        ["region", "Greater Manchester"],
        ["locality", "Manchester"],
        ["postalCodePrivate", "M1 1AE"],
        ["parts", "lead"],
        ["parts", "bass"],
        ["goals", "pickup"],
        ["travelRadiusKm", "40"],
      ]),
    );

    expect(values.countryCode).toBe("GB");
    expect(values.postalCodePrivate).toBe("M1 1AE");
    expect(values.parts).toEqual(["lead", "bass"]);
    expect(values.goals).toEqual(["pickup"]);
    expect(values.travelRadiusKm).toBe(40);
  });

  it("filters unexpected parts and goals", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Jordan"],
        ["countryCode", "usa"],
        ["parts", "lead"],
        ["parts", "melody"],
        ["goals", "contest"],
        ["goals", "viral_video"],
      ]),
    );

    expect(values.countryCode).toBeNull();
    expect(values.parts).toEqual(["lead"]);
    expect(values.goals).toEqual(["contest"]);
  });

  it("builds an approximate public location without postal code", () => {
    const values = parseSingerProfileFormData(
      formData([
        ["displayName", "Ari"],
        ["countryName", "Canada"],
        ["region", "Ontario"],
        ["locality", "Toronto"],
        ["postalCodePrivate", "M5V"],
      ]),
    );

    expect(buildPublicLocationLabel(values)).toBe(
      "Toronto, Ontario, Canada area",
    );
    expect(buildPublicLocationLabel(values)).not.toContain("M5V");
    expect(inferLocationPrecision(values)).toBe("postal_code");
  });

  it("requires a display name", () => {
    expect(() => parseSingerProfileFormData(formData([]))).toThrow(
      "Display name is required.",
    );
  });
});
