# Privacy Model

Privacy is a core product requirement for Quartet Member Finder.

The app should help singers and incomplete quartets find each other without exposing exact home locations, private contact information, or unnecessary personal details.

## Public search principles

Public search results may show:

- display name
- approximate city/region/country
- approximate distance from the searcher
- voice parts sung or needed
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
views rather than private base tables. Filters may use public country, region,
locality, part, goal, experience/commitment, availability, and travel
willingness fields where data exists. Exact coordinates, private postal codes,
formatted private addresses, email addresses, and phone numbers are not part of
the public result shape.

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

Users may enter a city, postal code, country, or approximate location.

The app may store normalized location data to support distance search, but public UI should only expose approximate location.

Private geocoded data should be transformed into a public location summary
before display. Public summaries may contain only a user-provided public label,
locality, region, and country. They must not contain exact latitude, longitude,
private postal code, formatted private address, or other precise address
components. If an explicit public label is present, use it as the display label;
otherwise build an approximate label from locality, region, and country, such as
“Dublin, Leinster, Ireland area.”

Distance helpers may use exact coordinates internally for matching, but public
distance display should be rounded and approximate, such as “about 15 mi / 24 km
away.” Travel willingness and distance display should support both kilometers
and miles without assuming a US-only default.

Acceptable user-facing examples:

- “Fort Collins, CO area”
- “Toronto, ON area”
- “Manchester, UK area”
- “about 15 miles / 24 km away”
- “Northern Colorado”

Avoid exact map pins. Map interfaces should use one of the following:

- approximate pins
- jittered/blurred markers
- region/city-level markers
- search-result areas rather than exact addresses

The MVP discovery map uses region-level markers derived from public discovery
view fields only: public location label, locality, region, country, and country
code. It must not receive base-table coordinates, private postal codes, or
formatted private addresses in browser-rendered props. Marker placement may use
country/region anchors and deterministic offsets so nearby results can cluster
without implying a home address or exact rehearsal location.

## Visibility controls

Users must be able to control whether their singer profile appears in search.

Quartet listing owners must be able to control whether a quartet listing appears in search.

Hidden/inactive profiles and listings should not be returned in public discovery queries.

## Singer profile management

Signed-in users can manage their own singer profile from the protected app area.
The MVP profile form stores:

- display name
- barbershop parts sung
- goals
- descriptive experience level
- availability
- travel willingness in kilometers
- short bio
- public approximate location label
- country, region, locality, and private postal code when provided
- search visibility

The postal code field is stored for future matching/search work and should not
be shown in public discovery results. The public discovery label should stay
approximate, such as a city/region/country area. Location inputs remain globally
tolerant and do not require US state, ZIP code, address, or phone formats.

## Quartet listing management

Signed-in users can manage a quartet listing from the protected app area. The
MVP listing form stores:

- listing or quartet name
- parts currently covered
- parts needed
- goals
- experience or commitment level
- rehearsal expectations
- travel willingness in kilometers
- short description
- public approximate location label
- country, region, locality, and private postal code when provided
- search visibility

The listing form keeps covered and needed parts distinct so public discovery can
clearly show what the quartet has and what it is seeking. Postal code remains
private listing data and should not be shown in public listing discovery.

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
the help page. The browser sends only the feedback type, message, current route
context, and a spam honeypot field. The server action attaches the authenticated
user ID and auth email when available, then stores the submission in Supabase.

Feedback submissions are not public content and are not included in discovery
views, search results, maps, or public profile/listing UI. Regular authenticated
users cannot read other users' feedback. Admin/service-role access is required
for cross-user review or triage.

## Onboarding model

First-run onboarding asks signed-in users what they want to do first, not what
role they permanently are. A user may use the app as a singer and in Quartet
Mode.

Onboarding state is stored on the user's private `account_profiles` row. The app
records whether onboarding was completed or skipped and, when completed, the
selected first action. This state is used only to avoid showing first-run
onboarding repeatedly and to route the user to a useful next step.

The onboarding copy reminds users that exact locations are not shown publicly,
location fields should work outside the United States, and first contact starts
through the app.

## Account settings model

Account Settings are separate from My Singer Profile and Quartet Mode. They are
for app-level preferences and account-level actions that should not change
public discovery content by accident.

The initial settings page lets a signed-in user save an account-level preferred
distance unit and reset first-run onboarding. Future export, deactivation, and
delete actions are shown only as placeholders until the product has clear
privacy and data-retention behavior for them.

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
