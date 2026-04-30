# Quartet Member Finder — Agent Context

## Product

Quartet Member Finder helps barbershop singers and incomplete quartets find each other.

The app supports two primary listing types:

1. Singer profiles: individual singers who are open to quartet opportunities.
2. Quartet listings: incomplete quartets looking for one or more singers.

The app is for practical discovery and safe introductions, not for building a public social network or exposing personal contact/location details.

Prioritize clarity, trust, privacy, and ease of use. The app should help singers answer:

- “Who near me might be interested in singing in a quartet?”
- “Which quartets near me are looking for someone who sings my part?”
- “Who could we safely contact about filling a missing part?”

## Core domain rules

- A singer may sing one or more barbershop parts.
- TTBB parts: Tenor, Lead, Baritone, Bass.
- SSAA barbershop parts should use Tenor, Lead, Baritone, Bass unless the product later explicitly adds alternate SSAA naming.
- Mixed/SATB support may be added, but the initial product is primarily for barbershop quartet discovery.
- “Lead” is the melody part in most barbershop arrangements; do not rename it to “Melody.”
- A singer profile belongs to one authenticated user.
- A quartet listing belongs to the authenticated user who created it, unless multi-owner quartet management is explicitly added later.
- Quartet listings must identify which parts are currently covered and which parts are being sought.
- Search should support both singer discovery and quartet discovery.
- The app should be useful even when profile data is incomplete.

## Global product assumptions

Barbershop is global. Most users may be in the United States and Canada, but the app should not assume a US-only audience.

Location, search, forms, and data models should be globally tolerant from the start.

Avoid hard-coding assumptions such as:

- ZIP code as the only supported location input
- US state as a required field
- miles as the only supported distance unit
- US-only phone-number formatting
- US-only address parsing
- country-specific validation unless the country is explicit

The MVP can be English-only, but location handling should support international cities, regions, countries, postal codes, and map/geocoding behavior where practical.

## Privacy and safety rules

Privacy is a core product requirement.

Do not expose exact home addresses, exact coordinates, private email addresses, or phone numbers in public search results.

Location handling:
- Users may provide a city, ZIP/postal code, postal code, country, or approximate location.
- The app may store normalized location data needed for distance search.
- Public UI should show approximate location only, such as “Fort Collins, CO area,” “Manchester, UK area,” or “about 15 miles / 24 km away.”
- Map views must use approximate pins, jittered/blurred areas, or regional markers rather than exact home-location pins.
- Users must be able to hide their profile/listing from search.

Communication:
- Do not publicly display personal email addresses or phone numbers by default.
- Initial contact should happen through an app-mediated flow.
- Resend is the preferred transactional email provider.
- A contact relay should notify the recipient and allow them to decide whether to respond or reveal direct contact information.
- Avoid building real-time chat until explicitly requested.

Security:
- Do not commit secrets.
- Do not use Supabase service-role keys in browser code.
- Enforce ownership and visibility with Supabase Row Level Security.
- Do not depend on client-side checks alone for private data.
- Treat profile visibility, contact preferences, and location precision as security/privacy-sensitive fields.

## Barbershop-specific context

- Barbershop is sung by communities around the world, including the US, Canada, UK, Ireland, Europe, Australia, New Zealand, and elsewhere.
- Pickup and prospective quartets often form through local chapters, conventions, afterglows, coaching circles, and informal singer networks.
- Quartet goals vary widely:
  - casual/social singing
  - pickup singing
  - regular rehearsing quartet
  - contest quartet
  - paid gigs
  - learning/development
- Experience level should be descriptive rather than judgmental.
- Users may be flexible across multiple parts.
- Quartet compatibility is not just geography; it also includes part, goals, availability, travel willingness, experience, and musical ambition.
- Keep the tone friendly, welcoming, and community-oriented.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth/Postgres
- Supabase Row Level Security
- Supabase migrations committed in the repo
- Resend for transactional email
- Vitest for unit tests
- GitHub Actions for CI
- Vercel deploys from GitHub

## Expected tooling from the start

The repository should include:

- linting
- formatting
- type checking
- unit tests
- production build check
- GitHub Actions CI
- `.env.example`
- Supabase migrations
- documented RLS/data contract
- documented privacy model
- documented deployment process

Do not postpone this tooling until after feature work unless the user explicitly requests a throwaway prototype.

## Workflow

Use the local repo at `/Users/timpeterson/Documents/Codex/quartet-member-finder`.

When the user asks to `work issue #X`, treat that as instruction to implement GitHub issue `#X` using the standard issue workflow:

1. Read `AGENTS.md`.
2. Check out `main`.
3. Pull latest `origin/main`.
4. Create a feature branch named for the issue, using the `codex/` prefix unless the user requests a different name.
5. Make the requested changes.
6. Consider whether documentation needs to be updated.
7. Consider whether tests need to be updated.
8. Run `npm run lint`.
9. Run `npm run typecheck`.
10. Run `npm run test:run`.
11. Run `npm run format:check`.
12. Run `npm run build`.
13. Commit changes to the feature branch.
14. Push the branch.
15. Open a PR that links the issue.
16. If the repository allows auto-merge, enable auto-merge on the PR.
17. If all required checks pass and branch protection allows it, allow the PR to merge through the protected-branch/auto-merge path.
18. If auto-merge or merge is blocked, report the exact blocker, such as a failing check, pending required check, branch protection rule, merge conflict, review requirement, or permissions issue.

Before finishing any change:
- run `npm run lint`
- run `npm run typecheck`
- run `npm run test:run`
- run `npm run format:check`
- run `npm run build`
- do not change app behavior unless requested
- prefer small PRs
- update docs when behavior, setup, deployment, environment variables, Supabase schema/RLS/contracts, privacy behavior, auth behavior, contact flows, or search behavior changes
- update tests when business logic, data flow, filtering, privacy rules, Supabase helpers, auth/session behavior, UI state transitions, or regression-prone bugs change
- if docs or tests are not updated, explain why in the PR

Supabase changes must be captured in repo migrations and docs rather than dashboard-only changes. If a change requires schema, RLS, or data-model updates, add a proper migration and update `docs/supabase-contract.md`.

For Supabase migrations:
- migration filenames must use `YYYYMMDDHHMMSS_descriptive_name.sql`
- production migrations are expected to run through `.github/workflows/production-deploy.yml`
- do not apply production Supabase changes manually unless the workflow is blocked and the user explicitly approves an emergency/manual production operation
- if a migration is added or changed, mention the migration in the PR summary and verify whether the production workflow has the required GitHub repository or `production` environment secrets

Production deployment:
- pull request CI validates guardrails, lint, typecheck, tests, formatting, and build
- production deploys run from GitHub Actions on `main` via `.github/workflows/production-deploy.yml`
- the production workflow applies Supabase migrations when relevant, pulls Vercel production environment, builds with `vercel build --prod`, and deploys with `vercel deploy --prebuilt --prod`

Guardrails:
- do not commit directly to `main`
- do not commit secrets
- do not use service-role keys in browser code
- do not expose exact location data in public UI
- do not expose personal contact info by default
- do not introduce US-only location, distance, phone, or address assumptions
- do not bypass failing tests or builds
- do not bypass branch protection or required checks
- do not force-merge blocked PRs
- do not deploy production Supabase changes outside the approved migration/deployment workflow

## Important planned files

- `app/`: Next.js App Router pages and layouts
- `components/`: shared UI components
- `lib/supabase/`: Supabase clients and helpers
- `lib/profiles/`: singer profile logic
- `lib/quartets/`: quartet listing logic
- `lib/search/`: search/filtering/distance logic
- `lib/location/`: approximate location and privacy helpers
- `lib/contact/`: contact relay and Resend helpers
- `supabase/migrations/`: database migrations
- `docs/supabase-contract.md`: app/database contract and RLS expectations
- `docs/privacy-model.md`: location, visibility, and contact privacy rules
- `docs/deployment.md`: Vercel, Supabase, Resend, and domain setup
- `.env.example`: required environment variables
