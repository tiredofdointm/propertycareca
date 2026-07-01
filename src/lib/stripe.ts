import Stripe from "stripe";

let cachedClient: Stripe | undefined;
let cachedKey: string | undefined;

/** Returns a Stripe client, or null if STRIPE_SECRET_KEY is not configured. */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  // Only the "no key" case is cheap to re-check every call (a single env
  // read), so we never permanently cache that outcome — a key added after
  // the first (unconfigured) call takes effect immediately.
  if (!cachedClient || cachedKey !== secretKey) {
    cachedClient = new Stripe(secretKey);
    cachedKey = secretKey;
  }
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
