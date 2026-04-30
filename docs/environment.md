# Environment Variables

Keep real secrets out of the repository.

The app will need environment variables for:

- app base URL
- Supabase project URL
- Supabase public browser client value
- server-only Supabase administrative value, if needed for scripts or trusted server tasks
- Resend API access
- Resend sender email
- map/geocoding provider configuration

The current scaffold includes `.env.example` with safe placeholder keys:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_MAP_TILE_URL_TEMPLATE` optional future map tile template
- `NEXT_PUBLIC_MAP_ATTRIBUTION` optional future map attribution
- `NEXT_PUBLIC_MAP_STYLE_URL` optional future hosted map style

Do not expose server-only values in browser code.

## GitHub Actions

Pull request CI does not require production secrets. Production deployment uses
the GitHub `production` environment and the secrets documented in
`docs/deployment.md`.

GitHub Actions production deployment needs only the values required to validate,
apply migrations, and deploy through Vercel:

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

For production, use a verified sender on the project domain, such as:

```text
RESEND_FROM_EMAIL=messages@quartetmemberfinder.org
```

The browser submits only target IDs and message text. Recipient email lookup
must happen in server code after the database resolves the recipient.

## Maps

The MVP discovery map does not require a map provider. Optional public map
values are reserved for a future MapLibre/OpenStreetMap-compatible tile setup.
Geocoding secrets, if later needed, should be server-only and must not use the
`NEXT_PUBLIC_` prefix.
