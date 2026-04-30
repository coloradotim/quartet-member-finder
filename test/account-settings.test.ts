import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  accountDistanceUnitOptions,
  normalizeAccountDisplayName,
  normalizeAccountDistanceUnit,
} from "@/lib/settings/account-settings";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("account settings", () => {
  it("supports account-level distance unit preferences", () => {
    expect(accountDistanceUnitOptions).toEqual([
      { label: "Kilometers", value: "km" },
      { label: "Miles", value: "mi" },
    ]);
    expect(normalizeAccountDistanceUnit("mi")).toBe("mi");
    expect(normalizeAccountDistanceUnit("yards")).toBe("km");
    expect(normalizeAccountDisplayName("  Tim  ")).toBe("Tim");
    expect(normalizeAccountDisplayName("   ")).toBeNull();
    expect(normalizeAccountDisplayName("a".repeat(140))).toHaveLength(120);
  });

  it("keeps settings distinct from singer profile and Quartet Mode", () => {
    const page = source("app/(protected)/app/settings/page.tsx");

    expect(page).toContain("Account Settings");
    expect(page).toContain("Account identity and defaults");
    expect(page).toContain("Account display name");
    expect(page).toContain("Sign-in email");
    expect(page).toMatch(/My\s+Singer Profile/);
    expect(page).toContain("Public singer name");
    expect(page).toContain("Quartet Mode");
    expect(page).toContain("First-run setup");
    expect(page).toContain("Re-run onboarding");
    expect(page).toContain("not available yet");
  });

  it("stores account settings on account profiles", () => {
    const migration = source(
      "supabase/migrations/20260430200000_account_settings.sql",
    );

    expect(migration).toContain("alter table public.account_profiles");
    expect(migration).toContain("preferred_distance_unit public.distance_unit");
  });
});
