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

function helpText() {
  return publicHelpSections
    .flatMap((section) => [
      section.eyebrow,
      section.title,
      section.intro,
      ...section.topics.flatMap((topic) => [
        topic.title,
        ...topic.body,
        ...(topic.bullets ?? []),
      ]),
    ])
    .join("\n");
}

describe("public help and privacy content", () => {
  it("covers practical help topics without overpromising moderation", () => {
    const text = helpText();

    expect(publicHelpSections.map((section) => section.id)).toEqual([
      "getting-started",
      "optional-profiles",
      "singer-profile",
      "quartet-profile",
      "find",
      "location",
      "messages",
      "privacy-safety",
      "reporting",
      "faq",
      "feedback-guide",
    ]);
    expect(text).toContain("One Account, Two Optional Profiles");
    expect(text).toContain("My Singer Profile");
    expect(text).toContain("My Quartet Profile");
    expect(text).toContain("Find Quartet Openings And Find Singers");
    expect(text).toContain("Location, Radius Search, And Approximate Maps");
    expect(text).toContain("Messages And Contacting Someone");
    expect(text).toContain("Reporting Bad Behavior");
    expect(text).toContain("Why can't I find any results?");
    expect(text).toContain("Miles are the default display unit");
    expect(text).toContain("read it. The full message stays behind");
    expect(text).toContain("Report this message");
    expect(text).not.toMatch(/24\/7 moderation|provides background checks/i);
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
