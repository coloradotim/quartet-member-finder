import { describe, expect, it } from "vitest";
import {
  countryOptions,
  distanceUnitForCountry,
  effectiveCountryCode,
  kilometersToRoundedMiles,
  locationFieldLabelsForCountry,
  milesToRoundedKilometers,
} from "@/lib/location/country-location-defaults";

describe("country-aware location defaults", () => {
  it("infers distance units from country without asking for account settings", () => {
    expect(distanceUnitForCountry("US")).toBe("mi");
    expect(distanceUnitForCountry("gb")).toBe("mi");
    expect(distanceUnitForCountry(null, "United Kingdom")).toBe("mi");
    expect(distanceUnitForCountry("CA")).toBe("mi");
    expect(distanceUnitForCountry(null, null)).toBe("mi");
    expect(distanceUnitForCountry(null, "Australia")).toBe("km");
  });

  it("keeps United States and Canada first in the country picklist", () => {
    expect(countryOptions.slice(0, 2)).toEqual([
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
    ]);
  });

  it("converts user-facing miles to internal kilometers", () => {
    expect(milesToRoundedKilometers(50)).toBe(80);
    expect(kilometersToRoundedMiles(80)).toBe("50");
  });

  it("adapts location field labels without strict address validation", () => {
    expect(locationFieldLabelsForCountry("US")).toMatchObject({
      postalCode: "ZIP code",
      region: "State",
    });
    expect(locationFieldLabelsForCountry("CA")).toMatchObject({
      postalCode: "Postal code",
      region: "Province/Territory",
    });
    expect(locationFieldLabelsForCountry(null, "United Kingdom")).toMatchObject(
      {
        postalCode: "Postcode",
        region: "Region/County/State",
      },
    );
    expect(
      locationFieldLabelsForCountry(null, "Other / not listed"),
    ).toMatchObject({
      postalCode: "Postal code",
      region: "State / province / region",
    });
  });

  it("normalizes common country aliases", () => {
    expect(effectiveCountryCode("uk", null)).toBe("GB");
    expect(effectiveCountryCode(null, "USA")).toBe("US");
    expect(effectiveCountryCode(null, "Canada")).toBe("CA");
    expect(effectiveCountryCode(null, "Ireland")).toBe("IE");
  });
});
