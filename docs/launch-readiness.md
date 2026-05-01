# Launch Readiness Checklist

Use this checklist before opening Quartet Member Finder to real users. It is an
audit artifact: it summarizes readiness signals and points to the docs or issues
that own the underlying work.

Status key:

- Complete: implemented or configured and expected to stay in place.
- Manual: verify during the final launch pass.
- Follow-up: acceptable for launch only if the tradeoff is understood.

## Release Gate

Do not launch publicly until all Manual items below have a dated sign-off from
the final smoke test environment.

Record before launch:

- Date:
- Tester:
- Browser and viewport:
- Production commit SHA:
- Production deployment URL:
- Supabase project:
- Resend sender:
- Smoke test notes:

## Source Control and CI

| Status   | Item                                                                     | Verification                                                                 |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Complete | GitHub CI runs required validation on PRs and `main`.                    | `.github/workflows/ci.yml`; required checks are `guardrails` and `validate`. |
| Complete | Required branch protection is configured for `main`.                     | Issue #13; `docs/deployment.md#branch-protection-and-merge-policy`.          |
| Complete | `main` requires `guardrails`, `validate`, and `Vercel` before merge.     | GitHub branch protection settings.                                           |
| Complete | Squash merge and auto-merge are the normal protected-branch path.        | GitHub repository settings; `docs/deployment.md`.                            |
| Manual   | Confirm the launch commit merged through a PR and did not bypass checks. | Check the merged PR and GitHub Actions run for the production commit.        |

## Production Deployment

| Status    | Item                                                                                                             | Verification                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Complete  | Production deploys run from GitHub Actions on pushes to `main`.                                                  | Issue #52; `.github/workflows/production-deploy.yml`.                   |
| Complete  | Production deploy workflow applies Supabase migrations before Vercel deploy when migrations changed.             | `docs/deployment.md#github-actions-production-deployment`.              |
| Complete  | Vercel builds and deploys prebuilt production output from the workflow.                                          | Production Deploy workflow logs.                                        |
| Manual    | Confirm latest Production Deploy workflow completed successfully for the launch commit.                          | GitHub Actions, `Production Deploy` run on `main`.                      |
| Manual    | Confirm latest Vercel production deployment is `READY` and promoted.                                             | Vercel deployment dashboard or CLI/API.                                 |
| Follow-up | Disable duplicate direct production deploys from the Vercel GitHub integration if they remain active for `main`. | Keep PR previews enabled; production should be the GitHub Actions path. |

## Domains and DNS

| Status   | Item                                                                      | Verification                                                             |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Complete | Canonical production domain is `https://quartetmemberfinder.org`.         | Issue #11; `docs/deployment.md#vercel-custom-domain-setup`.              |
| Complete | `www.quartetmemberfinder.org` redirects to the apex domain.               | Browser or `curl -I` check.                                              |
| Manual   | Confirm apex domain loads the latest production deployment.               | Visit `https://quartetmemberfinder.org`.                                 |
| Manual   | Confirm `www` permanently redirects to `https://quartetmemberfinder.org`. | Visit `https://www.quartetmemberfinder.org` or inspect response headers. |
| Manual   | Confirm Namecheap DNS still points apex and `www` to Vercel records.      | Namecheap Advanced DNS and Vercel domain verification.                   |

## Environment Variables and Secrets

| Status   | Item                                                                                                                                    | Verification                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Complete | Required GitHub deployment secrets are documented.                                                                                      | `docs/deployment.md#github-production-deployment-secrets`; `docs/environment.md`. |
| Complete | Runtime-only server secrets stay in Vercel Production, not browser code.                                                                | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.               |
| Complete | Browser-exposed values are limited to public `NEXT_PUBLIC_*` configuration.                                                             | `.env.example`; `docs/environment.md`.                                            |
| Manual   | Confirm GitHub has production workflow secrets for deployment.                                                                          | GitHub repository or `production` environment secrets.                            |
| Manual   | Confirm Vercel Production has runtime secrets for contact and feedback email.                                                           | Vercel project environment variables.                                             |
| Manual   | If analytics is desired for launch, confirm Vercel Production has `NEXT_PUBLIC_POSTHOG_KEY` and the correct `NEXT_PUBLIC_POSTHOG_HOST`. | Vercel project environment variables and PostHog project settings.                |
| Manual   | Confirm no real `.env` file or secret value is tracked by git.                                                                          | CI guardrails and local `git status`.                                             |

## Supabase Database, RLS, and Auth

| Status   | Item                                                                                                                | Verification                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Complete | Schema and RLS changes are committed as migrations.                                                                 | `supabase/migrations/`; `docs/supabase-contract.md`.            |
| Complete | Public discovery routes use privacy-safe views, not private base tables.                                            | `singer_discovery_profiles`, `quartet_discovery_listings`.      |
| Complete | Public views omit private postal codes, exact coordinates, email addresses, phone numbers, user IDs, and owner IDs. | `docs/supabase-contract.md#row-level-security-expectations`.    |
| Complete | Contact requests are authenticated and server/database-resolve recipients.                                          | `contact_requests` contract in `docs/supabase-contract.md`.     |
| Complete | Feedback submissions are authenticated and private.                                                                 | `feedback_submissions` contract in `docs/supabase-contract.md`. |
| Manual   | Confirm production migration history is current for the launch commit.                                              | Production Deploy logs or Supabase migration list.              |
| Manual   | Review RLS policies before launch after any database change.                                                        | Supabase SQL editor or migration review.                        |
| Manual   | Confirm Supabase Auth site URL is `https://quartetmemberfinder.org`.                                                | Supabase Auth URL configuration.                                |
| Manual   | Confirm Supabase Auth redirect URLs include `https://quartetmemberfinder.org/auth/callback`.                        | Supabase Auth redirect configuration.                           |
| Manual   | Confirm OTP email sign-in works in production.                                                                      | `docs/smoke-test-plan.md#sign-in-flow`.                         |

## Resend Email

| Status   | Item                                                                                      | Verification                                           |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Complete | Resend is the preferred transactional email provider.                                     | `docs/deployment.md#resend`.                           |
| Complete | Feedback email goes to the project-team inbox at `cubuff98@gmail.com`.                    | Issue #56; `docs/privacy-model.md#feedback-model`.     |
| Complete | Contact relay email does not expose recipient email to the sender.                        | `docs/privacy-model.md#contact-model`.                 |
| Manual   | Confirm Resend sender/domain is verified for production.                                  | Resend dashboard and Namecheap DNS.                    |
| Manual   | Confirm contact relay email is delivered from production.                                 | `docs/smoke-test-plan.md#contact-relay`.               |
| Manual   | Confirm feedback email is delivered from production with a Quartet Member Finder subject. | `docs/smoke-test-plan.md#authenticated-feedback-form`. |

## Public Product and Privacy

| Status   | Item                                                                                                                        | Verification                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Complete | Public Help page explains discovery, map behavior, contact, privacy, and feedback.                                          | `/help`; `docs/smoke-test-plan.md#public-help-page`. |
| Complete | Public Privacy page explains approximate location, visibility, and contact relay behavior.                                  | `/privacy`; `docs/privacy-model.md`.                 |
| Complete | Exact home addresses, exact coordinates, private postal codes, private emails, and phone numbers are not public by default. | `docs/privacy-model.md#public-search-principles`.    |
| Complete | Hidden singer profiles and quartet listings are excluded from public discovery.                                             | Discovery views and smoke tests.                     |
| Manual   | Run the final privacy sweep against public pages and page source.                                                           | `docs/smoke-test-plan.md#final-privacy-sweep`.       |
| Manual   | Confirm public pages do not imply real-time chat, formal moderation, or public direct contact details.                      | `/help` and `/privacy` copy review.                  |

## Product Analytics

| Status    | Item                                                                                                                           | Verification                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Complete  | Product analytics is disabled when PostHog configuration is missing.                                                           | `lib/analytics/product-analytics.ts`; `.env.example`. |
| Complete  | Analytics events use an allowlist and sanitize properties before forwarding to PostHog.                                        | `lib/analytics/product-analytics.ts`; tests.          |
| Complete  | Analytics avoids email addresses, names, message text, postal codes, exact coordinates, and raw private ownership identifiers. | `docs/privacy-model.md#product-analytics-model`.      |
| Manual    | Confirm PostHog receives page-view and funnel events in production if analytics is enabled.                                    | PostHog dashboard after smoke test.                   |
| Follow-up | Add richer analytics dashboards or funnels after launch behavior clarifies what matters.                                       | PostHog product analysis, not app code.               |

## Core User Flows

| Status   | Item                                                                                                                                                                                            | Verification                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Complete | Onboarding routes signed-in first-time users to a useful first action.                                                                                                                          | Issue #41; smoke test plan.                                          |
| Complete | Empty states provide useful next actions.                                                                                                                                                       | Issue #40; smoke test plan.                                          |
| Complete | My Singer Profile stores parts, goals, location, visibility, and private postal code separately.                                                                                                | `/app/profile`; `docs/privacy-model.md#singer-profile-management`.   |
| Complete | My Quartet Profile stores covered parts and needed parts separately.                                                                                                                            | `/app/listings`; `docs/privacy-model.md#quartet-listing-management`. |
| Complete | Find consolidates public discovery into filters, a privacy-safe interactive map, and result cards; detailed Singer and Quartet Opening routes remain available, while `/map` redirects to Find. | `/find`, `/singers`, `/quartets`.                                    |
| Manual   | Run the full manual smoke test plan on production before launch.                                                                                                                                | `docs/smoke-test-plan.md`.                                           |
| Manual   | Confirm seed/demo data is not loaded into production.                                                                                                                                           | `docs/seed-data.md`; Supabase production data review.                |

## Accessibility and Mobile

| Status    | Item                                                                                                | Verification                                                      |
| --------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Complete  | Pre-launch accessibility and mobile audit is documented.                                            | Issue #43; `docs/accessibility-mobile-audit.md`.                  |
| Complete  | Public and signed-in navigation have mobile-friendly tap targets.                                   | `/`, `/app`, and audit doc.                                       |
| Complete  | Forms have visible labels and server-rendered status/error semantics.                               | Sign-in, profile, listing, contact, feedback, and settings forms. |
| Complete  | Keyboard focus is visible for links, buttons, inputs, selects, textareas, and custom radio choices. | `app/globals.css`; audit doc.                                     |
| Manual    | Re-run mobile sanity checks around 390 px wide before launch.                                       | `docs/smoke-test-plan.md#mobile-sanity-checks`.                   |
| Follow-up | Add automated accessibility scanning to CI after launch or when UI stabilizes further.              | `docs/accessibility-mobile-audit.md#follow-up-issues`.            |

## Global Location and Non-US Assumptions

| Status   | Item                                                                                                | Verification                                                           |
| -------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Complete | Location fields are globally tolerant and avoid US-only validation.                                 | `docs/privacy-model.md#global-location-expectations`.                  |
| Complete | Search and smoke tests include non-US examples such as Manchester, Dublin, Toronto, or Melbourne.   | `docs/smoke-test-plan.md`.                                             |
| Complete | Distance display supports kilometers and miles.                                                     | `lib/location/approximate-location.ts`; tests.                         |
| Manual   | Verify at least one non-US singer profile and one non-US quartet listing in production smoke tests. | `docs/smoke-test-plan.md#my-singer-profile` and `#my-quartet-profile`. |

## Abuse and Spam Protections

| Status    | Item                                                                                       | Verification                                             |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Complete  | Contact requests require sign-in.                                                          | `docs/privacy-model.md#contact-model`.                   |
| Complete  | Contact relay has a basic sender-side rate limit.                                          | `docs/supabase-contract.md#contact-data-expectations`.   |
| Complete  | Feedback requires sign-in and has a basic authenticated rate limit.                        | `docs/privacy-model.md#feedback-model`.                  |
| Follow-up | Add reporting, blocking, and stronger admin abuse workflows when real usage requires them. | `docs/privacy-model.md#abuse-and-safety-considerations`. |

## Final Launch Sign-Off

Launch is ready only when:

- latest PR and production commit passed required GitHub checks
- Production Deploy completed successfully
- Vercel production deployment is ready and promoted
- `quartetmemberfinder.org` and `www.quartetmemberfinder.org` behave as expected
- Supabase migrations and Auth settings are verified
- Resend contact and feedback emails are verified
- full production smoke test plan is complete
- final privacy sweep passes
- accessibility/mobile manual checks pass
- any Follow-up items are accepted as post-launch work
