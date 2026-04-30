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
