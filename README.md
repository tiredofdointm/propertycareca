# PropertyCareCA (propertycareca.com)

A California property care / maintenance business platform: marketing site,
service catalog, Estimate & Enterprise plans, quote requests, online booking
with Stripe deposit payments, and an admin dashboard for managing leads,
bookings, prices/fees, the connected Stripe account, and business objectives.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, Drizzle ORM +
PostgreSQL, Stripe Checkout, cookie-based admin auth (email/password and
Sign in with Google). Packaged for Google Cloud Run + Cloud SQL.

## Pricing model

Public pages never show fixed prices. The **Estimate plan** gives every
customer a free custom quote (pricing varies by location, scope, and how
much needs doing each visit), and the **Enterprise plan** (`/plans`) is a
custom-priced partnership for realtors, landlords, property managers, and
construction firms. Deposits, internal estimate bases, and an optional
booking fee are all editable at **Admin → Settings** — no redeploy needed.

## Local development

Prerequisites: Node 22+, a local PostgreSQL instance (via `docker compose` or
a native install).

```bash
cp .env.example .env.local
# fill in DATABASE_URL, ADMIN_SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH

docker compose up -d db        # starts Postgres on localhost:5432
npm install
npm run db:migrate             # applies drizzle/*.sql to the database
npm run db:seed                # optional: sample leads/bookings for the admin dashboard
npm run dev
```

Generate an admin password hash with:

```bash
npm run admin:hash-password -- 'your-password'
```

The command prints an `ADMIN_PASSWORD_HASH=...` line ready to paste into
`.env.local` — every `$` is already escaped. **This escaping matters**: Next.js
expands unescaped `$name` sequences in `.env` files, which silently corrupts
bcrypt hashes (they contain `$2b$12$...`). If you ever hand-edit the hash,
escape each `$` as `\$`.

Stripe deposit payments can be configured two ways: paste your keys at
**Admin → Settings** (stored encrypted in the database, switchable to a new
Stripe account any time, with a "Test connection" button), or set
`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` env vars as a fallback. The
dashboard-connected account always wins. Without either, booking still works
and the confirmation page tells the customer you'll follow up to arrange
payment.

**Sign in with Google** for the admin dashboard is optional and documented
step-by-step in `docs/google-login-setup.md` (create an OAuth client in
Google Cloud Console, set `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET`,
allowlist emails via `GOOGLE_ADMIN_EMAILS`).

## Analytics & ad attribution

All of this is optional and driven entirely by env vars — leave them unset
and nothing loads. Loaded only on public marketing pages
(`src/app/(site)/layout.tsx`), never on `/admin`, so internal usage doesn't
pollute your analytics.

**Important**: `NEXT_PUBLIC_*` vars are inlined into the JS bundle at
**build time** (`next build`), not read at container startup. Setting them
on the Cloud Run *service* after the image is already built does nothing —
they have to be passed as Docker `--build-arg`s (see `cloudbuild.yaml` and
the substitutions in the deploy command in §4 below). In local dev this
doesn't matter — `npm run dev`/`npm run build` read `.env.local` directly.

### GTM vs. direct GA4 — pick one, the code won't run both

- If `NEXT_PUBLIC_GTM_ID` is set (a GTM `GTM-XXXXXXX` container id), **only
  GTM loads** — no separate GA4 script. Configure GA4 and Google Ads as tags
  *inside* the GTM workspace instead of duplicating them in env vars:
  1. **GA4 Configuration tag**, trigger: All Pages. Use your GA4 stream's
     measurement id (`G-XXXXXXX`) here.
  2. **GA4 Event tags** (or Google Ads Conversion Tracking tags) triggered
     on **Custom Event** triggers matching the event names this app already
     pushes to `dataLayer`: `generate_lead` (quote submitted),
     `booking_created`, and `deposit_paid` (fires once per booking, with
     `value`/`currency` params already attached — this is the strongest
     conversion signal to optimize toward).
  3. If GA4 and Google Ads are linked in their own account settings (the
     "Google tag" shown in GA4 admin, distinct from a GTM container id),
     Google handles that linkage on its side — no extra wiring needed here.
- If `NEXT_PUBLIC_GTM_ID` is unset but `NEXT_PUBLIC_GA_MEASUREMENT_ID` is
  set, gtag.js loads directly and the app calls `gtag('event', ...)` itself
  for the same three events, plus fires a Google Ads conversion (if
  configured — see below) via `gtag('event', 'conversion', ...)`.

### Direct-gtag.js-only Google Ads conversions (no GTM)

Only relevant when you're *not* using GTM (see above). Set
`NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` (your account's `AW-XXXXXXX`) plus
whichever conversion-action labels you want to track:
`NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD` (quote submitted),
`NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING` (booking created), and/or
`NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT` (deposit paid). Each conversion
action is created in the Google Ads UI first; it gives you the label to
paste in here.

### Ad attribution

Every visit's `utm_source`/`utm_medium`/`utm_campaign`/`utm_term`/
`utm_content`/`gclid` (plus the true landing page and referrer) are captured
client-side (`src/lib/attribution.ts`) into `localStorage` and submitted
silently alongside every quote request and booking. A fresh utm param on a
later page overwrites the stored value (last-touch); the landing
page/referrer are recorded once, on the visitor's actual entry page. View
the aggregated results at **Admin → Campaigns** (`/admin/campaigns`) —
leads, bookings, and deposits-paid grouped by source/campaign, so you can
compare what different ads/audiences actually produced. See
`docs/google-ads-campaign-plan.md` for a ready-to-use campaign structure,
ad copy, and testing framework built around this.

## Scripts

| Command                          | Purpose                                   |
| --------------------------------- | ------------------------------------------ |
| `npm run dev`                     | Start the dev server                        |
| `npm run build` / `npm run start` | Production build / start                    |
| `npm run lint`                    | ESLint                                      |
| `npm run typecheck`                | `tsc --noEmit`                              |
| `npm run test`                    | Vitest unit tests                           |
| `npm run test:e2e`                | Playwright end-to-end tests                 |
| `npm run db:generate`             | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate`              | Apply migrations to `DATABASE_URL`          |
| `npm run db:seed`                 | Insert sample leads/bookings                |
| `npm run admin:hash-password`     | Hash an admin password for `.env`           |

## Deploying to Google Cloud

This targets **Cloud Run** (the app) + **Cloud SQL for PostgreSQL** (the
database).

### 1. One-time project setup

```bash
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  artifactregistry.googleapis.com sql-component.googleapis.com

gcloud artifacts repositories create propertycareca \
  --repository-format=docker --location=northamerica-northeast1

gcloud sql instances create propertycareca-db \
  --database-version=POSTGRES_16 --tier=db-f1-micro \
  --region=northamerica-northeast1

gcloud sql databases create propertycare --instance=propertycareca-db
gcloud sql users create propertycare --instance=propertycareca-db --password='<choose-a-strong-password>'
```

### 2. Store secrets

Put `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD_HASH`, and the Stripe keys in Secret Manager, then reference
them from the Cloud Run service (`--set-secrets`) rather than plain
`--set-env-vars`. `DATABASE_URL` for a Cloud SQL instance reached via the Unix
socket that Cloud Run mounts automatically looks like:

```
postgresql://propertycare:<password>@localhost/propertycare?host=/cloudsql/<PROJECT>:<REGION>:propertycareca-db
```

### 3. Run migrations

Migrations run *before* deploying a revision that depends on new schema, via
the [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/connect-auth-proxy):

```bash
cloud-sql-proxy <PROJECT>:<REGION>:propertycareca-db &
DATABASE_URL='postgresql://propertycare:<password>@localhost:5432/propertycare' npm run db:migrate
```

### 4. Build, push, and deploy

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=northamerica-northeast1,_REPO=propertycareca,_SERVICE=propertycareca,_CLOUDSQL_INSTANCE=<PROJECT>:<REGION>:propertycareca-db,_SITE_URL=https://propertycareca.com,_GTM_ID=GTM-XXXXXXX
```

`cloudbuild.yaml` builds the Docker image, pushes it to Artifact Registry,
and deploys it to Cloud Run with the Cloud SQL connection attached. The
`_SITE_URL`/`_GTM_ID`/`_GA_MEASUREMENT_ID`/`_GOOGLE_ADS_*` substitutions
become `NEXT_PUBLIC_*` build args baked into the JS bundle (see the
Analytics section above for why these can't just be set on the Cloud Run
service afterwards) — omit whichever you're not using, they default to
empty. Set server-side env vars/secrets (`DATABASE_URL`,
`ADMIN_SESSION_SECRET`, Stripe keys, etc.) once via `gcloud run services
update` (or the Console) — `cloudbuild.yaml` doesn't manage those so
redeploys don't accidentally reset them.

### 5. Stripe webhook

Point a Stripe webhook (checkout.session.completed) at
`https://<your-cloud-run-url>/api/stripe/webhook` and set its signing secret
as `STRIPE_WEBHOOK_SECRET`.

## Architecture notes

- **Auth**: cookie-based admin session (HMAC-signed with
  `ADMIN_SESSION_SECRET`, verified in `src/proxy.ts` — Next's proxy/middleware
  file), obtainable via email/password or Sign in with Google
  (`docs/google-login-setup.md`). Every platform keeps a separate session
  surface: the admin cookie (`pc_admin_session`), the short-lived Google
  OAuth state cookie, customer attribution in localStorage, and Stripe
  Checkout hosted on stripe.com never overlap.
- **Owner settings**: `site_settings` key/value table (Drizzle) drives
  deposits, estimate bases, booking fee, and Stripe credentials (AES-256-GCM
  encrypted with a key derived from `ADMIN_SESSION_SECRET`). Env vars remain
  the fallback.
- **Objectives**: the `/admin/objectives` board tracks business goals with
  status (not started / in progress / completed), started/completed
  timestamps, and a self-assessed percent complete; seeded with the platform
  roadmap by migration 0002.
- **Payments**: Stripe Checkout for booking deposits only (not full invoicing).
  Booking and payment status live in Postgres; the webhook is the source of
  truth for `deposit_paid`.
- **Data model**: `leads` (quote requests) and `bookings` (scheduled service +
  deposit) are independent tables — a lead does not automatically become a
  booking.
