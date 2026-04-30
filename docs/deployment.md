# Deployment Notes

Quartet Member Finder is intended to deploy through GitHub, Vercel, Supabase, and Resend.

## Accounts

Recommended project/admin account:

```text
quartetmemberfinder@gmail.com
```

Use that account where practical for Vercel, Supabase, Resend, and project administration so the app is separated from personal accounts.

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

Vercel should deploy preview builds for pull requests and production from `main`.

The production app should eventually use:

- `quartetmemberfinder.org`
- optionally `www.quartetmemberfinder.org` redirecting to the canonical host

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

## Supabase

Supabase schema and Row Level Security changes should be managed by committed migrations, not dashboard-only edits.

Production deploys should not depend on undocumented manual database changes.

Supabase Auth should be configured with the deployed app URL as the site URL and
the app callback route as an allowed redirect URL:

- local callback: `http://localhost:3000/auth/callback`
- production callback: `https://<production-host>/auth/callback`

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

The contact relay requires these server-side values in production:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is used only in server code to look up the resolved
recipient email after RLS and the contact-request trigger have accepted the
request. It must not be exposed to browser code. If Resend or service-role
configuration is missing, contact requests can still be stored, but notification
delivery is deferred.

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
- Resend domain authentication is configured
- domain DNS is configured
- privacy model is reflected in UI and database access patterns
- contact relay is rate-limited or otherwise protected from obvious abuse
