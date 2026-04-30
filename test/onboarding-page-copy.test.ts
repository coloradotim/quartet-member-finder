import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  "app/(protected)/app/onboarding/page.tsx",
  "utf8",
);
const actionSource = readFileSync(
  "app/(protected)/app/onboarding/actions.ts",
  "utf8",
);

describe("onboarding page flow", () => {
  it("collects basic context before workflow choice", () => {
    expect(pageSource.indexOf("Step 1")).toBeLessThan(
      pageSource.indexOf("Step 2"),
    );
    expect(pageSource).toContain("Display name");
    expect(pageSource).toContain("Country");
    expect(pageSource).toContain("ZIP/postal code");
    expect(pageSource).not.toContain("Country code");
    expect(pageSource).toContain("Save and continue");
  });

  it("saves a hidden starter singer profile instead of publishing onboarding context", () => {
    expect(actionSource).toContain('.from("singer_profiles")');
    expect(actionSource).toContain("is_visible: false");
    expect(actionSource).toContain("postal_code_private");
    expect(actionSource).toContain("Display%20name%20is%20required");
  });
});
