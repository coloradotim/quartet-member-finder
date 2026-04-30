# Manual Smoke Test Plan

Use this plan before launch, after deployment or environment changes, and after
major feature work. It is intentionally manual for now; a later test suite can
automate the highest-value flows.

Record the environment, commit SHA, browser, viewport, tester, and date before
starting.

## Environments

- Local: run against `http://localhost:3000` after applying migrations and, when
  useful, loading `supabase/seed.sql`.
- Preview: run against the Vercel preview URL for the PR or branch. Use a safe
  preview/staging Supabase project only.
- Production: run after deployment with real production configuration. Do not
  load demo seed data in production.

For preview and production, confirm GitHub CI passed before starting manual
validation.

## Public Home Page

1. Open `/`.
2. Pass: the page loads without a server error and clearly names Quartet Member
   Finder.
3. Pass: primary links to Find, Help, Privacy, My Singer Profile, and Quartet
   Mode are present.
4. Fail: the page exposes private email addresses, phone numbers, exact
   coordinates, private postal codes, or raw database IDs.

## Public Help Page

1. Open `/help`.
2. Pass: help topics explain singer discovery, quartet openings, map discovery,
   contact, privacy, and feedback in practical language.
3. Signed out pass: feedback asks the visitor to sign in instead of showing a
   public anonymous feedback form.
4. Signed in pass: the private feedback form appears at `/help#feedback`.
5. Fail: help copy promises real-time chat, formal moderation, or public contact
   details that the app does not provide.

## Public Privacy Page

1. Open `/privacy`.
2. Pass: the page explains approximate location, visibility controls, discovery
   views, and contact relay behavior.
3. Pass: it states that exact home locations and direct contact details are not
   publicly displayed by default.
4. Fail: the page implies a US-only location model or says ZIP code is required.

## Sign-In Flow

1. Open `/sign-in?next=%2Fapp`.
2. Enter a test account email for the current environment.
3. Pass: the app sends or accepts the email one-time code according to the
   configured Supabase Auth environment.
4. Pass: an invalid or expired code shows a recoverable error.
5. Pass: a valid code routes to `/app` or the onboarding step when needed.
6. Fail: sign-in requires a password, exposes service-role errors, or redirects
   to an unsafe external `next` URL.

## Signed-In Dashboard

1. Sign in and open `/app`.
2. Pass: the dashboard loads behind authentication.
3. Pass: it distinguishes My Singer Profile, Find, Quartet Mode, Account
   Settings, Help, and Privacy.
4. Pass: signed-out users visiting `/app` are redirected to sign in.
5. Fail: dashboard links point to missing routes or expose another user's data.

## My Singer Profile

1. Open `/app/profile`.
2. Create or edit a singer profile with:
   - display name: `Smoke Test Singer`
   - parts: Lead and Baritone
   - goals: Pickup and Learning
   - country: United Kingdom
   - region: England
   - locality: Manchester
   - private postal code: `M1 TEST`
   - public location label: `Manchester, UK area`
   - travel radius: `40`
   - visible: on
3. Pass: saving succeeds and the form reloads with the saved values.
4. Pass: `/singers?country=United+Kingdom&locality=Manchester&part=lead`
   includes the profile when visible.
5. Pass: public singer results show approximate location only, such as
   `Manchester, UK area`, and do not show `M1 TEST`.
6. Set visibility off and save.
7. Pass: the profile no longer appears in public singer search or map discovery.
8. Fail: public UI exposes private postal code, formatted private address, exact
   latitude/longitude, email address, or phone number.

## Quartet Mode

1. Open `/app/listings`.
2. Create or edit a quartet listing with:
   - name: `Smoke Test Quartet`
   - covered parts: Tenor and Bass
   - needed parts: Lead and Baritone
   - goals: Regular Rehearsal and Contest
   - country: Ireland
   - region: Leinster
   - locality: Dublin
   - private postal code: `D02 TEST`
   - public location label: `Dublin, Ireland area`
   - travel radius: `50`
   - visible: on
3. Pass: saving succeeds and covered/needed parts remain distinct.
4. Pass: `/quartets?country=Ireland&locality=Dublin&part=lead` includes the
   listing when visible.
5. Pass: public quartet results show parts covered, parts needed, goals, and
   approximate location only.
6. Set visibility off and save.
7. Pass: the listing no longer appears in public quartet search or map
   discovery.
8. Fail: public UI exposes the owner user ID, private postal code, exact
   coordinates, email address, or phone number.

## Find

1. Open `/find`.
2. Filter by country, region/locality, part, goal, and looking-for mode using
   data known to exist in the environment.
3. Pass: valid filters narrow the consolidated results without crashing.
4. Pass: the approximate map appears above the results table.
5. Pass: the table distinguishes singer profiles from quartet openings.
6. Pass: empty results show helpful next actions, including clearing filters.
7. Fail: hidden or inactive profiles/listings appear in public results.
8. Fail: public UI exposes owner user IDs, private postal codes, exact
   coordinates, email addresses, or phone numbers.

## Detailed Quartet Opening Search

1. Open `/quartets`.
2. Filter by country, region/locality, part, goal, availability, and travel
   radius using data known to exist in the environment.
3. Pass: valid filters narrow results without crashing.
4. Pass: empty results show helpful next actions, including clearing filters.
5. Pass: contact buttons are available for visible listings.
6. Fail: hidden or inactive listings appear in public results.

## Detailed Singer Search

1. Open `/singers`.
2. Filter by country, region/locality, part, goal, availability, experience, and
   travel radius using data known to exist in the environment.
3. Pass: valid filters narrow results without crashing.
4. Pass: empty results show helpful next actions, including clearing filters.
5. Pass: contact buttons are available for visible profiles.
6. Fail: hidden or inactive singer profiles appear in public results.

## Compatibility Map View

1. Open `/map`.
2. Test filters for United States and at least one non-US location, such as
   Ireland or United Kingdom.
3. Pass: visible singer profiles and quartet listings with public locations
   appear as approximate region markers.
4. Pass: repeated locations cluster without exposing private exact coordinates.
5. Pass: markers are still usable on mobile width.
6. Fail: markers use exact home pins, raw latitude/longitude, or private postal
   code labels.

## Contact Relay

1. Sign in as a user who does not own the target profile/listing.
2. Open a visible singer or quartet result.
3. Send a short contact request.
4. Pass with Resend configured: the request is stored and the user sees a sent
   confirmation.
5. Pass without Resend configured: the request is stored and the user sees the
   stored/deferred notification message.
6. Pass: recipient email address is never shown to the sender.
7. Pass: a user cannot contact their own profile or listing.
8. Fail: browser form accepts recipient email, recipient user ID, or direct
   contact details as trusted input.

## Authenticated Feedback Form

1. Sign in and open `/help#feedback`.
2. Submit feedback with type `Bug` and a short message.
3. Pass: the user sees a success message.
4. Pass: feedback is tied to the signed-in account server-side.
5. Pass: repeated submissions eventually hit the rate limit.
6. Fail: signed-out users can submit feedback, or the public site displays
   feedback submissions.

## Account Settings

1. Open `/app/settings`.
2. Pass: the page distinguishes Account Settings, My Singer Profile, and
   Quartet Mode.
3. Change account display name and preferred distance unit.
4. Pass: saving succeeds and the selected account-level preferences remain
   selected.
5. Click re-run onboarding.
6. Pass: onboarding state is cleared and the app routes to onboarding with a
   safe return path.
7. Fail: Account Settings duplicates singer profile or quartet listing fields
   instead of staying account-level.

## Sign-Out

1. From a signed-in app route, use Sign out.
2. Pass: the session ends and protected routes redirect to sign in.
3. Pass: public pages remain accessible after sign-out.
4. Fail: protected app pages remain accessible with private data after sign-out.

## Mobile Sanity Checks

Run these at a narrow mobile viewport, around 390 px wide:

1. Open `/`, `/find`, `/singers`, `/quartets`, `/map`, `/help`, `/privacy`, and
   `/app` while signed in where required.
2. Pass: text does not overlap controls, cards, forms, or navigation.
3. Pass: forms can be completed without horizontal scrolling.
4. Pass: contact and feedback text areas are usable.
5. Fail: critical actions disappear, overlap, or become impossible to tap.

## Final Privacy Sweep

Before signing off, search the visible public pages for:

- `@`
- private postal-code test values such as `M1 TEST` or `D02 TEST`
- `latitude`
- `longitude`
- `user_id`
- `owner_user_id`
- `recipient_user_id`

Pass: none of those private markers appear in public discovery pages, public
cards, public map markers, or page source intended for browser display.

Fail: any private contact field, exact-location field, or ownership identifier
appears in public output.
