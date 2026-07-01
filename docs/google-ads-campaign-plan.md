# Google Ads Campaign Plan — PropertyCare.ca

This is a ready-to-enter campaign plan: real ad copy, keywords, targeting, and
a testing framework, built to pair with the conversion tracking already
wired into the site (`src/lib/analytics.ts`, `src/lib/attribution.ts`,
`/admin/campaigns`). I can't log into a Google Ads account and create this
for you — there's no browser/account-automation tool available to me — but
everything below is meant to be copy-pasted directly into the Google Ads UI.

## 1. Before you start: conversion tracking

1. In Google Ads: **Tools & Settings → Conversions → New conversion action**.
   Create three (type: "Website"):
   - `Lead submitted` — category "Submit lead form", value: don't use a fixed value (or use ~$15 as an estimated lead value), count: **One** per click.
   - `Booking created` — category "Other", count: **One**.
   - `Deposit paid` — category "Purchase", value: **Use the transaction-specific value** (we already send the actual deposit amount), count: **One**. This is your strongest signal — optimize campaigns toward this once you have enough volume (see §6).
2. Each conversion action gives you a **label** (the string after `AW-XXXXXXX/`). Put the account id and labels in `.env`/Cloud Run secrets:
   ```
   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXX
   NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD=xxxxxxxxx
   NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING=xxxxxxxxx
   NEXT_PUBLIC_GOOGLE_ADS_LABEL_DEPOSIT=xxxxxxxxx
   ```
   The site starts firing these the moment they're set — no further deploy needed beyond setting the env vars.
3. Also set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4) so you have a second, non-Ads-specific view of the same funnel.

## 2. UTM convention (so `/admin/campaigns` stays readable)

Use this pattern for every ad's final URL (Google Ads can auto-append via
the account-level "tracking template", so you set it once):

```
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}
```

With Google Ads' `{campaignid}`/`{adgroupid}`/`{keyword}` ValueTrack
parameters, every click is tagged automatically — no manual UTM typing per
ad, and `gclid` is captured automatically for the Ads conversion. Name your
actual **campaigns** descriptively since that name is what shows up (as
`utm_campaign`, via a second tracking template variant using `{_campaignname}`
if you'd rather see readable names than numeric IDs) in `/admin/campaigns` —
follow the naming scheme in §3.

## 3. Campaign structure — testing service AND client base independently

Two things are worth testing separately, so don't fold them into one
campaign:
- **Which service** converts best (lawn care vs. pressure washing vs. handyman, etc.)
- **Which client base** responds best to the same service (homeowner vs. landlord/property manager vs. small business)

Structure: one campaign per **service**, one ad group per **client base**
within it. That gives you a clean matrix in `/admin/campaigns` (campaign =
service, and you can additionally split by ad group via `utm_content` if you
want that granularity) and lets you pause a losing audience without pausing
the whole service.

Naming convention: `svc-{service}-{season}` for campaigns, e.g.
`svc-lawncare-summer2026`, `svc-pressurewash-summer2026`. Ad groups:
`aud-homeowner`, `aud-landlord`, `aud-smallbiz`.

### Launch order (given it's currently July)

| Priority | Service | Why now |
|---|---|---|
| 1 | Lawn Care & Landscaping | Peak season, recurring-revenue service, highest search volume |
| 1 | Pressure Washing | Peak season, one-time higher-ticket, easy to compare against lawn care's recurring model |
| 2 | Seasonal Yard Cleanup | Ramps up late Aug/Sept — start structuring now, launch ads in ~6 weeks |
| 2 | Gutter Cleaning | Best pre-fall (Sept/Oct) — same timing as cleanup |
| 3 | Handyman Repairs | Year-round but non-seasonal — good "always-on" campaign once the above are validated |
| 3 (start prepping now) | Snow Removal | Book early-bird seasonal contracts starting Sept/Oct; searches spike with the first snowfall, which is too late to start bidding |

## 4. Campaign #1: Lawn Care & Landscaping (`svc-lawncare-summer2026`)

**Budget**: start at $25–35/day. **Bidding**: Maximize Conversions for the
first ~2 weeks (or ~30 clicks) to gather data, then switch to **Target CPA**
once you have 15+ conversions in 30 days — set target CPA around your
deposit value ($25) divided by your expected close rate; if you don't know
that yet, start with Max Conversions and don't switch until you do.

**Negative keywords (account-level, apply everywhere)**: `free`, `jobs`,
`careers`, `hiring`, `diy`, `equipment rental`, `how to`, `course`, `salary`

### Ad group: Homeowner (`aud-homeowner`)

**Keywords** (phrase/exact match; broad match only once you're optimizing with real conversion data):
```
"lawn care service" | "lawn mowing service" | "lawn maintenance company"
"weekly lawn mowing" | "lawn fertilization service" | +lawn +care +near +me
"residential lawn care"
```

**Responsive Search Ad — Headlines (15, all ≤30 characters as required):**
1. Reliable Lawn Care Weekly
2. Mowing Starting at $45
3. Never Chase a Mower Again
4. Book Your Lawn Crew Fast
5. Same Crew, Every Visit
6. Fertilizing & Weed Control
7. Free Quote, No Contract
8. PropertyCare.ca Lawn Pros
9. Mowing, Edging & Cleanup
10. Skip the Sunday Yard Work
11. Trusted by Homeowners
12. Quote in Under 2 Minutes
13. Weekly or Bi-Weekly Plans
14. Your Lawn, Handled
15. Spring Through Fall Care

**Descriptions (4, all ≤90 characters as required):**
1. Weekly or bi-weekly mowing, edging & fertilization from one dependable crew.
2. No more scrambling for a mower. Book once, we show up on schedule, every time.
3. Reliable lawn care starting at $45 per visit. Request a free quote today.
4. Fair upfront pricing, no long-term contracts. Book the plan that fits you.

**Sitelinks:** "Get a Free Quote" → `/contact?service=lawn-care-landscaping`, "See Our Services" → `/services`, "Book Online" → `/booking?service=lawn-care-landscaping`, "About Us" → `/about`

**Callouts:** No Contract Required · Free Quotes · Locally Owned · Fast Response

### Ad group: Landlord / Property Manager (`aud-landlord`)

Same keyword base, add: `"property management lawn care"`,
`"multi-unit lawn maintenance"`, `"commercial lawn service"`.

**Headlines (7, ≤30 characters — combine with 8 generic ones from the homeowner ad group above to reach 15):**
1. Lawn Care for Rentals
2. One Invoice, Every Site
3. Crews for Property Managers
4. Consistent Curb Appeal
5. Scales With Your Portfolio
6. Skip Tenant Lawn Complaints
7. Ask About Multi-Site Rates

**Descriptions (≤90 characters):**
1. Managing multiple properties? One crew, one invoice, consistent results.
2. Keep every property sharp without juggling vendors. Get a quote today.

## 5. Campaign #2: Pressure Washing (`svc-pressurewash-summer2026`)

**Budget**: $15–25/day to start (lower search volume, higher ticket per job than lawn care's recurring small tickets).

**Keywords:**
```
"pressure washing service" | "driveway cleaning service" | "house washing service"
"deck cleaning service" | "concrete cleaning near me" | +pressure +washing +near +me
```

**Headlines (15, all ≤30 characters as required):**
1. Driveway Looking Grimy?
2. Pressure Washing From $30
3. Restore Driveways & Decks
4. Pro Equipment, Fair Price
5. Book Pressure Washing Now
6. Years of Grime, Gone Fast
7. Safe for Wood & Concrete
8. Free Quote Before We Start
9. PropertyCare.ca Local Pros
10. Driveways, Decks & Siding
11. See the Difference Today
12. Upfront Pricing, No Fees
13. Same-Week Slots Often Open
14. Curb Appeal, Restored
15. Locally Owned & Operated

**Descriptions (4, all ≤90 characters as required):**
1. Years of grime and salt residue, gone. Pressure matched to each surface.
2. Driveways, decks, fences & siding. Book online in under 2 minutes.
3. Pro-grade equipment, surface-safe pressure. Safe for wood decking too.
4. Upfront pricing starting at $30. No contracts, no surprise fees.

**Sitelinks/Callouts:** same pattern as lawn care, service-specific.

## 6. Experimentation framework — "what did we learn"

You already have the infrastructure for this (`/admin/campaigns` +
`utm_campaign`/`utm_content`); here's how to actually use it as a test
harness rather than just a dashboard.

### What to test, one axis at a time
Don't change service, audience, AND ad copy simultaneously — you won't know
which change moved the number. Pick one axis per test round:

1. **Service** (which of the 6 services has the best lead→deposit rate?) — compare campaigns in `/admin/campaigns`.
2. **Client base** (homeowner vs. landlord vs. small business) — compare ad groups (tag via `utm_content` = ad group name).
3. **Messaging angle** — run 2 RSAs per ad group with different emphasis (e.g. "reliability/no-contract" vs. "price/value" vs. "speed/convenience") and let Google's ad rotation + your own read of `/admin/campaigns` tell you which resonates once you have ~50+ clicks per variant.
4. **Landing destination** — quote form vs. direct booking. The site supports linking straight to `/booking?service=X` (skips the quote-request step) or `/contact?service=X` (softer ask). Test both as the ad's final URL for the same audience and compare which produces more *deposits paid*, not just more leads — a "book now" link can produce fewer, higher-intent conversions.

### Reading results (decision rule)
Wait for **at least 30 clicks or 2 weeks**, whichever is later, before judging
a campaign/ad group. Look at `/admin/campaigns`' **Booking → Deposit Rate**
column, not raw lead count — a channel that produces fewer but higher-intent
leads (higher deposit rate) is usually worth more than one that produces
lots of low-quality leads. Kill or reallocate budget from anything with
meaningfully more spend than deposits after that window; double down on
whatever has the best deposit rate *and* enough volume to matter.

### Learnings log
Keep a running log (a doc, a spreadsheet, whatever's easiest) with one row
per test: what you changed, the axis, the date range, the result from
`/admin/campaigns`, and your decision. This is the actual "what we learned"
record the ad platform itself won't give you — Google Ads shows you what
happened, not what you concluded from it or why you made the next change.

| Date | Axis tested | Variant A | Variant B | Winner | Decision |
|---|---|---|---|---|---|
| | Client base | Homeowner | Landlord | | |
| | Messaging | Reliability | Price | | |
| | Landing page | Quote form | Direct booking | | |

## 7. What I can/can't do from here

I can keep drafting ad copy, expand this to the remaining services, adjust
targeting/budget recommendations, or help you interpret `/admin/campaigns`
data once it's running. I can't create the campaigns in Google Ads, enter
billing info, or click "publish" — that needs your own login to the Ads
account.
