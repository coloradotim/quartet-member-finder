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
  "contact_request_replies",
  "message_reports",
  "user_moderation_status",
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

function functionReturnDefinition(functionName: string) {
  const pattern = new RegExp(
    `create or replace function public\\.${functionName}[\\s\\S]*?returns table \\(([\\s\\S]*?)\\)\\nlanguage`,
    "i",
  );

  const match = migration.match(pattern);

  if (!match) {
    throw new Error(`Missing ${functionName} return definition`);
  }

  return match[1];
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
    expect(migration).toContain("'singer-profile-first'");
    expect(migration).toContain("'quartet-profile-first'");
    expect(migration).toContain("'get-oriented'");
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

  it("adds authenticated radius search without returning exact coordinates", () => {
    expect(migration).toContain(
      "create or replace function public.distance_between_coordinates_km",
    );
    expect(migration).toContain(
      "create or replace function public.search_singer_discovery_profiles",
    );
    expect(migration).toContain(
      "create or replace function public.search_quartet_discovery_listings",
    );
    expect(migration).toContain(
      "grant execute on function public.search_singer_discovery_profiles",
    );
    expect(migration).toContain(
      "grant execute on function public.search_quartet_discovery_listings",
    );
    expect(
      functionReturnDefinition("search_singer_discovery_profiles"),
    ).toContain("distance_km double precision");
    expect(
      functionReturnDefinition("search_quartet_discovery_listings"),
    ).toContain("distance_km double precision");
    expect(migration).toContain("latitude_private is not null");
    expect(
      functionReturnDefinition("search_singer_discovery_profiles"),
    ).not.toMatch(/latitude_private|longitude_private/i);
    expect(
      functionReturnDefinition("search_quartet_discovery_listings"),
    ).not.toMatch(/latitude_private|longitude_private/i);
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

  it("adds participant-only replies for app-mediated messages", () => {
    expect(migration).toContain("create table public.contact_request_replies");
    expect(migration).toContain("contact_request_replies_mark_responded");
    expect(migration).toContain(
      'create policy "Contact participants can read replies"',
    );
    expect(migration).toContain(
      'create policy "Contact participants can create replies"',
    );
    expect(migration).toContain(
      "grant select, insert on table public.contact_request_replies",
    );
    expect(migration).toContain("recipient_read_at");
    expect(migration).toContain("sender_read_at");
  });

  it("adds private message reports and account moderation status", () => {
    expect(migration).toContain("create table public.message_reports");
    expect(migration).toContain("create table public.user_moderation_status");
    expect(migration).toContain("set_message_report_reported_user");
    expect(migration).toContain(
      'create policy "Message participants can create private reports"',
    );
    expect(migration).toContain(
      'create policy "Users can read their own moderation status"',
    );
    expect(migration).toContain("grant insert on table public.message_reports");
    expect(migration).toContain(
      "grant select on table public.user_moderation_status",
    );
    expect(migration).toContain("'message_blocked'");
    expect(migration).toContain("'permanently_blocked'");
  });
});
