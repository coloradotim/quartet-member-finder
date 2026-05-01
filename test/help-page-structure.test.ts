import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("help page structure", () => {
  it("renders a guide with anchor navigation and nested topics", () => {
    const helpPage = source("app/help/page.tsx");
    const helpContent = source("lib/content/public-pages.ts");

    expect(helpPage).toContain('aria-label="On this page"');
    expect(helpPage).toContain("publicHelpSections.map");
    expect(helpPage).toContain("section.topics.map");
    expect(helpPage).toContain("topic.bullets");
    expect(helpPage).toContain("HelpFeedbackForm");
    expect(helpContent).toContain("type HelpGuideSection");
    expect(helpContent).toContain("Troubleshooting And FAQ");
    expect(helpContent).toContain("Reporting Bad Behavior");
  });
});
