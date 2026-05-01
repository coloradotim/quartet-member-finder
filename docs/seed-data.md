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

## Production Demo Batch

Issue #72 uses a separate, explicit production demo-data path:
`supabase/prod-demo-seed.sql`.

Batch ID: `QMF_PROD_DEMO_20260501`

The production demo batch creates only clearly fake users and rows:

- auth emails match `qmf-demo+%@example.invalid`
- display names and listing names start with `QMF Demo`
- demo text fields include `QMF_PROD_DEMO_20260501:`
- deterministic demo user IDs start with `72000000-0000-4000-8000-`

The current schema does not have `is_demo` or `test_batch_id` columns on the app
tables, so the batch uses the strict email, name, message, and deterministic-ID
conventions above. Auth metadata also includes the batch ID.

Load production demo data only when intentionally testing production:

```bash
QMF_PROD_DEMO_CONFIRM=QMF_PROD_DEMO_20260501 npm run seed:prod-demo
```

For a local dry run against the local Supabase database, use:

```bash
QMF_PROD_DEMO_CONFIRM=QMF_PROD_DEMO_20260501 npm run seed:prod-demo -- --local
```

The loader defaults to the linked Supabase project and refuses to run unless the
confirmation environment variable exactly matches the batch ID.

## Production Demo Verification

After loading the batch, confirm the expected fake data exists:

```sql
select count(*) as demo_users
from auth.users
where email like 'qmf-demo+%@example.invalid';

select count(*) as demo_singer_profiles
from public.singer_profiles
where display_name like 'QMF Demo%';

select count(*) as visible_demo_singer_profiles
from public.singer_discovery_profiles
where display_name like 'QMF Demo%';

select count(*) as demo_quartet_listings
from public.quartet_listings
where name like 'QMF Demo%';

select count(*) as visible_demo_quartet_listings
from public.quartet_discovery_listings
where name like 'QMF Demo%';

select count(*) as demo_contact_requests
from public.contact_requests
where message_body like 'QMF_PROD_DEMO_20260501:%';
```

Expected counts for batch `QMF_PROD_DEMO_20260501` are 18 demo users, 12 singer
profiles, 11 visible singer discovery rows, 6 quartet listings, 5 visible
quartet discovery rows, and 4 contact requests.

## Production Demo Cleanup

Issue #73 should remove this batch by deleting only auth users whose emails
match `qmf-demo+%@example.invalid` or whose IDs are in the deterministic
`72000000-0000-4000-8000-...` batch range. The app tables reference auth users
with cascade rules, so singer profiles, quartet listings, part rows, and
demo-owned contact requests are removed with those users.

For extra safety, cleanup can first delete contact requests whose
`message_body` starts with `QMF_PROD_DEMO_20260501:`. Do not delete rows by broad
table truncation, by non-demo names, or by real owner/admin user attributes.
