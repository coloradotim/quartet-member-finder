import { describe, expect, it } from "vitest";
import {
  signedInModeNavigationLinks,
  signedInNavigationLinks,
  signedInPrimaryNavigationLinks,
  signedInUtilityNavigationLinks,
} from "@/lib/navigation/signed-in-nav";

describe("signed-in navigation", () => {
  it("groups singer-first tasks apart from quartet mode and utility actions", () => {
    expect(signedInPrimaryNavigationLinks.map((link) => link.label)).toEqual([
      "My Singer Profile",
      "Find",
    ]);
    expect(signedInModeNavigationLinks).toEqual([
      { href: "/app/listings", label: "Quartet Mode" },
    ]);
    expect(signedInUtilityNavigationLinks).toEqual([
      { href: "/app/settings", label: "Account Settings" },
    ]);
  });

  it("keeps existing route targets for the reorganized labels", () => {
    expect(signedInNavigationLinks).toEqual([
      { href: "/app/profile", label: "My Singer Profile" },
      { href: "/find", label: "Find" },
      { href: "/app/listings", label: "Quartet Mode" },
      { href: "/app/settings", label: "Account Settings" },
    ]);
  });
});
