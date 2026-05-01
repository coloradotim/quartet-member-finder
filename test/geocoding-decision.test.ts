import { describe, expect, it } from "vitest";
import {
  locationFieldsChanged,
  shouldGeocodeApproximateLocation,
  storedApproximateCoordinates,
} from "@/lib/location/geocoding-decision";

describe("geocoding trigger decisions", () => {
  const storedLocation = {
    countryCode: "US",
    countryName: "United States",
    latitudePrivate: 40.5853,
    locality: "Fort Collins",
    longitudePrivate: -105.0844,
    postalCodePrivate: "80521",
    region: "CO",
  };

  it("preserves stored coordinates when persisted location fields did not change", () => {
    const input = {
      countryCode: "US",
      countryName: " United States ",
      locality: "Fort Collins",
      postalCodePrivate: "80521",
      region: "CO",
    };

    expect(locationFieldsChanged(input, storedLocation)).toBe(false);
    expect(
      shouldGeocodeApproximateLocation({
        input,
        storageMode: "permanent",
        stored: storedLocation,
      }),
    ).toBe(false);
    expect(storedApproximateCoordinates(storedLocation)).toEqual({
      latitude: 40.5853,
      longitude: -105.0844,
    });
  });

  it("geocodes persisted records only when the location is new or changed", () => {
    expect(
      shouldGeocodeApproximateLocation({
        input: { countryName: "Canada", locality: "Toronto", region: "ON" },
        storageMode: "permanent",
        stored: null,
      }),
    ).toBe(true);
    expect(
      shouldGeocodeApproximateLocation({
        input: {
          countryCode: "US",
          countryName: "United States",
          locality: "Denver",
          postalCodePrivate: "80202",
          region: "CO",
        },
        storageMode: "permanent",
        stored: storedLocation,
      }),
    ).toBe(true);
  });

  it("retries unchanged persisted locations that do not have stored coordinates yet", () => {
    expect(
      shouldGeocodeApproximateLocation({
        input: {
          countryCode: "US",
          countryName: "United States",
          locality: "Fort Collins",
          postalCodePrivate: "80521",
          region: "CO",
        },
        storageMode: "permanent",
        stored: {
          ...storedLocation,
          latitudePrivate: null,
          longitudePrivate: null,
        },
      }),
    ).toBe(true);
  });

  it("always allows temporary search-origin geocoding because results are not stored", () => {
    expect(
      shouldGeocodeApproximateLocation({
        input: {
          countryCode: "US",
          countryName: "United States",
          locality: "Fort Collins",
          postalCodePrivate: "80521",
          region: "CO",
        },
        storageMode: "temporary",
        stored: storedLocation,
      }),
    ).toBe(true);
  });
});
