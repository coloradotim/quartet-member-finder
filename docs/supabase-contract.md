# Supabase Contract

This document describes the intended application/database contract for Quartet Member Finder.

The schema will evolve through committed Supabase migrations. Do not make production schema or Row Level Security changes only in the Supabase dashboard.

## Initial data areas

The initial schema is defined in
`supabase/migrations/20260430023000_initial_schema_and_rls.sql`.

It includes these data areas:

- `account_profiles`: authenticated-user display metadata.
- `singer_profiles`: one singer profile per authenticated owner.
- `singer_profile_parts`: one or more barbershop parts for a singer.
- `quartet_listings`: incomplete quartet listings owned by one authenticated user.
- `quartet_listing_parts`: parts currently covered or needed by a quartet.
- `contact_requests`: app-mediated first-contact messages.
- `feedback_submissions`: private authenticated-user feedback from the help page.
- `singer_discovery_profiles`: privacy-safe singer discovery view.
- `quartet_discovery_listings`: privacy-safe quartet discovery view.

The schema also defines enums for barbershop parts, distance units, location
precision, quartet part status, and contact request status.

## Part model

Barbershop parts are represented as:

- `tenor`
- `lead`
- `baritone`
- `bass`

Display code may title-case those values, but the database intentionally uses
stable lowercase enum values. SSAA barbershop listings still use Tenor, Lead,
Baritone, and Bass unless the product explicitly adds alternate naming later.

## Ownership model

An `account_profiles` row belongs to one authenticated user by `user_id`.
It also stores first-run onboarding completion/skipped state so new users can be
guided to a first action after sign-in without choosing a permanent role.

A `singer_profiles` row belongs to one authenticated user by `user_id`. The
initial schema enforces one singer profile per user.

Singer profile edits are saved through the protected app route at
`/app/profile`. The server action writes `user_id = auth.uid()` and relies on
RLS to reject writes for any other owner.

A `quartet_listings` row belongs to the authenticated user identified by
`owner_user_id`. Multi-owner quartet management is not part of the initial
schema.

Quartet listing edits are saved through the protected app route at
`/app/listings`. The server action writes `owner_user_id = auth.uid()` and
filters updates by both listing ID and owner ID, with RLS enforcing the same
ownership boundary in the database.

Users can read and update their own private base-table rows.

Public discovery should use the discovery views, not the base tables.

First-run onboarding writes these `account_profiles` fields:

- `onboarding_completed_at`
- `onboarding_skipped_at`
- `onboarding_last_choice`

The server creates the account profile row after sign-in when needed. If neither
completion nor skipped state is present, sign-in routes the user through
`/app/onboarding` before continuing to the requested app destination.

The public discovery routes are:

- `/singers`, backed by `singer_discovery_profiles`
- `/quartets`, backed by `quartet_discovery_listings`
- `/map`, backed by both discovery views

These routes may filter on public location fields, part, goals,
experience/commitment, availability, and travel willingness. They should not
read private base-table location or contact fields.

## Row Level Security expectations

RLS should enforce:

- users can create their own singer profile
- users can update/delete only their own singer profile
- users can create quartet listings they own
- users can update/delete only quartet listings they own
- public discovery reads return only active/visible listings and profiles
- private fields are not exposed in public discovery views
- contact requests require an authenticated sender
- recipients can read contact requests addressed to them or to listings they own
- feedback submissions require an authenticated submitter and are not readable by
  other regular users

Do not rely only on client-side filtering for visibility, privacy, or ownership checks.

The initial migration enables RLS on every app table. Base tables are granted to
the `authenticated` role and use owner/participant policies. The `anon` role is
not granted direct access to base tables.

Public discovery is exposed through:

- `singer_discovery_profiles`
- `quartet_discovery_listings`

Those views filter to `is_visible = true` and `is_active = true` and include
only privacy-safe columns. They intentionally omit:

- `user_id` and `owner_user_id`
- private postal codes
- formatted private addresses
- exact latitude and longitude
- contact request details
- recipient user IDs

Contact request inserts are authenticated-only. A trigger resolves the recipient
from the visible target singer profile or quartet listing, overwriting
client-provided recipient values and rejecting unavailable or self-contact
targets.

The contact relay server action should insert `contact_requests` with the
authenticated sender ID and either `singer_profile_id` or `quartet_listing_id`.
It should not accept recipient email or recipient user IDs from the browser.
After the insert, server-only service-role access may read the resolved
`recipient_user_id` and look up the recipient auth email for a Resend
notification. Successful notification delivery may update the request status to
`delivered`; requests remain auditable even if email configuration is missing.

Help-page feedback inserts are authenticated-only. The server action writes
`feedback_submissions` with the authenticated user ID and, when available, the
signed-in auth email from the server session. Browser submissions may provide
only the feedback type, message, and current route/context. They must not provide
the submitter user ID, submitter email, status, or other ownership fields.

The feedback table is private. Anonymous users have no direct table grants.
Authenticated users may insert their own feedback and read only their own
feedback rows so the server action can apply a basic sender-side rate limit.
Service-role/admin access is required for cross-user review, triage, or export.

## Location data expectations

The database may store coordinates or geocoded data needed for search, but
public queries should expose only approximate location information.

The schema should be globally tolerant. Do not require US-only fields such as state or ZIP code. Prefer fields that can support international location data, such as:

- country code or country name
- region/admin area when available
- locality/city when available
- postal code when available
- formatted approximate location label
- private geocoded latitude/longitude for search, if needed
- preferred distance unit or display convention, if needed

Current pattern:

- Store private normalized location fields in base tables.
- Expose privacy-safe search fields through views or controlled RPC functions.
- Return approximate distance/region rather than exact coordinates for public discovery.
- Support both miles and kilometers in UI/helper logic where practical.

Application location helpers should treat base-table coordinates and private
postal/address fields as internal matching data. The reusable public
transformation returns only `location_label_public`, `locality`, `region`, and
`country_name` equivalents for display. Public distance strings are rounded and
formatted in both kilometers and miles, ordered by the user/listing preferred
distance unit where that field is available.

Both singer profiles and quartet listings support these globally tolerant
location fields:

- `country_code`
- `country_name`
- `region`
- `locality`
- `postal_code_private`
- `formatted_address_private`
- `location_label_public`
- `location_precision`
- `latitude_private`
- `longitude_private`
- `preferred_distance_unit`

The public discovery views expose country, region, locality, public location
label, and preferred distance unit. They do not expose private postal codes,
formatted addresses, or exact coordinates.

The public map route must continue to use those discovery views rather than base
tables. Map markers are built from public location summaries and country/region
anchors; no latitude/longitude columns should be selected for browser display.

## Contact data expectations

Email addresses and phone numbers should not appear in public search results by default.

The MVP contact flow should use app-mediated contact with Resend notifications.

`contact_requests` supports basic auditability:

- sender user
- resolved recipient user
- singer profile or quartet listing target
- message body
- status
- created and updated timestamps

The app applies a basic sender-side rate limit before insert: five contact
requests per authenticated sender per hour. Database-side rate limiting or abuse
automation can be added later if the product needs stronger enforcement.

`feedback_submissions` supports private product feedback:

- submitter user
- server-captured submitter email when available
- feedback type: feedback, bug, or suggestion
- message body
- current route/context when available
- user agent when available
- status
- created and updated timestamps

The help-page feedback action applies authenticated-only spam protection:
three feedback submissions per authenticated submitter per hour, message length
limits, type validation, route/context normalization, and a hidden honeypot
field. Feedback is not exposed in public discovery views or public pages.

Phone number handling, if added later, should not assume a US-only format.

## Migration rules

Any schema, RLS, function, or view change must be captured in `supabase/migrations/`.

When database behavior changes, update this document in the same PR.

## Testing expectations

Tests should cover privacy-sensitive helper logic where practical, especially:

- location approximation
- global distance-unit handling
- profile/listing visibility filtering
- contact eligibility checks
- search filter logic

RLS policies should be manually verified during setup and documented until automated database integration tests are added.
