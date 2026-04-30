# Quartet Member Finder

Quartet Member Finder helps barbershop singers and incomplete quartets find each other.

The app is intended to support privacy-conscious discovery, approximate location search, singer profiles, quartet listings, and safe first contact between people who may want to sing together.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint and Prettier
- Vercel deployments from GitHub
- Vitest for unit tests
- GitHub Actions for CI
- Planned: Supabase Auth/Postgres/Row Level Security
- Planned: Resend transactional email

## Product goals

- Help individual singers publish enough information to be found by compatible quartets or other singers.
- Help incomplete quartets advertise what parts and commitment level they are looking for.
- Support map/list discovery without exposing exact home locations.
- Provide a safe app-mediated contact flow before personal contact details are shared.
- Keep the experience friendly, practical, and useful for the barbershop community.

## Local development path

Use this local repo path for Codex work:

```text
/Users/timpeterson/Documents/Codex/quartet-member-finder
```

## Local setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Validate the project:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run format:check
npm run build
```

Copy `.env.example` to `.env.local` when configuring local services. Keep real
secrets out of source control.

Testing expectations and the current unit-test structure are documented in
`docs/testing.md`.

Local and staging demo data is documented in `docs/seed-data.md`; the seed file
is intentionally opt-in and must not be run against production.

Manual launch and deployment validation steps are documented in
`docs/smoke-test-plan.md`.

The final production-readiness and privacy launch checklist is documented in
`docs/launch-readiness.md`.

Vercel, Supabase, Resend, Namecheap DNS, and `quartetmemberfinder.org`
deployment steps are documented in `docs/deployment.md`.

## Repository workflow

Normal work should happen on short-lived feature branches and merge to `main`
through pull requests. The protected `main` branch requires the `guardrails`,
`validate`, and `Vercel` checks before merge.

Squash merge is the preferred merge strategy, auto-merge may be used once a PR
is ready and checks are expected to pass, and feature branches should be deleted
after merge.

## Early project notes

Project context, privacy expectations, workflow rules, and implementation
guardrails are captured in `AGENTS.md` and the `docs/` folder.
