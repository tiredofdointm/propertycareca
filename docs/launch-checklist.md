# Launch checklist — propertycareca.com

Everything in the codebase is finished, tested, and merged. These are the only
remaining steps, and every one of them requires being logged into an account
that only the owner controls. Do them in order.

> **Tip:** open this file in a Claude session that can drive your browser
> (the *Claude for Chrome* extension or the desktop app) and say
> "walk me through docs/launch-checklist.md" — it can click through these
> steps with you using your own logged-in sessions.

---

## 1. Deploy the site (~30 min, once)

Follow **README → "Deploying to Google Cloud"** top to bottom:

1. Create the Cloud SQL Postgres instance and database.
2. Put secrets in Secret Manager: `DATABASE_URL`, `ADMIN_SESSION_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (generate with
   `npm run admin:hash-password -- 'your-password'`).
3. Run migrations through the Cloud SQL Auth Proxy (`npm run db:migrate`) —
   this also seeds the Objectives board.
4. `gcloud builds submit` with `_SITE_URL=https://propertycareca.com`.
5. Point the `propertycareca.com` DNS at the Cloud Run service
   (Cloud Run → Custom domains).

**Done when:** https://propertycareca.com loads the homepage and
`/admin/login` accepts your email + password.

## 2. Connect Stripe (~3 min)

Account: **Tired Studios** (`acct_1ToQJ3GtA5NHQJ7f`)

1. Copy both keys from
   <https://dashboard.stripe.com/acct_1ToQJ3GtA5NHQJ7f/apikeys>.
2. Log into the site → **Admin → Settings → Stripe account** → paste the
   secret key (`sk_...`) and publishable key (`pk_...`) → **Save** →
   **Test connection** (should report "Connected to Tired Studios").
3. At <https://dashboard.stripe.com/webhooks> → **Add endpoint**:
   - URL: `https://propertycareca.com/api/stripe/webhook`
   - Event: `checkout.session.completed`
4. Copy the endpoint's **signing secret** (`whsec_...`) into
   **Admin → Settings → Webhook signing secret** → Save.

**Done when:** a test booking's deposit checkout completes and the booking
flips to "deposit paid" in Admin → Bookings.

## 3. Enable Google sign-in (~10 min)

Follow **docs/google-login-setup.md** step by step (create the OAuth client
in Google Cloud Console, set `GOOGLE_OAUTH_CLIENT_ID` /
`GOOGLE_OAUTH_CLIENT_SECRET` / `GOOGLE_ADMIN_EMAILS` on the Cloud Run
service, redeploy).

**Done when:** `/admin/login` shows a "Sign in with Google" button and your
Google account gets into the dashboard.

## 4. Launch Google Ads (~30 min)

Follow **docs/google-ads-campaign-plan.md**:

1. In <https://ads.google.com>: create the three conversion actions
   (Lead, Booking, Deposit) and the first campaign from the plan.
2. Set the tracking env vars as Cloud Build substitutions
   (`_GTM_ID` or `_GA_MEASUREMENT_ID` + `_GOOGLE_ADS_*`) and redeploy —
   they are baked in at build time (see README → Analytics).

**Done when:** Admin → Campaigns starts attributing leads/bookings to
`utm_source=google`.

---

## After launch

- Track progress in **Admin → Objectives** — items 5–8 on the seeded board
  map to this checklist.
- Prices, fees, and the Stripe account can be changed any time in
  **Admin → Settings**; no redeploy needed.
