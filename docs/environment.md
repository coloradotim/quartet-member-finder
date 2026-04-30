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
