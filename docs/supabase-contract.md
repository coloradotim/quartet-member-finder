# Supabase Contract

This document describes the intended application/database contract for Quartet Member Finder.

The schema will evolve through committed Supabase migrations. Do not make production schema or Row Level Security changes only in the Supabase dashboard.

## Initial data areas

The initial schema is defined in
`supabase/migrations/20260430023000_initial_schema_and_rls.sql`.

It includes these data areas:

- `account_profiles`: authenticated-user display metadata.
- `singer_profiles`: one singer profile per authenticated owner.
- `singer_profile_parts`: one or more voicing-aware barbershop parts for a singer.
- `quartet_listings`: incomplete quartet listings owned by one authenticated user.
- `quartet_listing_parts`: voicing-aware parts currently covered or needed by a quartet.
- `contact_requests`: app-mediated first-contact messages.
- `feedback_submissions`: private authenticated-user feedback from the help page.
- `singer_discovery_profiles`: privacy-safe singer discovery view.
- `quartet_discovery_listings`: privacy-safe quartet discovery view.
- `search_singer_discovery_profiles`: authenticated radius-search RPC.
- `search_quartet_discovery_listings`: authenticated radius-search RPC.

The schema also defines enums for distance units, location precision, quartet
part status, and contact request status. Earlier migrations created a
barbershop part enum; current part storage uses text plus voicing constraints so
TTBB, SATB, and SSAA part names can stay distinct.

## Part model

Barbershop parts are represented with explicit voicing context. The app stores
the canonical `voicing` and `part` together in `singer_profile_parts` and
`quartet_listing_parts`.

Supported MVP voicings and parts are:

- TTBB: `Tenor`, `Lead`, `Baritone`, `Bass`
- SATB: `Soprano`, `Alto`, `Tenor`, `Bass`
- SSAA: `Soprano 1`, `Soprano 2`, `Alto 1`, `Alto 2`

Voicing context is meaningful. `TTBB` `Tenor` and `SATB` `Tenor` are not treated
as interchangeable discovery values. SATB UI may show mixed-barbershop helper
labels, such as “Soprano / Mixed Tenor,” while storing the canonical SATB part.
Discovery views expose searchable public arrays as `Voicing:Part` strings, for
example `TTBB:Lead` or `SATB:Soprano`.

## Ownership model

An `account_profiles` row belongs to one authenticated user by `user_id`.
It also stores first-run onboarding completion/skipped state so new users can be
guided to a first action after sign-in without choosing a permanent role.
First-run onboarding state lives here. `display_name` and
`preferred_distance_unit` remain in the schema for compatibility, but the active
product flow now treats country on singer profiles and quartet listings as the
source for distance defaults.

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
`/app/onboarding`. Current onboarding collects display name and optional
country/city/ZIP or postal code before asking what workflow the user wants to
open first. Current `onboarding_last_choice` values are
`singer-profile-first`, `quartet-profile-first`, and `get-oriented`; legacy
values remain allowed by the database constraint for existing rows. Completing
onboarding also creates or updates a hidden starter `singer_profiles` row with
that basic context so profile defaults are available without publishing the user
in discovery.

The legacy `/app/settings` route redirects to My Singer Profile. The app no
longer asks users to re-run onboarding or choose account-level distance units.
Singer profiles and quartet listings keep their own public
display/location/travel details for discovery rows, and save actions infer
`preferred_distance_unit` from country.

The signed-in discovery routes are:

- `/find`, backed by both discovery views for consolidated filters, map, and
  results table
- `/singers`, backed by `singer_discovery_profiles`
- `/quartets`, backed by `quartet_discovery_listings`
- `/map`, backed by both discovery views as a compatibility map view

These routes may filter on voicing-aware parts and goals. `/find` can resolve a
search origin and radius when server-side geocoding is configured, then use
authenticated RPC functions to return visible results sorted by approximate
distance. If a search origin is missing, radius is missing, or geocoding cannot
resolve the origin, `/find` falls back to visible discovery results with a clear
notice. Browser code should not read private base-table location or contact
fields.

These routes require authentication before reading discovery views. The views
still expose only privacy-safe public fields, but anonymous visitors are
redirected to sign in before browsing singers, quartet openings, or map results.

## Row Level Security expectations

RLS should enforce:

- users can create their own singer profile
- users can update/delete only their own singer profile
- users can create quartet listings they own
- users can update/delete only quartet listings they own
- discovery reads return only active/visible listings and profiles
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
- `search_singer_discovery_profiles`
- `search_quartet_discovery_listings`

Those views and functions filter to `is_visible = true` and `is_active = true`
and include only privacy-safe columns. They intentionally omit:

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
After storage succeeds, the server action sends a Resend notification to
`cubuff98@gmail.com` with the feedback type, message, submitter auth email when
available, context path, and feedback row ID.

## Location data expectations

The database may store coordinates or geocoded data needed for search, but
public queries should expose only approximate location information.

The schema should be globally tolerant. Do not require US-only fields such as state or ZIP code. Prefer fields that can support international location data, such as:

- country code or country name
- region/admin area when available internally or from future geocoding
- locality/city when available
- postal code when available
- formatted approximate location label
- private geocoded latitude/longitude for search, if needed
- preferred distance unit or display convention, if needed

Current pattern:

- Store private normalized location fields in base tables.
- Expose privacy-safe search fields through views or controlled RPC functions.
- Return approximate distance/region rather than exact coordinates for public discovery.
- Support both miles and kilometers in Find display. Miles are the default
  user-facing unit; stored travel radius values remain kilometers.

Application location helpers should treat base-table coordinates and private
postal/address fields as internal matching data. User-facing profile/listing
forms ask for country, state/province/region, city/locality, and ZIP/postal
code; they do not expose country code or street address fields. The reusable
public transformation returns only
`location_label_public`, `locality`, `region`, and `country_name` equivalents
for display. Find can display travel-radius values in miles or kilometers, with
miles as the default, while storage remains in kilometers.

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

Approximate radius search uses
`supabase/migrations/20260501020000_approximate_radius_search.sql`:

- `distance_between_coordinates_km` computes private server/database distance.
- `search_singer_discovery_profiles` returns visible singer rows within a
  caller-provided radius and includes only `distance_km`, not coordinates.
- `search_quartet_discovery_listings` does the same for quartet listings.
- radius indexes cover visible active rows with private coordinates.
- execute grants are limited to authenticated users.

The app's server actions geocode profile/listing location fields through the
server-only approximate geocoder when configured. Saved coordinates remain in
private base-table fields. Search-origin geocoding for `/find` is temporary and
not stored.

The public map route must continue to use those discovery views rather than base
tables. Map markers are built from public location summaries and country/region
anchors; no private latitude/longitude columns should be selected for browser
display. The browser may receive approximate marker coordinates derived from
public country/region/locality values so the interactive map can place regional
markers without exposing stored home-location coordinates.

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
limits, type validation, and route/context normalization. Feedback is not
exposed in public discovery views or public pages.

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
