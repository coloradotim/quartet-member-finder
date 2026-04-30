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
  it("uses the requested Singer and Quartet Mode language", () => {
    const text = JSON.stringify(onboardingChoices);

    expect(text).toContain("I'm a singer looking for quartet openings");
    expect(text).toContain("I'm a singer looking for other singers");
    expect(text).toContain("I represent a quartet looking for a singer");
    expect(text).toContain("I just want to browse for now");
    expect(pageSource).toContain("not a permanent role");
  });

  it("routes each first action to the expected destination", () => {
    expect(destinationForOnboardingChoice("find-quartet-openings")).toBe(
      "/find?kind=quartets",
    );
    expect(destinationForOnboardingChoice("quartet-mode-listing")).toBe(
      "/app/listings",
    );
    expect(destinationForOnboardingChoice("browse-for-now")).toBe("/find");
    expect(destinationForOnboardingChoice("unknown")).toBe("/app");
  });

  it("validates choices and post-onboarding paths", () => {
    expect(onboardingChoices.length).toBe(4);
    expect(isValidOnboardingChoice("find-singers-as-singer")).toBe(true);
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
