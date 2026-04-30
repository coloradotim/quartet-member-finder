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

Expected local development values should be documented as the app scaffold is created.

Do not expose server-only values in browser code.
