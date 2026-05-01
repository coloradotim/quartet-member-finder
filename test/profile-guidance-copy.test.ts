import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const profilePage = readFileSync(
  "app/(protected)/app/profile/page.tsx",
  "utf8",
);
const publicPages = readFileSync("lib/content/public-pages.ts", "utf8");

describe("profile form guidance copy", () => {
  it("marks required and optional profile fields clearly", () => {
    expect(profilePage).toContain("Only display name is required.");
    expect(publicPages).toContain("Only display name is required");
    expect(profilePage).toContain("Display name");
    expect(profilePage).toContain("Required");
    expect(profilePage).toContain("Optional");
  });

  it("explains experience, availability, travel, and visibility in plain language", () => {
    expect(profilePage).toContain("new to barbershop");
    expect(profilePage).toContain("experienced chapter singer");
    expect(profilePage).toContain("weeknights or weekends");
    expect(profilePage).toContain("how far you would travel");
    expect(profilePage).toContain("Travel willingness in miles");
    expect(profilePage).toContain("Your Singer Profile is not shown in Find");
    expect(profilePage).toContain("Show this profile in Find");
  });

  it("uses simple location fields without exposing country code input", () => {
    expect(profilePage).toContain("ZIP/postal code");
    expect(profilePage).toContain("not shown publicly");
    expect(profilePage).not.toContain("Country code");
  });
});
