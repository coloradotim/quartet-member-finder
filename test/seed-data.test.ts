import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const seedSql = readFileSync("supabase/seed.sql", "utf8");
const seedDocs = readFileSync("docs/seed-data.md", "utf8");

describe("Supabase seed data", () => {
  it("is clearly documented as fake and non-production data", () => {
    expect(seedSql).toContain("Do not run this against production data.");
    expect(seedSql).toContain("@example.invalid");
    expect(seedDocs).toContain("Do not run the seed file against production.");
  });

  it("covers all barbershop parts across demo singers and quartet openings", () => {
    for (const part of ["tenor", "lead", "baritone", "bass"]) {
      expect(seedSql).toContain(`'${part}'`);
    }

    expect(seedSql).toContain("'covered'");
    expect(seedSql).toContain("'needed'");
  });

  it("includes visible and hidden examples across US and non-US locations", () => {
    for (const countryCode of ["US", "CA", "GB", "IE", "AU", "NZ"]) {
      expect(seedSql).toContain(`'${countryCode}'`);
    }

    expect(seedSql).toContain("'Fort Collins, CO area'");
    expect(seedSql).toContain("'Manchester, UK area'");
    expect(seedSql).toContain("'Dublin, Ireland area'");
    expect(seedSql).toContain("true,\n    true,");
    expect(seedSql).toContain("false,\n    true,");
  });

  it("exercises mixed distance preferences and contact relay targets", () => {
    expect(seedSql).toContain("'mi'");
    expect(seedSql).toContain("'km'");
    expect(seedSql).toContain("singer_profile_id");
    expect(seedSql).toContain("quartet_listing_id");
    expect(seedSql).toContain("Demo contact request for a visible singer");
    expect(seedSql).toContain("Demo contact request for a visible quartet");
  });
});
