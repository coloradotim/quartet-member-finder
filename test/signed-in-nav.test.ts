import { describe, expect, it } from "vitest";
import { signedInNavigationLinks } from "@/lib/navigation/signed-in-nav";

describe("signed-in navigation", () => {
  it("foregrounds singer-first tasks before quartet mode", () => {
    expect(signedInNavigationLinks.map((link) => link.label)).toEqual([
      "Home",
      "My Singer Profile",
      "Find Quartet Openings",
      "Find Singers",
      "Map",
      "Quartet Mode",
      "Help",
      "Privacy",
    ]);
  });

  it("keeps existing route targets for the reorganized labels", () => {
    expect(signedInNavigationLinks).toEqual([
      { href: "/app", label: "Home" },
      { href: "/app/profile", label: "My Singer Profile" },
      { href: "/quartets", label: "Find Quartet Openings" },
      { href: "/singers", label: "Find Singers" },
      { href: "/map", label: "Map" },
      { href: "/app/listings", label: "Quartet Mode" },
      { href: "/help", label: "Help" },
      { href: "/privacy", label: "Privacy" },
    ]);
  });
});
