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

## Abuse and safety considerations

Future work may include:

- reporting inappropriate profiles/messages
- blocking users
- rate limits on contact messages
- audit logs for contact attempts
- admin tools for handling abuse reports

The MVP should at least avoid public exposure of private location/contact data and should avoid unauthenticated contact spam.
