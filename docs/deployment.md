# Deployment Notes

Quartet Member Finder is intended to deploy through GitHub, Vercel, Supabase, and Resend.

## Accounts

Recommended project/admin account:

```text
quartetmemberfinder@gmail.com
```

Use that account where practical for Vercel, Supabase, Resend, and project administration so the app is separated from personal accounts.

This project should use its own Vercel account or team rather than sharing the
existing Vercel account used by unrelated projects. Create the Vercel account
first, then import this GitHub repository into a new Vercel project.

## Local path

Codex/local development path:

```text
/Users/timpeterson/Documents/Codex/quartet-member-finder
```

## Planned services

- GitHub: source control, issues, pull requests, CI
- Vercel: web hosting, preview deployments, production deployment
- Supabase: auth, database, Row Level Security
- Resend: transactional email and contact relay notifications
- Map provider: provider-agnostic MVP map now; MapLibre with
  OpenStreetMap-compatible raster or vector tiles is the preferred future
  provider approach when richer panning/zooming is needed
- Namecheap: domain registrar for `quartetmemberfinder.org`

## Global location expectations

Barbershop is global. The app should not assume all users are in the United States.

Location, search, and deployment decisions should support at least:

- United States
- Canada
- United Kingdom
- Ireland
- Australia
- New Zealand
- Europe and other international barbershop communities where practical

Avoid hard-coding US-only assumptions such as:

- ZIP code as the only location input
- US state as a required field
- miles as the only distance unit
- US phone-number formats
- US-specific address parsing

The MVP can use English-only UI, but location handling should be globally tolerant from the start.

## Environment variables

The app should maintain a current `.env.example` file.

Expected variables will likely include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` optional product analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` optional PostHog ingest host
- `SUPABASE_SERVICE_ROLE_KEY` for server-only administrative scripts, never browser code
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `MAPBOX_GEOCODING_TOKEN` optional server-only token for approximate geocoding
- `MAPBOX_GEOCODING_PERMANENT` set to `true` only when permanent Mapbox geocoding
  storage is allowed for the account
- `NEXT_PUBLIC_APP_URL`

Do not commit real secrets.

## Vercel

Vercel should deploy preview builds for pull requests and production from
`main` through the GitHub integration.

Target production host behavior:

- `https://quartetmemberfinder.org` is the canonical production app URL.
- `https://www.quartetmemberfinder.org` should redirect permanently to
  `https://quartetmemberfinder.org`.
- The Vercel-generated production URL should remain available for operations,
  but public links, Supabase Auth settings, Resend links, and user-facing docs
  should use the canonical apex domain once DNS is verified.
- Vercel preview deployment URLs remain branch/PR-specific preview URLs and are
  not canonical production hosts.

Current setup note: this repository is not committed with a `.vercel/project.json`,
and the connected Vercel account available to Codex did not contain a Quartet
Member Finder project. Create a new Vercel account or team for this app, then
create or import a project named `quartet-member-finder` from the GitHub
repository.

Recommended Vercel project setup:

1. Create or sign into the dedicated Vercel account/team for Quartet Member
   Finder.
2. Connect GitHub and grant Vercel access to
   `coloradotim/quartet-member-finder`.
3. In Vercel, import `coloradotim/quartet-member-finder`.
4. Use the Next.js framework preset.
5. Set the production branch to `main`.
6. Keep preview deployments enabled for pull requests.
7. Add environment variables for Production and Preview. Production should use:

```text
NEXT_PUBLIC_APP_URL=https://quartetmemberfinder.org
NEXT_PUBLIC_SUPABASE_URL=<production Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<production Supabase service-role key>
RESEND_API_KEY=<production Resend API key>
RESEND_FROM_EMAIL=messages@quartetmemberfinder.org
MAPBOX_GEOCODING_TOKEN=<server-only Mapbox token>
MAPBOX_GEOCODING_PERMANENT=true
```

Preview should use a safe preview/staging Supabase project if available, not
production data. For preview builds, set `NEXT_PUBLIC_APP_URL` to the exact
preview URL being tested or keep a documented preview/staging host with matching
Supabase Auth redirects.

Approximate radius search is documented in `docs/location-geocoding.md`. Leave
Mapbox geocoding variables blank until the account is ready for the expected
request volume and permanent geocoding storage terms.

### Vercel custom domain setup

In the Vercel project settings:

1. Open Project Settings, then Domains.
2. Add `quartetmemberfinder.org`.
3. Add `www.quartetmemberfinder.org`.
4. Configure `www.quartetmemberfinder.org` to redirect to
   `https://quartetmemberfinder.org` with a permanent redirect.
5. Let Vercel issue and manage the TLS certificates.
6. Wait for both domains to show as verified.

Equivalent CLI shape, if the project is already linked and the operator is
signed in with the right Vercel account:

```bash
vercel domains add quartetmemberfinder.org quartet-member-finder
vercel domains add www.quartetmemberfinder.org quartet-member-finder
```

Use Vercel's project domain UI for the `www` redirect unless the CLI/API command
is being run by someone who has already confirmed the exact redirect settings.

### Namecheap DNS for Vercel

In Namecheap, open Domain List, Manage `quartetmemberfinder.org`, then Advanced
DNS. Remove conflicting parked-domain, forwarding, or old host records for `@`
and `www`, then add the records Vercel shows for the project.

Expected Vercel records are usually:

```text
Type: A
Host: @
Value: 76.76.21.21
TTL: Automatic

Type: CNAME
Host: www
Value: cname.vercel-dns.com or the current Vercel-provided CNAME target
TTL: Automatic
```

Prefer the exact values shown in Vercel's domain verification screen if they
differ. DNS changes may take time to propagate.

After DNS is verified:

1. Visit `https://quartetmemberfinder.org`.
2. Visit `https://www.quartetmemberfinder.org`.
3. Confirm `www` redirects to the apex domain.
4. Confirm the Vercel deployment shown for the domain is the latest production
   deployment from `main`.

## GitHub Actions CI

The repository uses `.github/workflows/ci.yml` for pull request validation and
push validation on `main`.

CI has two stable jobs:

- `guardrails`: repository safety checks that do not require secrets.
- `validate`: Node.js validation that depends on `guardrails`.

Current CI assumptions:

- Node.js 22 is the supported CI runtime.
- npm is the package manager, with dependency installation through `npm ci`.
- Dependency caching uses the npm cache support in `actions/setup-node`.
- Pull request validation should not require production deployment credentials.

The `guardrails` job must fail if:

- a Supabase migration file does not use
  `YYYYMMDDHHMMSS_descriptive_name.sql`
- a local `.env` file other than `.env.example` is tracked by git
- obvious secret values are committed, including Supabase service-role keys,
  Supabase access tokens, Supabase DB URLs, Resend API keys, or Vercel tokens

The `validate` job must fail if any of these commands fail:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run format:check`
- `npm run build`

Before launch, after deployment changes, and after major feature work, run the
manual smoke test plan in `docs/smoke-test-plan.md` against the relevant local,
preview, or production environment.

## Branch protection and merge policy

`main` is the protected production branch. Normal feature, bug, and
documentation work should flow through pull requests from short-lived feature
branches.

Required pull request checks for `main`:

- `guardrails`
- `validate`
- `Vercel`

Branch protection expectations:

- Require branches to be up to date before merging.
- Require the status checks above before merging.
- Require pull requests before updates to `main`.
- Do not require human review for solo-maintainer changes unless the repository
  later adds collaborators or CODEOWNERS.
- Require conversation resolution before merging.
- Block force pushes and branch deletion.
- Apply protection to administrators where practical so accidental direct pushes
  to `main` are blocked.

Merge strategy:

- Squash merge is the preferred merge method for normal PRs. It keeps `main`
  readable while preserving PR discussion and CI history.
- Merge commits and rebase merges should stay disabled unless there is a
  deliberate one-off reason to re-enable them.
- Delete feature branches after merge.

Auto-merge:

- Auto-merge may be enabled for PRs after review of the diff, verification
  notes, and any deployment or migration implications.
- Auto-merge should use the protected branch path. Do not bypass required checks,
  branch protection, or failing production deployment signals.
- If a PR includes Supabase migrations, confirm production migration workflow
  credentials are available before enabling auto-merge.

## GitHub Actions production deployment

The repository uses `.github/workflows/production-deploy.yml` for production
deployment. It runs on pushes to `main` and can also be started manually with
`workflow_dispatch`.

The production workflow:

1. Uses the GitHub `production` environment.
2. Uses concurrency group `production-deploy` so production deploys do not
   overlap.
3. Installs dependencies with `npm ci`.
4. Verifies required production build secrets.
5. Runs lint, typecheck, tests, format check, and a production build.
6. Detects whether `supabase/migrations/` changed. Manual runs always treat
   migrations as changed so operators can intentionally re-run migration
   deployment.
7. Installs the Supabase CLI and applies migrations only when needed.
8. Verifies Vercel deployment secrets.
9. Pulls the Vercel production environment.
10. Builds Vercel production output with `vercel build --prod`.
11. Deploys the prebuilt output with `vercel deploy --prebuilt --prod`.

Preview deployments may remain handled by the Vercel/GitHub integration. The
production workflow is the intended protected production deployment path after
this pipeline is fully configured. If Vercel's GitHub integration is still
deploying `main` directly to production, disable production auto-deploys there
or configure it so GitHub Actions is the source of production deploys while PR
previews remain available.

### GitHub production deployment secrets

Create a GitHub environment named `production` so production deploys have a
distinct environment gate and audit trail.

Add these as either repository secrets or, preferably, `production` environment
secrets if environment-level protection is enabled:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_URL
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_TOKEN
```

Repository secrets are available to the production workflow. Environment
secrets are more tightly scoped and should be used if the repository later adds
production approval rules or wants to prevent non-production jobs from seeing
deployment credentials.

Secret sources:

- `NEXT_PUBLIC_APP_URL`: canonical production app URL,
  `https://quartetmemberfinder.org`.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL from Supabase Project
  Settings, API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous public key from Supabase
  Project Settings, API.
- `SUPABASE_ACCESS_TOKEN`: Supabase account access token from Supabase Account
  Settings, Access Tokens. Scope it to the project/deployment operator account
  where possible.
- `SUPABASE_DB_URL`: Supabase production Postgres connection string from Project
  Settings, Database, Connection string. Use a non-pooled connection string
  accepted by `supabase db push --db-url`. Keep the password in the secret; do
  not commit it.
- `VERCEL_ORG_ID`: Vercel team/account ID for the Quartet Member Finder project.
  It is available from `.vercel/project.json` after `vercel link`, or from the
  Vercel project settings.
- `VERCEL_PROJECT_ID`: Vercel project ID for `quartet-member-finder`. It is
  available from `.vercel/project.json` after `vercel link`, or from the Vercel
  project settings.
- `VERCEL_TOKEN`: Vercel account token created from Vercel Account Settings,
  Tokens, with access to the Quartet Member Finder project.

Runtime-only production values should still live in Vercel Production
environment variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Optional product analytics values may also live in Vercel Production
environment variables:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

Those values are pulled by `vercel pull --environment=production` before the
Vercel production build. They should not be added to GitHub Actions unless a
future workflow step explicitly needs them.

## Supabase

Supabase schema and Row Level Security changes should be managed by committed migrations, not dashboard-only edits.

Production deploys should not depend on undocumented manual database changes.
Production migrations are applied by `.github/workflows/production-deploy.yml`
using `supabase db push --db-url "$SUPABASE_DB_URL"` after the validation checks
pass and before the Vercel production deploy. Manual dashboard changes should be
backfilled into committed migrations before deployment.

Demo data for local development and safe staging/preview validation lives in
`supabase/seed.sql` and is documented in `docs/seed-data.md`. It is not a
production migration and must not be run against production data.

Supabase Auth should be configured with the deployed app URL as the site URL and
the app callback route as an allowed redirect URL:

- local callback: `http://localhost:3000/auth/callback`
- preview callback: the exact Vercel preview URL plus `/auth/callback` for any
  preview environment being manually tested
- production site URL: `https://quartetmemberfinder.org`
- production callback: `https://quartetmemberfinder.org/auth/callback`

The app's protected management routes use Supabase's anonymous public key on the
server and in browser-safe helpers. Service-role keys must stay server-only and
are not required for basic sign-in, sign-out, or protected route checks.

Sign-in should use email one-time codes rather than magic links. Supabase email
templates should include the OTP token so users can paste the code into the app
sign-in form. The callback route can remain available for compatibility, but
the app UI should not direct users to a magic-link flow.

## Resend

Resend should be used for transactional email, including auth-related email where appropriate and the app-mediated contact relay.

Preferred sender addresses should use the domain once DNS is configured, such as:

- `no-reply@quartetmemberfinder.org`
- `messages@quartetmemberfinder.org`
- `support@quartetmemberfinder.org`

Recommended initial sender:

```text
messages@quartetmemberfinder.org
```

Resend setup:

1. Add `quartetmemberfinder.org` as a sending domain in Resend.
2. Choose the same region/account that will be used by production.
3. Copy the DNS records Resend provides for SPF/return-path, DKIM, and any
   recommended DMARC record.
4. Add those records in Namecheap Advanced DNS exactly as Resend displays them.
5. Wait for Resend verification to pass.
6. Set Vercel Production environment values:

```text
RESEND_API_KEY=<production Resend API key>
RESEND_FROM_EMAIL=messages@quartetmemberfinder.org
```

Do not commit Resend API keys or DNS verification secrets to the repository.

The contact relay requires these server-side values in production:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is used only in server code to look up the resolved
recipient email after RLS and the contact-request trigger have accepted the
request. It must not be exposed to browser code. If Resend or service-role
configuration is missing, contact requests can still be stored, but notification
delivery is deferred.

Help-page feedback stores authenticated submissions in Supabase and sends a
Resend notification to the project-team inbox at `cubuff98@gmail.com`. Admin
review should use service-role/server access or a future protected admin
surface; feedback must not be exposed through public routes or browser-side
service-role code.

## Maps and geocoding

The current public discovery map does not require a third-party map tile
provider. It uses public discovery-view location summaries and country/region
anchors to render approximate regional markers.

Approximate radius search can use server-side Mapbox geocoding. Keep
`MAPBOX_GEOCODING_TOKEN` server-only. Set `MAPBOX_GEOCODING_PERMANENT=true`
only when the Mapbox account is allowed to store geocoding results, because
profile/listing save actions persist private approximate coordinates in
Supabase.

When interactive tiles are added, use a provider-compatible MapLibre setup
rather than sending exact home coordinates to the browser. Provider
configuration should be optional and documented in `.env.example`. Expected
future public configuration values are:

- `NEXT_PUBLIC_MAP_TILE_URL_TEMPLATE`
- `NEXT_PUBLIC_MAP_ATTRIBUTION`
- `NEXT_PUBLIC_MAP_STYLE_URL` when using a hosted vector style

Geocoding provider secrets, if any, must be server-only. Browser-rendered map
props should contain approximate public labels, regional anchors, rounded
distances, or jittered/blurred marker positions, never exact private
latitude/longitude or private address fields.

## Product analytics

PostHog product analytics is optional. Set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel
Production to enable it, and set `NEXT_PUBLIC_POSTHOG_HOST` if the project uses
a non-default PostHog region.

The app sends only allowlisted privacy-safe product events through
`/api/analytics` or trusted server actions. Do not configure session replay,
autocapture of form fields, advertising pixels, or direct user identification
without a separate privacy review and documentation update.

## Production readiness checklist

Use `docs/launch-readiness.md` as the final pre-launch checklist. It links the
deployment, privacy, Supabase, Resend, smoke test, accessibility, and domain
verification work into one launch sign-off artifact.

Before public launch:

- CI passes on pull requests
- production build succeeds
- Supabase migrations are documented and applied
- RLS policies have been reviewed
- environment variables are documented
- Vercel project is linked to the GitHub repository
- `quartetmemberfinder.org` is added to the Vercel project and verified
- `www.quartetmemberfinder.org` redirects to `quartetmemberfinder.org`
- Namecheap DNS points the apex and `www` hosts to Vercel
- `NEXT_PUBLIC_APP_URL` is set to `https://quartetmemberfinder.org` in Vercel Production
- Supabase Auth site URL and redirect URLs include the production domain
- Resend domain authentication is configured
- Namecheap DNS includes Resend authentication records
- privacy model is reflected in UI and database access patterns
- contact relay is rate-limited or otherwise protected from obvious abuse
