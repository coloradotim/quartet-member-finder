import { describe, expect, it } from "vitest";
import {
  discoverabilityExplanation,
  discoverabilityStatusLabel,
} from "@/lib/search/discoverability-status";
import type { ProfileOriginState } from "@/lib/search/profile-origin";

function originState(status: ProfileOriginState["status"]): ProfileOriginState {
  return {
    coordinates: status === "usable" ? { latitude: 40, longitude: -105 } : null,
    label: "Fort Collins, CO area",
    status,
  };
}

describe("Find page discoverability status", () => {
  it("uses Shown in Find and Not shown in Find labels", () => {
    expect(
      discoverabilityStatusLabel({
        isVisible: true,
        state: originState("usable"),
      }),
    ).toBe("Shown in Find");
    expect(
      discoverabilityStatusLabel({
        isVisible: false,
        state: originState("usable"),
      }),
    ).toBe("Not shown in Find");
    expect(
      discoverabilityStatusLabel({
        isVisible: null,
        state: originState("missing_profile"),
      }),
    ).toBe("Not shown in Find");
  });

  it("notes when a visible profile is missing usable distance-search location", () => {
    for (const status of [
      "incomplete_location",
      "missing_profile",
      "needs_geocoding",
    ] satisfies ProfileOriginState["status"][]) {
      expect(
        discoverabilityStatusLabel({
          isVisible: true,
          state: originState(status),
        }),
      ).toBe("Shown in Find, but missing location for distance search");
    }
  });

  it("explains that visibility affects being found, not searching", () => {
    expect(
      discoverabilityExplanation({
        hasVisibleQuartetProfile: false,
        hasVisibleSingerProfile: true,
      }),
    ).toBe(
      "You can search either way. These settings only control whether other people can find your profiles.",
    );
    expect(
      discoverabilityExplanation({
        hasVisibleQuartetProfile: false,
        hasVisibleSingerProfile: false,
      }),
    ).toBe(
      "You can still search, but other users will not discover your Singer Profile or Quartet Profile until you turn visibility on.",
    );
  });
});
