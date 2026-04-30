import { describe, expect, it } from "vitest";
import {
  distanceUnitForCountry,
  effectiveCountryCode,
  locationFieldLabelsForCountry,
} from "@/lib/location/country-location-defaults";

describe("country-aware location defaults", () => {
  it("infers distance units from country without asking for account settings", () => {
    expect(distanceUnitForCountry("US")).toBe("mi");
    expect(distanceUnitForCountry("gb")).toBe("mi");
    expect(distanceUnitForCountry(null, "United Kingdom")).toBe("mi");
    expect(distanceUnitForCountry("CA")).toBe("km");
    expect(distanceUnitForCountry(null, "Australia")).toBe("km");
  });

  it("adapts location field labels without strict address validation", () => {
    expect(locationFieldLabelsForCountry("US")).toMatchObject({
      postalCode: "ZIP code",
      region: "State/region",
    });
    expect(locationFieldLabelsForCountry("CA")).toMatchObject({
      postalCode: "Postal code",
      region: "Province/territory",
    });
    expect(locationFieldLabelsForCountry(null, "United Kingdom")).toMatchObject(
      {
        postalCode: "Postcode",
        region: "Nation/county/region",
      },
    );
  });

  it("normalizes common country aliases", () => {
    expect(effectiveCountryCode("uk", null)).toBe("GB");
    expect(effectiveCountryCode(null, "USA")).toBe("US");
    expect(effectiveCountryCode(null, "Ireland")).toBe("IE");
  });
});
