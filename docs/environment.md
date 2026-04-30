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

Do not expose server-only values in browser code.

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

For production, add the deployed app URL and `/auth/callback` URL in the
Supabase dashboard before enabling sign-in links for users.
