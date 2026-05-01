# PostHog Analytics

Quartet Member Finder uses optional, privacy-safe PostHog product analytics to
understand whether early users can reach the useful parts of the app.

Analytics must answer product questions without collecting personal content.

## Configuration

Production event capture uses Vercel environment variables:

```text
NEXT_PUBLIC_POSTHOG_KEY=<PostHog project token>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Leave `NEXT_PUBLIC_POSTHOG_KEY` blank to disable analytics.

Dashboard creation is a local/admin operation and uses a PostHog personal API
key, not the project token:

```text
POSTHOG_ENVIRONMENT_ID=404599
POSTHOG_HOST=https://us.posthog.com
POSTHOG_PERSONAL_API_KEY=<personal API key>
```

Do not add `POSTHOG_PERSONAL_API_KEY` to Vercel or commit it to the repository.
`POSTHOG_PROJECT_ID` is accepted as a fallback name for older PostHog docs, but
`POSTHOG_ENVIRONMENT_ID` matches the current PostHog dashboard and insight API
paths.

## Event Model

Allowed events are defined in `lib/analytics/product-analytics.ts`.

Current events:

- `analytics_client_ready`
- `app_route_viewed`
- `sign_in_started`
- `sign_in_completed`
- `user_logged_in`
- `onboarding_viewed`
- `onboarding_intent_selected`
- `onboarding_completed`
- `onboarding_skipped`
- `singer_profile_saved`
- `singer_profile_visibility_changed`
- `quartet_listing_saved`
- `quartet_listing_visibility_changed`
- `discovery_search_submitted`
- `find_searched`
- `map_viewed`
- `contact_request_submitted`
- `message_sent`
- `message_viewed`
- `message_replied`
- `message_report_submitted`
- `feedback_submitted`

Allowed properties are intentionally narrow. They include route area, public
route path, filter-presence booleans, distance unit, result counts, search
origin type, target kind, participant role, reply count, visibility enabled
flags, feedback type, report category, generic status, and onboarding choice.
Route values are stripped of query strings and hash fragments, and UUID-looking
path segments are normalized to `[id]`.

Never send:

- email addresses
- display names
- profile bio or listing description text
- contact request or feedback message text
- postal codes
- exact latitude or longitude
- phone numbers
- raw private ownership or recipient identifiers

Signed-in server events may use a pseudonymous hash of the authenticated user ID
so funnel steps can be understood without identifying users by direct personal
information.

When adding or changing analytics:

1. Add the event name and each safe property key to
   `lib/analytics/product-analytics.ts`.
2. Prefer booleans, counts, coarse categories, and enum-like values.
3. Do not add raw IDs, user-entered text, contact details, precise location
   fields, or query strings.
4. Add or update tests in `test/product-analytics.test.ts`.
5. Update this document and `docs/privacy-model.md` if the event changes the
   privacy contract.

## Dashboards

Dashboard definitions live in `analytics/posthog/dashboards.json`.

Validate the dashboard spec locally with:

```bash
npm run posthog:dashboards:check
```

Sync the dashboards to PostHog with:

```bash
POSTHOG_PERSONAL_API_KEY=<personal-api-key> npm run posthog:dashboards:sync
```

For a narrow test loop, sync selected cards to the sandbox dashboard:

```bash
POSTHOG_PERSONAL_API_KEY=<personal-api-key> \
npm run posthog:dashboards:sync -- --sandbox --only top-routes,analytics-client-ready
```

Inspect or compare saved PostHog cards without editing them:

```bash
POSTHOG_PERSONAL_API_KEY=<personal-api-key> \
npm run posthog:dashboards:inspect -- --dashboard "Quartet Member Finder - Product Health"

POSTHOG_PERSONAL_API_KEY=<personal-api-key> \
npm run posthog:dashboards:inspect -- --insight "Top routes"

POSTHOG_PERSONAL_API_KEY=<personal-api-key> \
npm run posthog:dashboards:compare -- --left "Top routes" --right "Manual working Top routes"
```

The script targets environment `404599` by default and creates four dashboard
groups:

- `Quartet Member Finder - Product Health`: client readiness, active users,
  route health, and feedback.
- `Quartet Member Finder - Launch Funnel`: sign-in, onboarding, singer profile,
  and quartet listing activation.
- `Quartet Member Finder - Discovery & Contact`: discovery search, map usage,
  and contact request
  conversion.
- `Quartet Member Finder - Operations & Privacy`: visible listing/listing
  density, browser/device compatibility, and privacy-safe feedback signals.

The sync script is intentionally idempotent by dashboard and insight name:

- existing dashboards are patched by exact name
- existing insights are patched by exact name
- missing dashboards and insights are created
- `--only insight-key-1,insight-key-2` limits sync to selected insight keys
- `--sandbox` writes selected cards to the dashboard sync sandbox and prefixes
  insight names with `Sandbox -`
- insights use PostHog query objects wrapped as visualization nodes, not legacy
  filters
- event-property breakdowns are generated with PostHog query breakdown entries

## Launch Review

After analytics is deployed and the dashboard script has run:

1. Run the production smoke test plan.
2. Confirm PostHog receives page-view events.
3. Confirm at least one funnel event reaches each launch dashboard where the
   smoke test exercises that flow.
4. Confirm no event properties contain private contact, exact location, profile,
   listing, contact-message, or feedback-message content.

Use `/api/analytics/status` on the deployed app to verify that the production
build has the public PostHog configuration baked in. The route reports only
safe values: whether a key is present, whether a host is configured, the host
name, and Vercel environment/commit metadata when available. It never returns
the project token or personal API key.
