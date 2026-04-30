import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260430023000_initial_schema_and_rls.sql",
  "utf8",
);

const appTables = [
  "account_profiles",
  "singer_profiles",
  "singer_profile_parts",
  "quartet_listings",
  "quartet_listing_parts",
  "contact_requests",
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
});
