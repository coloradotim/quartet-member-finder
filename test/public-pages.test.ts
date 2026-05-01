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
    expect(helpText).toContain("Quartet Profiles");
    expect(helpText).toContain("One account can support My Singer Profile");
    expect(helpText).toContain("independent visibility controls");
    expect(helpText).toContain("Search");
    expect(helpText).toContain("Find is the main discovery page");
    expect(helpText).toContain("result cards");
    expect(helpText).toContain("Location And Privacy");
    expect(helpText).toContain("Location Defaults");
    expect(helpText).toContain("Contact");
    expect(helpText).toContain("read and reply in Messages");
    expect(helpText).toContain("private report action");
    expect(helpText).toContain("Signed-in users can send private feedback");
    expect(helpText).toContain("does not replace personal judgment");
    expect(helpText).not.toMatch(/24\/7 moderation|background checks/i);
  });

  it("keeps privacy overview plainspoken and aligned with app behavior", () => {
    const privacyText = pageText(publicPrivacySections);

    expect(privacyText).toContain("Approximate Location");
    expect(privacyText).toContain("Public search results should not show");
    expect(privacyText).toContain("independent visibility controls");
    expect(privacyText).toContain("Both optional profiles can be discoverable");
    expect(privacyText).toContain("email addresses or phone numbers");
    expect(privacyText).toContain("visible only to the sender and recipient");
    expect(privacyText).toContain("authorized project administrators");
    expect(privacyText).toContain("global");
    expect(privacyText).toContain("not a formal legal privacy policy");
  });
});
