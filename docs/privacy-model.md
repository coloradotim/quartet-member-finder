# Privacy Model

Privacy is a core product requirement for Quartet Member Finder.

The app should help singers and incomplete quartets find each other without exposing exact home locations, private contact information, or unnecessary personal details.

## Public search principles

Public search results may show:

- display name
- approximate city/region/country
- approximate distance from the searcher
- voice parts sung or needed, with voicing context
- quartet goals and experience information
- availability and travel preferences when the user chooses to provide them

Public search results must not show:

- exact home address
- exact latitude/longitude
- private email address
- phone number
- unlisted profile/listing data
- inactive or hidden profiles/listings

Public singer and quartet discovery pages must query privacy-safe discovery
views rather than private base tables. Filters may use public country, city,
region when available, voicing-aware part, goal, experience/commitment,
availability, and travel willingness fields where data exists. Exact
coordinates, private postal codes, formatted private addresses, email addresses,
and phone numbers are not part of the public result shape.

## Global location expectations

Barbershop is global. The app should not assume that all users are in the United States.

Location handling should support international cities, regions, countries, postal codes, and map/geocoding behavior where practical.

Avoid hard-coding assumptions such as:

- ZIP code as the only supported location input
- US state as a required field
- miles as the only supported distance unit
- US phone-number formats
- US-only address parsing
- country-specific validation unless the user has selected a country

The MVP can be English-only, but location and distance handling should be globally tolerant from the start.

## Location handling

Users enter country, state/province/region, city/locality, and ZIP/postal code
where useful. Forms avoid country-code and street-address language.

The app may store normalized location data to support distance search, but public UI should only expose approximate location.

Private geocoded data should be transformed into a public location summary
before display. Public summaries may contain only locality/city, region when
available, and country. They must not contain exact latitude, longitude, private
postal code, formatted private address, or other precise address components.
When server-side geocoding is configured, the app may store private approximate
coordinates for matching and radius search. Country, region, city, and ZIP/postal
code still provide useful context for approximate map/search behavior because
browser maps use public city/country labels and regional markers rather than
exact pins.

Distance helpers may use exact coordinates internally for matching later, but
public distance display should be rounded and approximate. Find defaults
distance display to miles and offers a miles/kilometers picker. Profile and
listing forms do not ask users to choose a unit.

Acceptable user-facing examples:

- “Fort Collins, CO area”
- “Toronto, ON area”
- “Manchester, UK area”
- “about 15 mi / 24 km away”
- “Northern Colorado”

Avoid exact map pins. Map interfaces should use one of the following:

- approximate pins
- jittered/blurred markers
- region/city-level markers
- search-result areas rather than exact addresses

The interactive discovery map uses Mapbox GL JS with a non-Mercator `globe`
projection by default. It renders region-level markers derived from public
discovery fields only: public location label, locality, region, country, country
code, and rounded approximate distance when radius search is active. It must not
receive base-table coordinates, private postal codes, or formatted private
addresses in browser-rendered props. Marker placement may use country/region
anchors and deterministic offsets so nearby results can cluster without implying
a home address or exact rehearsal location.

## Visibility controls

Users must be able to control whether their singer profile appears in search.

Quartet listing owners must be able to control whether a quartet listing appears in search.

Hidden/inactive profiles and listings should not be returned in public discovery queries.

## Singer profile management

Signed-in users can manage their own singer profile from the protected app area.
The MVP profile form stores:

- display name
- barbershop parts sung, grouped by voicing
- goals
- descriptive experience level
- availability
- travel willingness, entered in miles and stored internally as kilometers
- short bio
- country, city/locality, and private ZIP/postal code when provided
- search visibility

The postal code field is stored for future matching/search work and should not
be shown in public discovery results. The public discovery label should stay
approximate, such as a city/country area. Location inputs remain globally
tolerant and do not require US state, exact address, or phone formats.

## Quartet listing management

Signed-in users can manage a quartet listing from the protected app area. The
MVP listing form stores:

- listing or quartet name
- quartet voicing
- parts currently covered
- parts needed
- goals
- experience or commitment level
- rehearsal expectations
- travel willingness, entered in miles and stored internally as kilometers
- short description
- country, city/locality, and private ZIP/postal code when provided
- search visibility

The listing form keeps covered and needed parts distinct and tied to the
listing's primary voicing so public discovery can clearly show what the quartet
has and what it is seeking. Postal code remains private listing data and should
not be shown in public listing discovery.

## Contact model

Initial contact should be mediated by the app.

The MVP contact flow should:

1. Allow a signed-in user to send a short message to a singer or quartet listing.
2. Notify the recipient by email using Resend.
3. Avoid exposing the recipient’s email address to the sender.
4. Allow the recipient to decide whether to reply or share direct contact information.

Do not publicly display phone numbers or email addresses by default.

Public singer and quartet cards may show app-mediated contact forms, but those
forms must submit only the target type, target ID, return path, and message.
They must not include recipient email addresses or phone numbers. The server
inserts `contact_requests` as the authenticated sender, lets the database
trigger resolve the private recipient from a visible target, and then uses
server-only Supabase service-role access to find the recipient email for the
Resend notification. If Resend or service-role configuration is missing, the
request may be stored for audit but email delivery is deferred.

Contact notifications should not reveal the sender’s direct email address by
default. They should tell the recipient a signed-in user sent the request and
allow the recipient to decide whether to respond or share direct contact
information later.

## Feedback model

The public help page stays readable before login. Signed-out visitors are
invited to sign in before sending feedback.

Signed-in users can submit private feedback, bug reports, or suggestions from
the help page. The browser sends only the feedback type, message, and current
route context. The server action attaches the authenticated user ID and auth
email when available, stores the submission in Supabase, and sends a Resend
notification to the project-team inbox at `cubuff98@gmail.com`.

Feedback submissions are not public content and are not included in discovery
views, search results, maps, or public profile/listing UI. Regular authenticated
users cannot read other users' feedback. Admin/service-role access is required
for cross-user review or triage.

## Product analytics model

The app may use PostHog for privacy-safe product analytics so the project can
understand launch usage, onboarding completion, discovery activity, contact
requests, and feedback submission without reading private user content.

Analytics is optional and disabled when PostHog environment variables are not
configured. When enabled, browser tracking sends route-view events through an
internal app endpoint, and server actions send high-level funnel events after
successful actions.

Allowed analytics properties are intentionally narrow, such as route area,
public route path, result counts, filter-presence booleans, target kind,
visibility enabled flags, generic status, feedback type, and onboarding choice.

Analytics must not send:

- email addresses
- display names
- profile bio or quartet listing descriptions
- contact request or feedback message text
- postal codes
- exact latitude or longitude
- phone numbers
- raw private ownership or recipient identifiers

Signed-in server events may use a pseudonymous hash of the authenticated user ID
so funnel steps can be understood without identifying users by direct personal
information.

## Onboarding model

First-run onboarding first asks signed-in users for basic profile context:
display name, country, city, and ZIP/postal code. It then asks what they want to
do first, not what role they permanently are. A user may maintain My Singer
Profile, My Quartet Profile, both profiles, or neither profile while getting
oriented.

Onboarding state is stored on the user's private `account_profiles` row. The app
records whether onboarding was completed and the selected first action. This
state is used only to avoid showing first-run onboarding repeatedly and to route
the user to a useful next step. Completing onboarding also creates or updates a
hidden starter singer profile with the basic context so discovery defaults are
available without publishing the profile.

The onboarding copy reminds users that exact locations are not shown publicly,
location fields should work outside the United States, and first contact starts
through the app.

## Profile, location, and account model

There is no active standalone Account Settings workflow. The legacy
`/app/settings` route redirects to My Singer Profile so old links do not break.
The app does not ask users to re-run onboarding or choose a global distance
unit.

My Singer Profile is the place for public singer discovery data: public display
name, parts, goals, experience, availability, approximate location, private
postal code for future matching, and search visibility. My Quartet Profile owns
the same kind of location and visibility decisions for a quartet or prospective
quartet the user represents.

Each optional profile has independent visibility. Discoverable means the profile
can appear in Find results and approximate map discovery. Hidden means it stays
out of discovery. Filling out one profile does not require publishing it, and
hiding one profile does not hide the other.

Singer profile and quartet profile location forms ask for country,
state/province/region, city/locality, and ZIP/postal code. The fields remain
optional for saving drafts, but if a user makes a profile discoverable with
important location fields missing, the app warns that map placement and
location-based search may be limited. Country on the singer profile or quartet
listing drives practical defaults such as miles vs kilometers and country-aware
labels like ZIP code, postcode, state, province, or region where practical. The
app should keep those labels helpful without requiring strict international
address validation or a street address.

## Abuse and safety considerations

Future work may include:

- reporting inappropriate profiles/messages
- blocking users
- rate limits on contact messages
- admin feedback triage tools
- audit logs for contact attempts
- admin tools for handling abuse reports

The MVP should at least avoid public exposure of private location/contact data,
avoid unauthenticated contact spam, and rate-limit authenticated feedback
submissions.
