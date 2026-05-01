import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const profilePage = readFileSync(
  "app/(protected)/app/profile/page.tsx",
  "utf8",
);
const listingPage = readFileSync(
  "app/(protected)/app/listings/page.tsx",
  "utf8",
);
const onboardingPage = readFileSync(
  "app/(protected)/app/onboarding/page.tsx",
  "utf8",
);
const findPage = readFileSync("app/find/page.tsx", "utf8");

describe("location and distance form copy", () => {
  it("uses simple country, region, city, and ZIP/postal code fields", () => {
    for (const source of [profilePage, listingPage]) {
      expect(source).toContain("Country");
      expect(source).toContain("locationLabels.region");
      expect(source).toContain("locationLabels.locality");
      expect(source).toContain("locationLabels.postalCode");
      expect(source).toContain('name="region"');
      expect(source).toContain('name="locality"');
      expect(source).toContain('name="postalCodePrivate"');
      expect(source).not.toContain("Country code");
    }
    expect(onboardingPage).toContain("Country");
    expect(onboardingPage).toContain("City");
    expect(onboardingPage).toContain("ZIP/postal code");
    expect(onboardingPage).not.toContain("Country code");
  });

  it("keeps ZIP/postal code private and approximate", () => {
    expect(profilePage).toContain("not shown publicly");
    expect(listingPage).toContain("not shown publicly");
    expect(onboardingPage).toContain("not shown publicly");
    expect(profilePage).toContain("approximate area");
    expect(listingPage).toContain("approximate area");
    expect(profilePage).toContain("No street address is required");
    expect(listingPage).toContain("No street");
  });

  it("warns when discoverable profiles have incomplete location fields", () => {
    const profileAction = readFileSync(
      "app/(protected)/app/profile/actions.ts",
      "utf8",
    );
    const listingAction = readFileSync(
      "app/(protected)/app/listings/actions.ts",
      "utf8",
    );

    expect(profileAction).toContain("discoverabilityLocationWarning");
    expect(listingAction).toContain("discoverabilityLocationWarning");
    expect(profileAction).toContain("Singer profile saved.");
    expect(listingAction).toContain("Quartet listing saved.");
  });

  it("puts the miles/kilometers picker only on Find", () => {
    expect(findPage).toContain("Distance units");
    expect(findPage).toContain("Miles");
    expect(profilePage).not.toContain("Distance units");
    expect(listingPage).not.toContain("Distance units");
    expect(onboardingPage).not.toContain("Distance units");
  });
});
