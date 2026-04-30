import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("public discovery copy", () => {
  it("makes the singer-first path obvious on the public home page", () => {
    const homePage = source("app/page.tsx");

    expect(homePage).toContain("Find Quartet Openings");
    expect(homePage).toContain("Find Singers");
    expect(homePage).toContain("My Singer Profile");
    expect(homePage).toContain("Quartet Mode");
    expect(homePage).toContain("Start as a singer");
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
