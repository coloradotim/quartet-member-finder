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
  it("uses simple country, city, and ZIP/postal code fields", () => {
    for (const source of [profilePage, listingPage, onboardingPage]) {
      expect(source).toContain("Country");
      expect(source).toContain("City");
      expect(source).toContain("ZIP/postal code");
      expect(source).not.toContain("Country code");
      expect(source).not.toContain("Region/admin");
    }
  });

  it("keeps ZIP/postal code private and approximate", () => {
    expect(profilePage).toContain("not shown publicly");
    expect(listingPage).toContain("not shown publicly");
    expect(onboardingPage).toContain("not shown publicly");
    expect(profilePage).toContain("approximate area");
    expect(listingPage).toContain("approximate area");
  });

  it("puts the miles/kilometers picker only on Find", () => {
    expect(findPage).toContain("Distance units");
    expect(findPage).toContain("Miles");
    expect(profilePage).not.toContain("Distance units");
    expect(listingPage).not.toContain("Distance units");
    expect(onboardingPage).not.toContain("Distance units");
  });
});
