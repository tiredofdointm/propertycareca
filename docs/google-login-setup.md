# Google sign-in for the admin dashboard

The admin dashboard supports two ways to sign in:

1. **Email + password** — the original `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`
   env-var login.
2. **Sign in with Google** — one click, no password to remember. This page
   explains how to turn it on.

Google sign-in was previously impossible on this site because no OAuth
integration existed at all — there was nothing to log in *with*. The flow now
ships with the app; the only missing piece is a set of OAuth credentials that
**must** be created inside your own Google account (nobody else can do this
for you, because Google ties the consent screen to the account that owns it).

## One-time setup (about 10 minutes)

1. Go to <https://console.cloud.google.com/> and sign in with the Google
   account you want to manage the site with.
2. Create a project (or pick an existing one), e.g. `propertycareca`.
3. **OAuth consent screen** (APIs & Services → OAuth consent screen):
   - User type: **External**, then fill in the app name
     (`PropertyCareCA Admin`), support email, and developer email.
   - You do not need to submit for verification — only allowlisted admin
     emails will ever log in.
4. **Create credentials** (APIs & Services → Credentials → Create
   credentials → OAuth client ID):
   - Application type: **Web application**
   - Name: `propertycareca-admin`
   - Authorized redirect URIs — add BOTH:
     - `https://propertycareca.com/api/admin/auth/google/callback`
     - `http://localhost:3000/api/admin/auth/google/callback` (for local dev)
5. Copy the **Client ID** and **Client secret** into your environment:

   ```bash
   GOOGLE_OAUTH_CLIENT_ID=1234567890-abc123.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
   ```

6. Decide who is allowed in. `ADMIN_EMAIL` is always allowed; to allow more
   Google accounts, set a comma-separated list:

   ```bash
   GOOGLE_ADMIN_EMAILS=tiredofdointm@gmail.com,partner@example.com
   ```

7. Redeploy (or restart `npm run dev`). The login page at `/admin/login` now
   shows a **Sign in with Google** button automatically.

## How it works & security notes

- Clicking the button sends the browser to Google's consent screen; Google
  redirects back to `/api/admin/auth/google/callback` with a one-time code.
- The server exchanges the code directly with Google (over TLS) and reads the
  verified email from the resulting ID token, checking the token was issued
  for this app (`aud`) and that Google has verified the email.
- Only emails in `ADMIN_EMAIL` / `GOOGLE_ADMIN_EMAILS` are let in; everyone
  else sees "That Google account isn't authorized."
- A signed-in Google admin gets the exact same short-lived session cookie as
  a password login (`pc_admin_session`, 8 hours, httpOnly).

## Session separation

Each area of the platform keeps its own, independent session state — they
never mix:

| Area | Mechanism | Cookie / storage |
| --- | --- | --- |
| Admin dashboard | HMAC-signed session cookie | `pc_admin_session` |
| Google OAuth handshake | Short-lived state cookie (10 min) | `pc_google_oauth_state` |
| Customer attribution | Browser localStorage only | `pc_attribution` |
| Stripe Checkout | Hosted entirely on stripe.com | — |

Customers never get a login session at all, and the admin cookie is never
sent to Google or Stripe.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Button doesn't appear | `GOOGLE_OAUTH_CLIENT_ID`/`SECRET` not set where the app runs |
| `redirect_uri_mismatch` from Google | The redirect URI in the Cloud Console must match the deployed URL **exactly**, including `https://` and no trailing slash |
| "That Google account isn't authorized" | Add the email to `GOOGLE_ADMIN_EMAILS` (or use the `ADMIN_EMAIL` account) |
| "Google sign-in failed" | Usually an expired/reused code from the back button — just click the button again |
