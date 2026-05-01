import { describe, expect, it } from "vitest";
import {
  signedInModeNavigationLinks,
  signedInNavigationLinks,
  signedInPrimaryNavigationLinks,
  signedInUtilityNavigationLinks,
} from "@/lib/navigation/signed-in-nav";

describe("signed-in navigation", () => {
  it("keeps stable signed-in tasks without a mode switch", () => {
    expect(signedInPrimaryNavigationLinks.map((link) => link.label)).toEqual([
      "My Singer Profile",
      "My Quartet Profile",
      "Find",
      "Help",
    ]);
    expect(signedInModeNavigationLinks).toEqual([]);
    expect(signedInUtilityNavigationLinks).toEqual([]);
  });

  it("keeps existing route targets for the reorganized labels", () => {
    expect(signedInNavigationLinks).toEqual([
      { href: "/app/profile", label: "My Singer Profile" },
      { href: "/app/listings", label: "My Quartet Profile" },
      { href: "/find", label: "Find" },
      { href: "/help", label: "Help" },
    ]);
  });
});
