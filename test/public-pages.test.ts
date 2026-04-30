import { describe, expect, it } from "vitest";
import {
  publicHelpSections,
  publicPrivacySections,
} from "@/lib/content/public-pages";

function pageText(sections: Array<{ body: string[]; heading: string }>) {
  return sections
    .flatMap((section) => [section.heading, ...section.body])
    .join("\n");
}

describe("public help and privacy content", () => {
  it("covers practical help topics without overpromising moderation", () => {
    const helpText = pageText(publicHelpSections);

    expect(helpText).toContain("Singer Profiles");
    expect(helpText).toContain("Quartet Listings");
    expect(helpText).toContain("Search");
    expect(helpText).toContain("Find is the main discovery page");
    expect(helpText).toContain("results table");
    expect(helpText).toContain("Location And Privacy");
    expect(helpText).toContain("Account Settings Vs Singer Profile");
    expect(helpText).toContain("Contact");
    expect(helpText).toContain("Signed-in users can send private feedback");
    expect(helpText).toContain("does not replace personal judgment");
    expect(helpText).not.toMatch(/24\/7 moderation|background checks/i);
  });

  it("keeps privacy overview plainspoken and aligned with app behavior", () => {
    const privacyText = pageText(publicPrivacySections);

    expect(privacyText).toContain("Approximate Location");
    expect(privacyText).toContain("Public search results should not show");
    expect(privacyText).toContain("email addresses or phone numbers");
    expect(privacyText).toContain("global");
    expect(privacyText).toContain("not a formal legal privacy policy");
  });
});
