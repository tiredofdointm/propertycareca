import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

/**
 * Verifies the currently connected Stripe account by asking Stripe who the
 * key belongs to. Lets the owner confirm a newly pasted key actually works
 * before a customer hits checkout.
 */
export async function POST() {
  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: "No Stripe key is configured yet." },
      { status: 400 }
    );
  }

  try {
    // A null id means GET /v1/account — the account the API key belongs to.
    const account = await stripe.accounts.retrieve(null);
    const balance = await stripe.balance.retrieve();
    return NextResponse.json({
      ok: true,
      accountId: account.id,
      businessName:
        account.business_profile?.name ??
        account.settings?.dashboard?.display_name ??
        null,
      livemode: balance.livemode,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe rejected the key.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
