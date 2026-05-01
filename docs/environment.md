# Environment Variables

Keep real secrets out of the repository.

The app will need environment variables for:

- app base URL
- Supabase project URL
- Supabase public browser client value
- optional PostHog product analytics configuration
- server-only Supabase administrative value, if needed for scripts or trusted server tasks
- Resend API access
- Resend sender email
- server-only admin email allowlist
- map/geocoding provider configuration

The current scaffold includes `.env.example` with safe placeholder keys:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` optional privacy-safe product analytics project key
- `NEXT_PUBLIC_POSTHOG_HOST` optional PostHog host, defaulting to the US ingest host
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAILS` server-only comma-separated allowlist for `/app/admin`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` optional public Mapbox browser token for
  the interactive discovery map
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` optional Mapbox style URL
- `NEXT_PUBLIC_MAPBOX_PROJECTION` optional Mapbox GL projection, defaulting to
  `globe`

Do not expose server-only values in browser code.

## GitHub Actions

Pull request CI does not require production secrets. Production deployment uses
the GitHub `production` environment and the secrets documented in
`docs/deployment.md`.

GitHub Actions production deployment needs only the values required to validate,
apply migrations, and deploy through Vercel. Store them as repository secrets or
as `production` environment secrets when environment-level protection is in use:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_URL`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

Vercel remains the source for runtime-only server secrets during production
build/deploy:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAILS`

## Supabase Auth

The app uses Supabase Auth for signed-in management pages.

Required public values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Only the Supabase anonymous browser key should use the `NEXT_PUBLIC_` prefix.
Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client components, browser helper
code, or public environment variables.

For local development, configure the Supabase Auth site URL and redirect URLs to
allow:

- `http://localhost:3000`
- `http://localhost:3000/auth/callback`

For preview, add the exact Vercel preview URL and `/auth/callback` URL for the
preview environment being manually tested.

For production, configure:

- site URL: `https://quartetmemberfinder.org`
- redirect URL: `https://quartetmemberfinder.org/auth/callback`

Set Vercel Production `NEXT_PUBLIC_APP_URL` to
`https://quartetmemberfinder.org` after the domain is verified.

Sign-in uses email one-time codes. Configure Supabase email templates to send
the OTP token and avoid presenting the flow as a magic link in app copy.

## Contact Relay

The contact relay stores authenticated contact requests in Supabase and sends
recipient notifications through Resend.

Required server-only values for notification delivery:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Message reports and the admin console also require:

- `ADMIN_EMAILS`, a comma-separated list of signed-in admin email addresses

For production, use a verified sender on the project domain, such as:

```text
RESEND_FROM_EMAIL=messages@quartetmemberfinder.org
```

The browser submits only target IDs and message text. Recipient email lookup
must happen in server code after the database resolves the recipient.

## Maps

The discovery map uses Mapbox GL JS. Set `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in
Vercel Production and Preview to render the interactive map. This must be a
public `pk...` token with no secret scopes. `NEXT_PUBLIC_MAPBOX_PROJECTION`
defaults to `globe` so the primary map is not Web Mercator.

Server-side geocoding uses separate `MAPBOX_GEOCODING_*` values. Geocoding
secrets should be server-only and must not use the `NEXT_PUBLIC_` prefix.

## Product Analytics

PostHog analytics is optional and disabled when `NEXT_PUBLIC_POSTHOG_KEY` is
blank.

When enabled, analytics uses an internal app endpoint that accepts only
allowlisted product events and safe properties. The app may track route views and
high-level funnel events such as onboarding completion, profile/listing saves,
profile/listing visibility changes, discovery searches, map views, contact
request/message submission, message views/replies/reports, and feedback
submission.

Do not send email addresses, display names, profile/listing text, contact or
feedback message text, postal codes, exact coordinates, phone numbers, or raw
private ownership identifiers to PostHog.

Set `NEXT_PUBLIC_POSTHOG_HOST` if the project uses a non-default PostHog region,
for example `https://eu.i.posthog.com`.
