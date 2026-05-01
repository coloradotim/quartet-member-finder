import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  discoverySignInPath,
  pathWithSearch,
} from "@/lib/auth/discovery-sign-in-path";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("authenticated discovery", () => {
  it("preserves intended discovery destinations for sign-in redirects", () => {
    expect(pathWithSearch("/find", { kind: "quartets" })).toBe(
      "/find?kind=quartets",
    );
    expect(
      pathWithSearch("/singers", {
        country: "United Kingdom",
        part: ["TTBB:Lead", "SSAA:Bass"],
      }),
    ).toBe("/singers?country=United+Kingdom&part=TTBB%3ALead&part=SSAA%3ABass");
    expect(discoverySignInPath("/find", { kind: "singers" })).toBe(
      "/sign-in?next=%2Ffind%3Fkind%3Dsingers",
    );
  });

  it("gates every discovery page before reading discovery views", () => {
    const pages = [
      ["app/find/page.tsx", 'requireAuthenticatedDiscovery("/find", params)'],
      [
        "app/singers/page.tsx",
        'requireAuthenticatedDiscovery("/singers", params)',
      ],
      [
        "app/quartets/page.tsx",
        'requireAuthenticatedDiscovery("/quartets", params)',
      ],
    ];

    for (const [path, gate] of pages) {
      const page = source(path);

      expect(page).toContain(gate);
      expect(page.indexOf(gate)).toBeLessThan(page.indexOf(".from("));
      expect(page).toContain("SignedInSiteHeader");
      expect(page).not.toContain("PublicSiteHeader");
    }
  });

  it("keeps signed-out page access limited to home, sign-in, help, and privacy", () => {
    const publicPages = [
      "app/page.tsx",
      "app/sign-in/page.tsx",
      "app/help/page.tsx",
      "app/privacy/page.tsx",
    ];
    const gatedPages = [
      "app/find/page.tsx",
      "app/singers/page.tsx",
      "app/quartets/page.tsx",
      "app/(protected)/app/layout.tsx",
    ];

    for (const path of publicPages) {
      expect(source(path)).not.toContain("requireAuthenticatedDiscovery");
    }

    for (const path of gatedPages) {
      const page = source(path);

      expect(page).toMatch(
        /requireAuthenticatedDiscovery|redirect\("\/sign-in/,
      );
    }
  });

  it("redirects the legacy map route to Find", () => {
    const mapPage = source("app/map/page.tsx");

    expect(mapPage).toContain('redirect("/find")');
    expect(mapPage).not.toContain("requireAuthenticatedDiscovery");
    expect(mapPage).not.toContain(".from(");
  });
});
