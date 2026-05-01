import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("public discovery copy", () => {
  it("makes the first-time path obvious on the public home page", () => {
    const homePage = source("app/page.tsx");

    expect(homePage).toContain("Sign in to get started");
    expect(homePage).toContain("First time here? Read Help");
    expect(homePage).toContain("Who it helps");
    expect(homePage).toContain("Singers looking for quartet openings");
    expect(homePage).toContain("Two optional profiles");
    expect(homePage).toContain("Use either profile, or both.");
    expect(homePage).toContain("My Singer Profile");
    expect(homePage).toContain("My Quartet Profile");
    expect(homePage).not.toContain(
      "Public discovery is open before you sign in.",
    );
    expect(homePage).not.toContain(
      "look around before you decide what to share",
    );
    expect(homePage).toContain("approximate locations");
    expect(homePage).toContain("first contact happens");
  });

  it("frames quartet discovery as openings for missing parts", () => {
    const quartetPage = source("app/quartets/page.tsx");

    expect(quartetPage).toContain("Find quartet openings");
    expect(quartetPage).toContain("singer looking for groups");
    expect(quartetPage).toContain("No visible quartet openings");
    expect(quartetPage).not.toContain("Find quartets");
  });

  it("frames singer discovery as available singer profiles", () => {
    const singerPage = source("app/singers/page.tsx");

    expect(singerPage).toContain("Find singers");
    expect(singerPage).toContain("representing a quartet");
    expect(singerPage).toContain("looking for other singers nearby");
  });

  it("consolidates discovery around filters, map, and table", () => {
    const findPage = source("app/find/page.tsx");

    expect(findPage).toContain("Search singers and quartet openings");
    expect(findPage).toContain("Filter discovery results");
    expect(findPage).toContain("Privacy-safe discovery map");
    expect(findPage).toContain("Results table");
    expect(findPage).toContain("Detailed quartet search");
    expect(findPage).toContain("Detailed singer search");
  });
});
