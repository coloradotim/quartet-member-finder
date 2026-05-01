# Location Geocoding

Quartet Member Finder uses privacy-preserving approximate geocoding for radius
search. Exact home addresses are not required or displayed.

## Provider

The MVP server-side geocoder uses Mapbox Geocoding API v6 forward geocoding.
The app sends only approximate location components:

- ZIP/postal code, when the user provides one
- city/locality
- state/province/region
- country name or country code

It does not send or require street addresses.

## Environment

Set these server-only environment variables in Vercel:

```text
MAPBOX_GEOCODING_TOKEN=<Mapbox access token>
MAPBOX_GEOCODING_PERMANENT=true
```

`MAPBOX_GEOCODING_TOKEN` enables search-origin resolution for `/find`.
`MAPBOX_GEOCODING_PERMANENT=true` is required before profile/listing save
actions persist geocoded coordinates in Supabase. This keeps stored coordinates
aligned with Mapbox's permanent geocoding terms.

Local development can leave both values blank. In that case radius search
explains that geocoding is not configured, and saved profiles/listings do not
store coordinates.

## Storage

Singer profiles and quartet listings store coordinates only in private base-table
columns:

- `latitude_private`
- `longitude_private`
- `location_precision`

Public discovery views never expose exact coordinates, postal codes, private
addresses, owner IDs, or recipient contact details.

Profile and listing save actions call permanent geocoding only when the saved
location fields are new or changed. If a user updates goals, parts,
availability, visibility, or other non-location fields, the app preserves the
existing private coordinates and does not make another geocoding request.

## Radius Search

When a signed-in user enters a search origin and radius on `/find`, the server:

1. Resolves the origin with temporary Mapbox geocoding on explicit search.
2. Converts miles to kilometers when needed.
3. Calls Supabase RPC functions that filter visible records by approximate
   distance.
4. Returns existing public discovery fields plus `distance_km`.

The browser receives an approximate distance label such as “about 12 mi / 19 km
away.” It does not receive exact coordinates.

## Failure Behavior

If geocoding is not configured, Mapbox is unavailable, or the origin cannot be
resolved, `/find` shows a plain-language notice. It still lets users browse
visible discovery results using non-distance filters.

Profiles/listings saved while geocoding is unavailable do not receive private
coordinates. They remain visible in non-radius discovery if the owner chose to
publish them, but they cannot match radius searches until saved again after
geocoding is configured.

When `/find` uses My Singer Profile as the search origin, the app distinguishes
three unavailable states:

- no Singer Profile exists yet
- the profile is missing one or more location text fields needed for profile
  origin search
- the profile has location text but no saved approximate coordinates yet

Only the last state asks the user to re-save My Singer Profile so geocoding can
prepare the location for radius search. A profile with usable saved coordinates
can be selected without showing a missing-location warning.

## Cost and Limits

Mapbox requests may be billed and rate limited according to the Mapbox account's
current plan. Search-origin lookups are temporary geocoding requests. Saved
profile/listing location lookups use `permanent=true` only when
`MAPBOX_GEOCODING_PERMANENT=true` is set.

Mapbox documentation states that temporary geocoding results are not for stored
reuse. QMF therefore does not persist typed search-origin geocoding responses.
Repeated searches for the same typed origin can make repeated temporary
geocoding requests; keep the UI explicit and avoid live geocoding on every
keystroke.
