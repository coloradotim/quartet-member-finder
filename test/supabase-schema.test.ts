import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readdirSync("supabase/migrations")
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort()
  .map((fileName) => readFileSync(`supabase/migrations/${fileName}`, "utf8"))
  .join("\n\n");

const appTables = [
  "account_profiles",
  "singer_profiles",
  "singer_profile_parts",
  "quartet_listings",
  "quartet_listing_parts",
  "contact_requests",
  "feedback_submissions",
];

function viewDefinition(viewName: string) {
  const pattern = new RegExp(
    `create view public\\.${viewName}[\\s\\S]*?;\\n\\n`,
    "i",
  );

  const match = migration.match(pattern);

  if (!match) {
    throw new Error(`Missing ${viewName} view`);
  }

  return match[0];
}

describe("initial Supabase schema migration", () => {
  it("enables row level security on every app table", () => {
    for (const table of appTables) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security;`,
      );
    }
  });

  it("does not grant anonymous access to private base tables", () => {
    for (const table of appTables) {
      expect(migration).not.toMatch(
        new RegExp(`grant\\s+.*on table public\\.${table}\\s+to anon`, "i"),
      );
    }
  });

  it("stores first-run onboarding state on private account profiles", () => {
    expect(migration).toContain("add column onboarding_completed_at");
    expect(migration).toContain("add column onboarding_skipped_at");
    expect(migration).toContain("add column onboarding_last_choice");
    expect(migration).toContain("'find-quartet-openings'");
    expect(migration).toContain("'quartet-mode-listing'");
  });

  it("keeps private fields out of discovery views", () => {
    const privateFieldPattern =
      /user_id|owner_user_id|recipient_user_id|postal_code_private|formatted_address_private|latitude_private|longitude_private/i;

    expect(viewDefinition("singer_discovery_profiles")).not.toMatch(
      privateFieldPattern,
    );
    expect(viewDefinition("quartet_discovery_listings")).not.toMatch(
      privateFieldPattern,
    );
  });

  it("stores and exposes parts with explicit voicing context", () => {
    expect(migration).toContain(
      "add column voicing text not null default 'TTBB'",
    );
    expect(migration).toContain(
      "add constraint singer_profile_parts_voicing_part_check",
    );
    expect(migration).toContain(
      "add constraint quartet_listing_parts_voicing_part_check",
    );
    expect(migration).toContain(
      "singer_profile_parts.voicing || ':' || singer_profile_parts.part",
    );
    expect(migration).toContain(
      "quartet_listing_parts.voicing || ':' || quartet_listing_parts.part",
    );
  });
});
