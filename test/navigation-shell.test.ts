import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("shared navigation shells", () => {
  it("uses one shared signed-in header for protected app pages", () => {
    const protectedLayout = source("app/(protected)/app/layout.tsx");
    const signedInHeader = source(
      "components/navigation/signed-in-site-header.tsx",
    );

    expect(protectedLayout).toContain("<SignedInSiteHeader />");
    expect(signedInHeader).toContain("signedInNavigationLinks.map");
    expect(signedInHeader).toContain("Sign out");
  });

  it("keeps normal protected pages out of navigation ownership", () => {
    const protectedPages = [
      "app/(protected)/app/page.tsx",
      "app/(protected)/app/profile/page.tsx",
      "app/(protected)/app/listings/page.tsx",
      "app/(protected)/app/onboarding/page.tsx",
    ];

    for (const page of protectedPages) {
      const pageSource = source(page);

      expect(pageSource).not.toContain("App navigation");
      expect(pageSource).not.toContain("signedInNavigationLinks");
      expect(pageSource).not.toContain("Sign out");
    }
  });

  it("keeps signed-out navigation public-support only", () => {
    const publicHeader = source("components/navigation/public-site-header.tsx");
    const publicNavigation = source("lib/navigation/site-navigation.ts");

    expect(publicHeader).toContain("publicNavigationLinks.map");
    expect(publicNavigation).toContain('href: "/help"');
    expect(publicNavigation).toContain('href: "/privacy"');
    expect(publicNavigation).toContain('href: "/sign-in"');
    expect(publicNavigation).not.toContain('href: "/find"');
    expect(publicNavigation).not.toContain('href: "/map"');
    expect(publicNavigation).not.toContain('href: "/singers"');
    expect(publicNavigation).not.toContain('href: "/quartets"');
  });
});
