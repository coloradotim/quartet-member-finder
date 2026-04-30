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
- `SUPABASE_SERVICE_ROLE_KEY` for server-only administrative scripts, never browser code
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
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
```

Preview should use a safe preview/staging Supabase project if available, not
production data. For preview builds, set `NEXT_PUBLIC_APP_URL` to the exact
preview URL being tested or keep a documented preview/staging host with matching
Supabase Auth redirects.

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

The repository uses `.github/workflows/ci.yml` for baseline validation on pull
requests and pushes to `main`.

Current CI assumptions:

- Node.js 22 is the supported CI runtime.
- npm is the package manager, with dependency installation through `npm ci`.
- Dependency caching uses the npm cache support in `actions/setup-node`.
- Basic validation does not require secrets or deployed service credentials.

The CI workflow must fail the build if any of these commands fail:

- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`

Before launch, after deployment changes, and after major feature work, run the
manual smoke test plan in `docs/smoke-test-plan.md` against the relevant local,
preview, or production environment.

## Supabase

Supabase schema and Row Level Security changes should be managed by committed migrations, not dashboard-only edits.

Production deploys should not depend on undocumented manual database changes.

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

The current public discovery map does not require a third-party map or geocoder
environment variable. It uses public discovery-view location summaries and
country/region anchors to render approximate regional markers.

When interactive tiles or geocoding are added, use a provider-compatible
MapLibre setup rather than sending exact home coordinates to the browser.
Provider configuration should be optional and documented in `.env.example`.
Expected future public configuration values are:

- `NEXT_PUBLIC_MAP_TILE_URL_TEMPLATE`
- `NEXT_PUBLIC_MAP_ATTRIBUTION`
- `NEXT_PUBLIC_MAP_STYLE_URL` when using a hosted vector style

Geocoding provider secrets, if any, must be server-only. Browser-rendered map
props should contain approximate public labels, regional anchors, rounded
distances, or jittered/blurred marker positions, never exact private
latitude/longitude or private address fields.

## Production readiness checklist

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
