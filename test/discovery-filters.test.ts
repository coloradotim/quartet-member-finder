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
      radius: "25",
      searchFromSource: "singer_profile",
      searchFrom: " Manchester, England ",
      travelRadiusKm: "50",
    });

    expect(filters.country).toBe("United Kingdom");
    expect(filters.locality).toBe("Manchester");
    expect(filters.region).toBe("Greater Manchester");
    expect(filters.goal).toBe("contest");
    expect(filters.goals).toEqual(["contest"]);
    expect(filters.part).toEqual({ part: "Soprano", voicing: "SATB" });
    expect(filters.parts).toEqual([{ part: "Soprano", voicing: "SATB" }]);
    expect(filters.distanceUnit).toBe("km");
    expect(filters.radius).toBe(25);
    expect(filters.searchOrigin).toBe("profile");
    expect(filters.searchFromSource).toBe("singer_profile");
    expect(filters.searchFrom).toBe("Manchester, England");
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
    expect(filters.goals).toEqual([]);
    expect(filters.part).toBeNull();
    expect(filters.parts).toEqual([]);
    expect(filters.travelRadiusKm).toBeNull();
    expect(filters.radius).toBeNull();
    expect(filters.distanceUnit).toBe("mi");
    expect(filters.searchOrigin).toBe("typed");
    expect(filters.searchFromSource).toBe("another");
    expect(hasDiscoveryFilters(filters)).toBe(false);
  });

  it("keeps multiple submitted goals and global text filters", () => {
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
    expect(filters.goals).toEqual(["pickup", "contest"]);
    expect(filters.part).toEqual({ part: "Tenor", voicing: "TTBB" });
    expect(filters.parts).toEqual([{ part: "Tenor", voicing: "TTBB" }]);
    expect(filters.distanceUnit).toBe("km");
    expect(filters.travelRadiusKm).toBe(10000);
  });

  it("supports multi-select parts and a radius tied to units", () => {
    const filters = parseDiscoveryFilters({
      part: ["TTBB:Lead", "TTBB:Baritone", "melody"],
      radius: "35",
      distanceUnit: "mi",
      searchFrom: "Fort Collins, CO",
    });

    expect(filters.parts).toEqual([
      { part: "Lead", voicing: "TTBB" },
      { part: "Baritone", voicing: "TTBB" },
    ]);
    expect(filters.radius).toBe(35);
    expect(filters.distanceUnit).toBe("mi");
    expect(filters.searchFrom).toBe("Fort Collins, CO");
    expect(hasDiscoveryFilters(filters)).toBe(true);
  });

  it("supports quartet profile and legacy profile search origins", () => {
    expect(
      parseDiscoveryFilters({ searchFromSource: "quartet_profile" })
        .searchFromSource,
    ).toBe("quartet_profile");
    expect(parseDiscoveryFilters({ searchOrigin: "profile" })).toMatchObject({
      searchFromSource: "singer_profile",
      searchOrigin: "profile",
    });
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
    expect(parseDiscoveryFilters({ radius: "10.5" }).radius).toBeNull();
    expect(parseDiscoveryFilters({ radius: "-1" }).radius).toBeNull();
    expect(parseDiscoveryFilters({ radius: "10001" }).radius).toBeNull();
  });
});
