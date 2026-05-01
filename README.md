# Quartet Member Finder

Quartet Member Finder helps barbershop singers and incomplete or prospective
quartets find each other without turning discovery into a public social network.
The app is built around practical, privacy-conscious introductions: signed-in
discovery, approximate location, app-mediated Messages, and independent profile
visibility controls.

## Product Model

One account can support two optional presences:

- **My Singer Profile** represents the signed-in user personally as a singer.
- **My Quartet Profile** represents a quartet, incomplete quartet, or
  prospective quartet the user represents.

Users can fill out either profile, both profiles, or neither while getting
oriented. Each profile has its own visibility setting, so filling out a profile
does not automatically make it discoverable.

Discovery requires sign-in. Find combines filters, approximate radius search,
privacy-safe map context, and result cards for singer profiles and quartet
openings. First contact happens through Messages; private email addresses and
phone numbers are not shown in discovery by default.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth/Postgres with Row Level Security
- Resend transactional email
- Mapbox for interactive discovery maps and server-side approximate geocoding
- Vitest for unit tests
- ESLint and Prettier
- GitHub Actions CI and Vercel deployment

## Local Development

Use this local repo path for Codex work:

```text
/Users/timpeterson/Documents/Codex/quartet-member-finder
```

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in local service values. Keep real
secrets out of source control.

Start the development server:

```bash
npm run dev
```

Core validation commands:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run format:check
npm run build
```

## Key Docs

- `AGENTS.md` captures agent workflow, product guardrails, privacy rules, and
  repository expectations.
- `docs/barbershop-context.md` captures durable barbershop/domain context for
  future contributors and Codex work.
- `docs/supabase-contract.md` documents schema, RLS, discovery views, contact,
  reporting, and privacy expectations.
- `docs/privacy-model.md` documents approximate location, contact privacy,
  reporting, and safety boundaries.
- `docs/deployment.md` documents Vercel, Supabase, Resend, Mapbox, domain, and
  production deployment setup.
- `docs/environment.md` lists required public and server-only environment
  variables.
- `docs/smoke-test-plan.md` and `docs/launch-readiness.md` describe manual
  verification and launch readiness.
- `docs/admin-moderation.md` documents report review, message blocking,
  permanent block, and manual deletion process.
- Public user-facing Help and Privacy copy lives in `lib/content/public-pages.ts`
  and renders at `/help` and `/privacy`.

## Workflow

Normal work happens on short-lived feature branches and merges to `main` through
pull requests. The protected `main` branch expects `guardrails`, `validate`, and
`Vercel` checks. Squash merge is preferred, and auto-merge may be enabled once a
PR is ready and checks are expected to pass.
