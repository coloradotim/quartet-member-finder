import { describe, expect, it } from "vitest";
import {
  approximateLocationLabel,
  hasDiscoveryFilters,
  parseDiscoveryFilters,
  travelRadiusLabel,
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

  it("builds an approximate location label without private fields", () => {
    expect(
      approximateLocationLabel({
        country_name: "Ireland",
        locality: "Dublin",
        location_label_public: null,
        region: "Leinster",
      }),
    ).toBe("Dublin, Leinster, Ireland area");
  });

  it("shows both kilometers and miles for travel willingness", () => {
    expect(travelRadiusLabel(100)).toBe("100 km / 62 mi");
    expect(travelRadiusLabel(null)).toBeNull();
  });
});
