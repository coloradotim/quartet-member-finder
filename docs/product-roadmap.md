# Product Roadmap

This roadmap captures the intended build order for Quartet Member Finder.

## Guiding principles

- Build privacy and trust into the foundation.
- Do not assume a US-only audience.
- Prefer small, reviewable PRs.
- Add tooling, tests, docs, and deployment hygiene before major feature work.
- Keep the MVP focused on singer profiles, quartet listings, discovery, and safe first contact.

## MVP capabilities

### Singer profiles

A signed-in user can create and maintain a profile that describes:

- display name
- approximate location
- parts sung
- goals
- experience level
- availability
- willingness to travel
- short bio
- search visibility

### Quartet listings

A signed-in user can create and maintain a quartet listing that describes:

- quartet/listing name
- approximate location
- current parts covered
- parts needed
- goals
- experience/commitment level
- rehearsal expectations
- willingness to travel
- short description
- search visibility

### Discovery

Users can search for singers and quartet listings by:

- approximate geography
- part sung or part needed
- voicing/type where applicable
- goals
- experience level
- availability
- travel willingness

Discovery should include a list view first. A map view can follow once the privacy-safe location model is in place.

### Contact

Users can start contact through an app-mediated flow rather than exposing email or phone numbers in public search results.

The MVP contact flow should use Resend notifications and avoid public exposure of private contact information.

## Post-MVP ideas

Potential later additions:

- in-app messaging
- report/block tools
- organization/chapter affiliation
- multi-owner quartet listings
- public landing pages for visible quartets
- stronger moderation/admin tools
- internationalization/localization
- event/convention-specific discovery modes
