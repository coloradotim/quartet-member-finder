import { describe, expect, it } from "vitest";
import {
  approximateLocationLabel,
  distanceBetweenCoordinatesKm,
  formatApproximateDistance,
  formatDistance,
  milesToKilometers,
  toPublicLocationSummary,
  travelRadiusLabel,
} from "@/lib/location/approximate-location";

describe("approximate location helpers", () => {
  it("builds a US approximate label without exact private data", () => {
    const publicLocation = toPublicLocationSummary({
      countryName: "United States",
      locality: "Fort Collins",
      locationLabelPublic: null,
      region: "CO",
    });

    expect(approximateLocationLabel(publicLocation)).toBe(
      "Fort Collins, CO, United States area",
    );
    expect(Object.keys(publicLocation)).not.toContain("latitude");
    expect(Object.keys(publicLocation)).not.toContain("longitude");
    expect(Object.keys(publicLocation)).not.toContain("postalCode");
  });

  it("uses provided public labels for non-US locations", () => {
    const publicLocation = toPublicLocationSummary({
      countryName: "United Kingdom",
      locality: "Manchester",
      locationLabelPublic: "  Manchester, UK area  ",
      region: "England",
    });

    expect(approximateLocationLabel(publicLocation)).toBe(
      "Manchester, UK area",
    );
  });

  it("falls back to globally tolerant locality, region, and country labels", () => {
    expect(
      approximateLocationLabel(
        toPublicLocationSummary({
          countryName: "Ireland",
          locality: "Dublin",
          locationLabelPublic: null,
          region: "Leinster",
        }),
      ),
    ).toBe("Dublin, Leinster, Ireland area");
  });

  it("calculates global great-circle distance in kilometers", () => {
    const distanceKm = distanceBetweenCoordinatesKm(
      { latitude: 40.5853, longitude: -105.0844 },
      { latitude: 51.5074, longitude: -0.1278 },
    );

    expect(distanceKm).not.toBeNull();
    expect(Math.round(distanceKm ?? 0)).toBeGreaterThan(7400);
    expect(Math.round(distanceKm ?? 0)).toBeLessThan(7600);
  });

  it("does not calculate distance for invalid exact coordinates", () => {
    expect(
      distanceBetweenCoordinatesKm(
        { latitude: 120, longitude: -105 },
        { latitude: 51.5074, longitude: -0.1278 },
      ),
    ).toBeNull();
  });

  it("formats distance and travel radius in miles and kilometers", () => {
    expect(formatDistance(100)).toBe("100 km / 62 mi");
    expect(formatDistance(100, "mi")).toBe("62 mi / 100 km");
    expect(formatApproximateDistance(24, "mi")).toBe(
      "about 15 mi / 24 km away",
    );
    expect(travelRadiusLabel(milesToKilometers(50), "mi")).toBe(
      "50 mi / 80 km",
    );
    expect(formatApproximateDistance(0)).toBe("about 0 km / 0 mi away");
    expect(travelRadiusLabel(null)).toBeNull();
  });

  it("does not format invalid public distances", () => {
    expect(formatDistance(-1)).toBeNull();
    expect(formatDistance(Number.NaN)).toBeNull();
    expect(formatApproximateDistance(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
