import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const seedSql = readFileSync("supabase/prod-demo-seed.sql", "utf8");
const loader = readFileSync("scripts/supabase/load-prod-demo-data.mjs", "utf8");
const docs = readFileSync("docs/seed-data.md", "utf8");

describe("Production demo seed data", () => {
  it("uses a strict fake identity convention and batch marker", () => {
    expect(seedSql).toContain("QMF_PROD_DEMO_20260501");
    expect(seedSql).toContain("qmf-demo+");
    expect(seedSql).toContain("@example.invalid");
    expect(seedSql).toContain("QMF Demo");
    expect(seedSql).not.toContain("@gmail.com");
    expect(seedSql).not.toContain("@example.com");
  });

  it("is guarded by an explicit confirmation value before loading", () => {
    expect(loader).toContain("QMF_PROD_DEMO_CONFIRM");
    expect(loader).toContain("QMF_PROD_DEMO_20260501");
    expect(loader).toContain("--linked");
    expect(loader).toContain("prod-demo-seed.sql");
  });

  it("only deletes rows inside the demo email/id/message scope", () => {
    expect(seedSql).toContain("email like 'qmf-demo+%@example.invalid'");
    expect(seedSql).toContain("message_body like 'QMF_PROD_DEMO_20260501:%'");
    expect(seedSql).toContain("'72000000-0000-4000-8000-000000000001'");
    expect(seedSql).not.toContain("delete from auth.users;");
    expect(seedSql).not.toContain("truncate");
  });

  it("contains broad manual-QA coverage for discovery, maps, and relay", () => {
    const demoEmails = seedSql.match(/qmf-demo\+[^']+@example\.invalid/g) ?? [];

    expect(new Set(demoEmails).size).toBeGreaterThanOrEqual(18);

    for (const countryCode of [
      "US",
      "CA",
      "GB",
      "IE",
      "AU",
      "NZ",
      "DE",
      "SE",
    ]) {
      expect(seedSql).toContain(`'${countryCode}'`);
    }

    for (const voicing of ["TTBB", "SATB", "SSAA"]) {
      expect(seedSql).toContain(`'${voicing}'`);
    }

    expect(seedSql).toContain("'covered'");
    expect(seedSql).toContain("'needed'");
    expect(seedSql).toContain("latitude_private");
    expect(seedSql).toContain("longitude_private");
    expect(seedSql).toContain("singer_profile_id");
    expect(seedSql).toContain("quartet_listing_id");
    expect(seedSql).toContain("false, true");
  });

  it("documents loading, verification, and cleanup for issue 73", () => {
    expect(docs).toContain("QMF_PROD_DEMO_20260501");
    expect(docs).toContain("npm run seed:prod-demo");
    expect(docs).toContain("Verification");
    expect(docs).toContain("#73");
    expect(docs).toContain("qmf-demo+%@example.invalid");
  });
});
