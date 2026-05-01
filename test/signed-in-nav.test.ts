import { describe, expect, it } from "vitest";
import { signedInNavigationLinks } from "@/lib/navigation/signed-in-nav";

describe("signed-in navigation", () => {
  it("keeps stable signed-in tasks without a mode switch", () => {
    expect(signedInNavigationLinks.map((link) => link.label)).toEqual([
      "My Singer Profile",
      "My Quartet Profile",
      "Find",
      "Help",
    ]);
  });

  it("uses shared discovery instead of top-level detailed search routes", () => {
    expect(signedInNavigationLinks).toEqual([
      { href: "/app/profile", label: "My Singer Profile" },
      { href: "/app/listings", label: "My Quartet Profile" },
      { href: "/find", label: "Find" },
      { href: "/help", label: "Help" },
    ]);
    expect(signedInNavigationLinks.map((link) => link.href)).not.toContain(
      "/singers",
    );
    expect(signedInNavigationLinks.map((link) => link.href)).not.toContain(
      "/quartets",
    );
    expect(signedInNavigationLinks.map((link) => link.href)).not.toContain(
      "/map",
    );
  });
});
