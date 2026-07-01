import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/settings";

let cachedClient: Stripe | undefined;
let cachedKey: string | undefined;

/**
 * Returns a Stripe client for the currently connected account, or null if no
 * key is configured. The key comes from the dashboard-connected account
 * (Admin → Settings) when present, otherwise the STRIPE_SECRET_KEY env var —
 * so the owner can connect or switch Stripe accounts without a redeploy.
 */
export async function getStripeClient(): Promise<Stripe | null> {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) return null;

  // Re-resolved every call so a key connected/rotated in the dashboard takes
  // effect immediately; the client object itself is reused while unchanged.
  if (!cachedClient || cachedKey !== secretKey) {
    cachedClient = new Stripe(secretKey);
    cachedKey = secretKey;
  }
  return cachedClient;
}

export async function isStripeConfigured(): Promise<boolean> {
  return Boolean(await getStripeSecretKey());
}
