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
    expect(homePage).toContain("Public discovery is open before you sign in.");
    expect(homePage).toContain("approximate locations");
    expect(homePage).toContain("first contact happens");
  });

  it("frames quartet discovery as openings for missing parts", () => {
    const quartetPage = source("app/quartets/page.tsx");

    expect(quartetPage).toContain("Find Quartet Openings");
    expect(quartetPage).toContain("groups looking for one or more");
    expect(quartetPage).toContain("No visible quartet openings");
    expect(quartetPage).not.toContain("Find quartets");
  });

  it("frames singer discovery as available singer profiles", () => {
    const singerPage = source("app/singers/page.tsx");

    expect(singerPage).toContain("Find Singers");
    expect(singerPage).toContain("singers who may be open");
    expect(singerPage).not.toContain("Find singers");
  });
});
