import { describe, expect, it } from "vitest";
import {
  hasDiscoveryFilters,
  parseDiscoveryFilters,
} from "@/lib/search/discovery-filters";

describe("discovery filters", () => {
  it("parses allowed part and goal filters", () => {
    const filters = parseDiscoveryFilters({
      country: "  United Kingdom  ",
      locality: " Manchester ",
      region: " Greater Manchester ",
      goal: "contest",
      part: "SATB:Soprano",
      distanceUnit: "km",
      travelRadiusKm: "50",
    });

    expect(filters.country).toBe("United Kingdom");
    expect(filters.locality).toBe("Manchester");
    expect(filters.region).toBe("Greater Manchester");
    expect(filters.goal).toBe("contest");
    expect(filters.part).toEqual({ part: "Soprano", voicing: "SATB" });
    expect(filters.distanceUnit).toBe("km");
    expect(filters.travelRadiusKm).toBe(50);
    expect(hasDiscoveryFilters(filters)).toBe(true);
  });

  it("ignores unexpected enum filters and invalid travel radius", () => {
    const filters = parseDiscoveryFilters({
      goal: "viral",
      part: "melody",
      travelRadiusKm: "-10",
    });

    expect(filters.goal).toBeNull();
    expect(filters.part).toBeNull();
    expect(filters.travelRadiusKm).toBeNull();
    expect(filters.distanceUnit).toBe("mi");
    expect(hasDiscoveryFilters(filters)).toBe(false);
  });

  it("uses the first submitted query value and keeps global text filters", () => {
    const filters = parseDiscoveryFilters({
      country: ["Ireland", "United States"],
      goal: ["pickup", "contest"],
      locality: ["Dublin", "Boston"],
      part: ["TTBB:Tenor", "melody"],
      distanceUnit: ["km", "mi"],
      travelRadiusKm: ["10000", "25"],
    });

    expect(filters.country).toBe("Ireland");
    expect(filters.locality).toBe("Dublin");
    expect(filters.goal).toBe("pickup");
    expect(filters.part).toEqual({ part: "Tenor", voicing: "TTBB" });
    expect(filters.distanceUnit).toBe("km");
    expect(filters.travelRadiusKm).toBe(10000);
  });

  it("rejects decimal, negative, and too-large travel radius filters", () => {
    expect(
      parseDiscoveryFilters({ travelRadiusKm: "10.5" }).travelRadiusKm,
    ).toBeNull();
    expect(
      parseDiscoveryFilters({ travelRadiusKm: "-1" }).travelRadiusKm,
    ).toBeNull();
    expect(
      parseDiscoveryFilters({ travelRadiusKm: "10001" }).travelRadiusKm,
    ).toBeNull();
  });
});
