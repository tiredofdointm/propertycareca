CREATE TYPE "public"."lead_plan" AS ENUM('estimate', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."objective_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "objectives" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(300) NOT NULL,
	"details" text,
	"status" "objective_status" DEFAULT 'not_started' NOT NULL,
	"percent_complete" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "plan" "lead_plan" DEFAULT 'estimate' NOT NULL;--> statement-breakpoint
-- Seed the objectives board with the platform roadmap so progress tracking
-- starts with real history instead of an empty list. Items delivered in the
-- same change that ships this migration are marked completed.
INSERT INTO "objectives" ("title", "details", "status", "percent_complete", "started_at", "completed_at") VALUES
  ('Site theme: warm background, clear contrast', 'Replace the stark white background with a warm parchment palette so cards and content visibly stand out.', 'completed', 100, now(), now()),
  ('Estimate & Enterprise plans (no public prices)', 'Plans page with a per-job Estimate plan and a custom-priced Enterprise plan for recurring business partners. No out-of-the-box prices shown publicly.', 'completed', 100, now(), now()),
  ('Owner-adjustable prices, fees & Stripe account', 'Admin Settings page to edit deposits, internal estimate bases, booking fee, and connect/switch/test the Stripe account without a redeploy.', 'completed', 100, now(), now()),
  ('Objectives progress tracker', 'This board: add objectives, mark started/completed, and record percent done in our own estimation.', 'completed', 100, now(), now()),
  ('Google sign-in for the admin dashboard', 'Sign in with Google (allowlisted emails) alongside email/password. Requires creating OAuth credentials in Google Cloud Console — see docs/google-login-setup.md.', 'in_progress', 80, now(), NULL),
  ('SEO for real estate & construction searches', 'Sitemap, robots.txt, structured data, and keyword-rich metadata so propertycareca.com surfaces for property maintenance, real estate, and construction-related searches.', 'completed', 100, now(), now()),
  ('Google Ads campaign live', 'Tracking infrastructure and campaign plan are ready (docs/google-ads-campaign-plan.md); the campaign itself must be created inside the Google Ads account.', 'in_progress', 60, now(), NULL),
  ('Launch propertycareca.com to production', 'Deploy to hosting, point the domain, set environment variables, run database migrations, and verify Stripe + Google login in production.', 'not_started', 0, NULL, NULL);
