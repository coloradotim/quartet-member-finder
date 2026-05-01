import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  destinationForOnboardingChoice,
  isValidOnboardingChoice,
  normalizePostOnboardingPath,
  onboardingChoices,
} from "@/lib/onboarding/app-onboarding";
import {
  displayNameFromUser,
  onboardingIsDone,
} from "@/lib/onboarding/account-onboarding";

const pageSource = readFileSync(
  "app/(protected)/app/onboarding/page.tsx",
  "utf8",
);

describe("first-run onboarding", () => {
  it("uses intent-based onboarding language without permanent modes", () => {
    const text = JSON.stringify(onboardingChoices);

    expect(text).toContain("I'm a singer looking for quartet openings");
    expect(text).toContain("I represent a quartet looking for a singer");
    expect(text).toContain("I'm not sure yet / I just want to get oriented");
    expect(text).toContain("My Singer Profile");
    expect(text).toContain("My Quartet Profile");
    expect(pageSource).toContain("not a permanent role");
    expect(pageSource).toContain("What are you here to do first?");
  });

  it("routes each first action to the expected destination", () => {
    expect(destinationForOnboardingChoice("singer-profile-first")).toBe(
      "/app/profile",
    );
    expect(destinationForOnboardingChoice("quartet-profile-first")).toBe(
      "/app/listings",
    );
    expect(destinationForOnboardingChoice("get-oriented")).toBe("/app");
    expect(destinationForOnboardingChoice("unknown")).toBe("/app");
  });

  it("validates choices and post-onboarding paths", () => {
    expect(onboardingChoices.length).toBe(3);
    expect(isValidOnboardingChoice("quartet-profile-first")).toBe(true);
    expect(isValidOnboardingChoice("skipped")).toBe(false);
    expect(normalizePostOnboardingPath("/app/profile")).toBe("/app/profile");
    expect(normalizePostOnboardingPath("/app/onboarding")).toBe("/app");
    expect(normalizePostOnboardingPath("https://example.com")).toBe("/app");
    expect(normalizePostOnboardingPath("//example.com")).toBe("/app");
  });

  it("normalizes account profile display and done state", () => {
    expect(
      displayNameFromUser({
        email: "lead@example.com",
        id: "user-1",
      }),
    ).toBe("lead");
    expect(displayNameFromUser({ id: "user-1" })).toBe(
      "Quartet Member Finder user",
    );
    expect(
      displayNameFromUser({
        email: `${"a".repeat(140)}@example.com`,
        id: "user-1",
      }),
    ).toHaveLength(120);
    expect(onboardingIsDone(null)).toBe(false);
    expect(
      onboardingIsDone({
        onboarding_completed_at: "2026-04-30T12:00:00.000Z",
        onboarding_skipped_at: null,
      }),
    ).toBe(true);
  });
});
