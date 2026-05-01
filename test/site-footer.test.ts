import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { siteFooterLinks } from "@/lib/navigation/site-navigation";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("site footer", () => {
  it("uses the compact copyright and resource-link pattern", () => {
    const footer = source("components/navigation/site-footer.tsx");

    expect(footer).toContain("© 2026 Quartet Member Finder");
    expect(footer).not.toContain(
      "Quartet Member Finder helps singers and quartets connect with privacy",
    );
    expect(siteFooterLinks.map((link) => link.label)).toEqual([
      "Help",
      "Privacy",
      "GitHub",
    ]);
  });
});
