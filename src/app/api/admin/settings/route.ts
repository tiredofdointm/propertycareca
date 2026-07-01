import { NextRequest, NextResponse } from "next/server";
import { readJsonBody, zodFieldErrors } from "@/lib/api-utils";
import { settingsUpdateSchema } from "@/lib/validation";
import {
  SETTING_KEYS,
  deleteSettings,
  getBookingFeeCents,
  getServicePricing,
  getStripeSettingsStatus,
  setSecretSetting,
  setSetting,
} from "@/lib/settings";

export async function GET() {
  const [pricing, bookingFeeCents, stripe] = await Promise.all([
    getServicePricing(),
    getBookingFeeCents(),
    getStripeSettingsStatus(),
  ]);
  return NextResponse.json({ pricing, bookingFeeCents, stripe });
}

export async function PUT(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = settingsUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: zodFieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const {
    bookingFeeCents,
    services: servicePricing,
    stripePublishableKey,
    stripeSecretKey,
    stripeWebhookSecret,
    stripeDisconnect,
  } = parsed.data;

  if (typeof bookingFeeCents === "number") {
    await setSetting(SETTING_KEYS.bookingFeeCents, String(bookingFeeCents));
  }

  for (const entry of servicePricing ?? []) {
    await setSetting(
      SETTING_KEYS.depositCents(entry.slug),
      String(entry.depositCents)
    );
    await setSetting(
      SETTING_KEYS.estimateBaseCents(entry.slug),
      String(entry.estimateBaseCents)
    );
  }

  if (stripeDisconnect) {
    await deleteSettings([
      SETTING_KEYS.stripeSecretKey,
      SETTING_KEYS.stripePublishableKey,
      SETTING_KEYS.stripeWebhookSecret,
    ]);
  } else {
    // Empty string means "leave unchanged" so the form never has to echo
    // secrets back to the browser.
    if (stripeSecretKey) {
      await setSecretSetting(SETTING_KEYS.stripeSecretKey, stripeSecretKey);
    }
    if (stripePublishableKey) {
      await setSetting(
        SETTING_KEYS.stripePublishableKey,
        stripePublishableKey
      );
    }
    if (stripeWebhookSecret) {
      await setSecretSetting(
        SETTING_KEYS.stripeWebhookSecret,
        stripeWebhookSecret
      );
    }
  }

  const [pricing, fee, stripe] = await Promise.all([
    getServicePricing(),
    getBookingFeeCents(),
    getStripeSettingsStatus(),
  ]);
  return NextResponse.json({ ok: true, pricing, bookingFeeCents: fee, stripe });
}
