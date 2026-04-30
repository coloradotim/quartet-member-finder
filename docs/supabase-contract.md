# Supabase Contract

This document describes the intended application/database contract for Quartet Member Finder.

The schema will evolve through committed Supabase migrations. Do not make production schema or Row Level Security changes only in the Supabase dashboard.

## Planned data areas

The initial product is expected to need these data areas:

- user profile/account metadata
- singer profiles
- quartet listings
- quartet listing parts covered/needed
- approximate location data for search
- contact requests/messages
- visibility/contact preferences

## Ownership model

A singer profile belongs to one authenticated user.

A quartet listing belongs to the authenticated user who created it unless multi-owner quartet management is explicitly added later.

Users should be able to read and update their own private data.

Public discovery should only return visible, active, privacy-safe fields.

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

## Location data expectations

The database may store coordinates or geocoded data needed for search, but public queries should expose only approximate location information.

Preferred pattern:

- Store private normalized location fields in base tables.
- Expose privacy-safe search fields through views or controlled RPC functions.
- Return approximate distance/region rather than exact coordinates for public discovery.

## Contact data expectations

Email addresses and phone numbers should not appear in public search results by default.

The MVP contact flow should use app-mediated contact with Resend notifications.

Contact request tables should support basic auditability, including sender, recipient/listing target, timestamp, and message body.

## Migration rules

Any schema, RLS, function, or view change must be captured in `supabase/migrations/`.

When database behavior changes, update this document in the same PR.

## Testing expectations

Tests should cover privacy-sensitive helper logic where practical, especially:

- location approximation
- profile/listing visibility filtering
- contact eligibility checks
- search filter logic

RLS policies should be manually verified during setup and documented until automated database integration tests are added.
