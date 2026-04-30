import { describe, expect, it } from "vitest";
import {
  hasDiscoveryFilters,
  parseDiscoveryFilters,
} from "@/lib/search/discovery-filters";

describe("discovery filters", () => {
  it("parses allowed part and goal filters", () => {
    const filters = parseDiscoveryFilters({
      goal: "contest",
      part: "lead",
      travelRadiusKm: "50",
    });

    expect(filters.goal).toBe("contest");
    expect(filters.part).toBe("lead");
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
    expect(hasDiscoveryFilters(filters)).toBe(false);
  });
});
