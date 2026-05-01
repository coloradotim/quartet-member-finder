# Admin Moderation

Quartet Member Finder has a minimal signed-in admin console for launch safety
workflows.

## Access

Open `/app/admin` after signing in. Admin access is granted with the server-only
`ADMIN_EMAILS` environment variable, a comma-separated list of account email
addresses.

To grant or revoke access:

1. Update `ADMIN_EMAILS` in Vercel Production.
2. Redeploy the app so the server runtime reads the new allowlist.
3. Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
   `ADMIN_EMAILS` out of browser code and public logs.

Unauthorized signed-in users see a generic not-authorized page.

## Review A Report

1. Open `/app/admin`.
2. Select a report.
3. Review the report category, reporter note, message/contact request context,
   reporter user ID, reported user ID, reported profile/listing context, and
   prior report count for the reported account.
4. Use the action forms only after reviewing the report context.

## Admin Actions

The console supports launch-level actions:

- Hide the reported singer profile from discovery.
- Hide the reported quartet profile/opening from discovery.
- Block the reported account from sending additional first-contact messages or
  replies.
- Mark a report reviewed, action taken, or dismissed with admin notes.
- Permanently block an account, which hides the account's public profiles and
  blocks future messaging.

Blocked users receive only a generic message-send error. Do not expose private
moderation notes or report history to ordinary users.

## Permanent Block And Deletion

Permanent block is the strongest in-app action. It should be used for serious or
repeated abuse after review. Account deletion is not the default response and is
not performed directly by the app.

If deletion is warranted:

1. Preserve report IDs and any action notes needed for audit context.
2. Confirm public profiles have been hidden and messaging is blocked.
3. Delete the auth user manually in Supabase Auth using project-owner access.
4. Record the manual action in the relevant report admin notes when practical.

Do not delete user data casually. Prefer the action ladder: review, hide public
content if needed, block messaging if needed, mark action taken, permanently
block for serious abuse, then delete only when appropriate.
