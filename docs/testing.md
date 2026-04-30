# Testing

Unit tests live in `test/` and are grouped by the core logic they protect:

- `*-form.test.ts` covers singer profile and quartet listing normalization.
- `approximate-location.test.ts` covers privacy-safe location summaries, global
  distance calculations, and miles/kilometers display.
- `discovery-filters.test.ts` covers public search filter parsing.
- `contact-relay.test.ts` covers app-mediated contact request parsing,
  return-path safety, notification copy, and rate-limit constants.
- `supabase-schema.test.ts` covers migration-level RLS and discovery-view
  privacy expectations.

New PRs that add or change reusable app logic should add or update unit tests in
the matching file. Add a new domain-specific test file when a helper does not
fit an existing area.

Run the unit suite with:

```bash
npm run test:run
```

Before finishing a PR, also run:

```bash
npm run lint
npm run typecheck
npm run build
```

Location, search, and distance tests should include non-US examples whenever the
helper behavior touches geography, distance units, or public location display.
Privacy-sensitive tests should assert that public helpers do not expose private
postal codes, exact coordinates, email addresses, or phone numbers.
