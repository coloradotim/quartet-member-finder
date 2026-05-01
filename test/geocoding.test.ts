import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildApproximateGeocodingQuery,
  geocodeApproximateLocation,
  geocodingEnabledForStorage,
} from "@/lib/location/geocoding";

describe("approximate geocoding", () => {
  beforeEach(() => {
    delete process.env.MAPBOX_GEOCODING_TOKEN;
    delete process.env.MAPBOX_GEOCODING_PERMANENT;
  });

  it("builds approximate queries without street or public label data", () => {
    expect(
      buildApproximateGeocodingQuery({
        countryName: "United States",
        locality: "Fort Collins",
        postalCodePrivate: "80521",
        region: "CO",
      }),
    ).toBe("80521, Fort Collins, CO, United States");
  });

  it("requires permanent storage opt-in before persisted geocoding", () => {
    process.env.MAPBOX_GEOCODING_TOKEN = "pk.test";

    expect(geocodingEnabledForStorage("temporary")).toBe(true);
    expect(geocodingEnabledForStorage("permanent")).toBe(false);

    process.env.MAPBOX_GEOCODING_PERMANENT = "true";

    expect(geocodingEnabledForStorage("permanent")).toBe(true);
  });

  it("resolves Mapbox coordinates without exposing the provider response", async () => {
    process.env.MAPBOX_GEOCODING_TOKEN = "pk.test";
    const fetchImpl = vi.fn().mockResolvedValue({
      json: async () => ({
        features: [
          {
            geometry: {
              coordinates: [-105.0844, 40.5853],
            },
          },
        ],
      }),
      ok: true,
    });

    const result = await geocodeApproximateLocation(
      {
        countryName: "United States",
        locality: "Fort Collins",
        region: "CO",
      },
      { fetchImpl },
    );

    expect(result).toEqual({
      coordinates: { latitude: 40.5853, longitude: -105.0844 },
      status: "resolved",
    });
    const requestedUrl = fetchImpl.mock.calls[0][0] as URL;
    expect(requestedUrl.searchParams.get("types")).toBe(
      "postcode,place,locality,region,country",
    );
    expect(requestedUrl.searchParams.get("permanent")).toBeNull();
  });

  it("returns not configured when a persisted lookup cannot be stored", async () => {
    process.env.MAPBOX_GEOCODING_TOKEN = "pk.test";

    await expect(
      geocodeApproximateLocation(
        { countryName: "Canada", locality: "Toronto", region: "Ontario" },
        { storageMode: "permanent" },
      ),
    ).resolves.toEqual({ coordinates: null, status: "not_configured" });
  });
});
