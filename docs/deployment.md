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

## Supabase

Supabase schema and Row Level Security changes should be managed by committed migrations, not dashboard-only edits.

Production deploys should not depend on undocumented manual database changes.

## Resend

Resend should be used for transactional email, including auth-related email where appropriate and the app-mediated contact relay.

Preferred sender addresses should use the domain once DNS is configured, such as:

- `no-reply@quartetmemberfinder.org`
- `messages@quartetmemberfinder.org`
- `support@quartetmemberfinder.org`

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
