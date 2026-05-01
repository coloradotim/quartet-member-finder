# Barbershop And Product Context

Quartet Member Finder is for practical introductions between barbershop singers
and incomplete or prospective quartets. It should feel like a helpful community
tool, not a dating app, recruiting marketplace, or public social network.

## Community Context

Barbershop quartet opportunities often form through chapters, rehearsals,
conventions, afterglows, coaching circles, and informal singer networks. People
may arrive as an individual singer, as someone representing a quartet, or as
both. The app should support that flexibility without forcing users into one
permanent role.

Barbershop is global. Early users may be concentrated in the United States and
Canada, but product language, location fields, and data models should remain
globally tolerant.

## Voice Parts And Voicings

TTBB barbershop parts are Tenor, Lead, Baritone, and Bass. Lead is the melody
part in most TTBB barbershop arrangements; do not rename it to Melody.

The app preserves voicing context:

- TTBB parts: Tenor, Lead, Baritone, Bass.
- SATB or mixed support should keep SATB context instead of treating shared part
  names as automatically equivalent.
- SSAA support should follow the app's current model and should not casually mix
  TTBB labels into SSAA behavior unless the product explicitly changes.

Part filters, profile fields, and matching/search behavior should preserve
voicing plus part together. A TTBB Tenor and a SATB Tenor are not automatically
the same product signal.

## Discovery And Privacy

One account can support two independent optional presences:

- My Singer Profile, for the signed-in user personally as a singer.
- My Quartet Profile, for a quartet or prospective quartet the user represents.

Each profile has its own visibility/discoverability setting. Filling out one or
both profiles does not mean either one must be discoverable. Hiding one profile
does not hide the other.

Discovery requires sign-in. Discovery should show practical matching context,
not private personal data. Public/result UI should not show exact home
addresses, exact coordinates, private postal codes, private email addresses, or
phone numbers.

Location is approximate and privacy-sensitive. ZIP or postal code may support
geocoding and radius search, but discovery should show only approximate area and
distance context.

Contact is app-mediated through Messages. Private email and phone are not
exposed by default. Users can report inappropriate, spammy, suspicious, or
concerning messages; reports are reviewed as the project team is able.

## Product Tone

Prefer clear, practical language over formal, legalistic, or marketing-heavy
language. Explain limitations plainly:

- distance and map placement are approximate
- discovery requires sign-in
- reports are reviewed as able, not in real time
- users should use personal judgment before sharing direct contact details

Avoid overpromising safety, moderation, exact map precision, or verified
compatibility. The app should help people start better-informed conversations,
not make guarantees about fit or behavior.
