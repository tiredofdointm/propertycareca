ALTER TABLE "bookings" ADD COLUMN "utm_source" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "utm_medium" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "utm_campaign" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "utm_term" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "utm_content" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "gclid" varchar(200);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "landing_page" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_source" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_medium" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_campaign" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_term" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "utm_content" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "gclid" varchar(200);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "landing_page" text;