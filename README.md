# PropertyCare.ca

A property maintenance business platform: marketing site, service catalog,
quote requests, online booking with Stripe deposit payments, and an admin
dashboard for managing leads and bookings.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, Drizzle ORM +
PostgreSQL, Stripe Checkout, cookie-based admin auth. Packaged for Google
Cloud Run + Cloud SQL.

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

Stripe deposit payments and the webhook are only active when `STRIPE_SECRET_KEY`
/ `STRIPE_WEBHOOK_SECRET` are set; without them, booking still works and the
confirmation page tells the customer you'll follow up to arrange payment.

## Analytics & ad attribution

All of this is optional and driven entirely by env vars — leave them unset
and nothing loads.

- **GA4 / GTM**: set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (a GA4 `G-XXXXXXX`
  measurement id) and/or `NEXT_PUBLIC_GTM_ID` (a GTM `GTM-XXXXXXX` container
  id). Loaded only on public marketing pages (`src/app/(site)/layout.tsx`),
  never on `/admin`, so internal usage doesn't pollute your analytics. If you
  set both, make sure you're not double-firing the same GA4 tag from both the
  direct gtag.js load and a GTM tag — that's a config choice, not something
  the code guards against.
- **Ad attribution**: every visit's `utm_source`/`utm_medium`/`utm_campaign`/
  `utm_term`/`utm_content`/`gclid` (plus the true landing page and referrer)
  are captured client-side (`src/lib/attribution.ts`) into `localStorage` and
  submitted silently alongside every quote request and booking. A fresh utm
  param on a later page overwrites the stored value (last-touch); the
  landing page/referrer are recorded once, on the visitor's actual entry
  page. View the aggregated results at **Admin → Campaigns**
  (`/admin/campaigns`) — leads, bookings, and deposits-paid grouped by
  source/campaign, so you can compare what different ads/audiences actually
  produced.
- **Google Ads conversions**: set `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`
  (your account's `AW-XXXXXXX`) plus whichever conversion-action labels you
  want to track: `NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD` (quote submitted),
  `NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING` (booking created), and/or
  `NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT` (deposit actually paid — the
  strongest signal to optimize a campaign toward). Each conversion action is
  created in the Google Ads UI first; it gives you the label to paste in
  here.

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
  --substitutions=_REGION=northamerica-northeast1,_REPO=propertycareca,_SERVICE=propertycareca,_CLOUDSQL_INSTANCE=<PROJECT>:<REGION>:propertycareca-db
```

`cloudbuild.yaml` builds the Docker image, pushes it to Artifact Registry,
and deploys it to Cloud Run with the Cloud SQL connection attached. Set the
service's env vars/secrets once via `gcloud run services update` (or the
Console) — `cloudbuild.yaml` doesn't manage those so redeploys don't
accidentally reset them.

### 5. Stripe webhook

Point a Stripe webhook (checkout.session.completed) at
`https://<your-cloud-run-url>/api/stripe/webhook` and set its signing secret
as `STRIPE_WEBHOOK_SECRET`.

## Architecture notes

- **Auth**: single-admin, cookie-based session (HMAC-signed with
  `ADMIN_SESSION_SECRET`, verified in `src/proxy.ts` — Next's proxy/middleware
  file). No third-party auth provider; intentionally simple for one admin
  user. Revisit if multiple staff accounts are needed.
- **Payments**: Stripe Checkout for booking deposits only (not full invoicing).
  Booking and payment status live in Postgres; the webhook is the source of
  truth for `deposit_paid`.
- **Data model**: `leads` (quote requests) and `bookings` (scheduled service +
  deposit) are independent tables — a lead does not automatically become a
  booking.
