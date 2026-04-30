# Seed And Demo Data

The project includes an intentional Supabase seed file at `supabase/seed.sql`
for local development and safe staging or preview validation.

The seed data is clearly fake. It creates deterministic demo users, singer
profiles, quartet openings, part rows, and a small number of contact requests so
search, map, visibility, and contact-target behavior can be tested without real
personal data.

Do not run the seed file against production.

## What It Includes

- multiple singer profiles
- multiple quartet openings
- Tenor, Lead, Baritone, and Bass examples
- visible and hidden profiles/listings
- United States, Canada, United Kingdom, Ireland, Australia, and New Zealand
  examples
- mixed miles/kilometers preferences
- goals, availability, experience/commitment, and travel-radius examples
- contact requests aimed at visible singer and quartet targets

Private postal-code fields use demo-only values such as `80521-DEMO` and
`M5V-DEMO`. Public labels stay approximate, such as `Manchester, UK area`.

## Load Locally

After applying migrations to a local Supabase database, load the seed data with:

```bash
supabase db reset
```

Supabase CLI runs `supabase/seed.sql` during a local reset. This recreates the
local database, applies migrations, and loads the demo rows.

## Load In Safe Staging

Only use staging or preview databases that can safely contain fake demo rows.
Apply the SQL intentionally with your normal Supabase SQL workflow, for example
through the SQL editor or a reviewed command-line connection.

The seed file starts by removing the deterministic demo users and their related
demo app rows, then recreates them. It does not delete non-demo users.

## Reset Or Remove Demo Data

To reset local demo data, run:

```bash
supabase db reset
```

To remove demo data from a staging database, delete the deterministic demo auth
users listed in `supabase/seed.sql`. The app tables reference those users with
cascade rules, and demo contact requests are also removed by the seed file
before reseeding.

## Production Safety

The seed file is not a migration and is not part of the production deployment
path. Production data should only change through approved application behavior,
reviewed migrations, or explicit operational procedures.
