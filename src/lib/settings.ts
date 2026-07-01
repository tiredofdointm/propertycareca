import crypto from "crypto";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { services } from "@/lib/services-data";

/**
 * Owner-editable configuration stored in the site_settings table so pricing,
 * fees, and payment credentials can be changed from the admin dashboard
 * without a redeploy. Secrets (Stripe secret key / webhook secret) are
 * encrypted with AES-256-GCM before they touch the database.
 */

export const SETTING_KEYS = {
  stripeSecretKey: "stripe.secretKey",
  stripePublishableKey: "stripe.publishableKey",
  stripeWebhookSecret: "stripe.webhookSecret",
  bookingFeeCents: "pricing.bookingFeeCents",
  depositCents: (slug: string) => `pricing.${slug}.depositCents`,
  estimateBaseCents: (slug: string) => `pricing.${slug}.estimateBaseCents`,
} as const;

const ENC_PREFIX = "enc:v1:";

function encryptionKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET environment variable is not set");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return (
    ENC_PREFIX +
    [iv, tag, ciphertext].map((part) => part.toString("base64")).join(".")
  );
}

export function decryptSecret(stored: string): string | null {
  if (!stored.startsWith(ENC_PREFIX)) return stored;
  try {
    const [iv, tag, ciphertext] = stored
      .slice(ENC_PREFIX.length)
      .split(".")
      .map((part) => Buffer.from(part, "base64"));
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      iv
    );
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Wrong ADMIN_SESSION_SECRET (rotated) or corrupted value.
    return null;
  }
}

export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  if (keys.length === 0) return {};
  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, keys));
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getSettings([key]);
  return settings[key] ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: sql`now()` },
    });
}

export async function deleteSettings(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await db.delete(siteSettings).where(inArray(siteSettings.key, keys));
}

export async function setSecretSetting(
  key: string,
  plain: string
): Promise<void> {
  await setSetting(key, encryptSecret(plain));
}

// ---------------------------------------------------------------------------
// Stripe credentials: dashboard-connected account wins, env vars are the
// fallback so an existing deployment keeps working untouched.
// ---------------------------------------------------------------------------

async function getSecretWithEnvFallback(
  key: string,
  envVar: string | undefined
): Promise<{ value: string | null; source: "dashboard" | "env" | null }> {
  try {
    const stored = await getSetting(key);
    if (stored) {
      const value = decryptSecret(stored);
      if (value) return { value, source: "dashboard" };
    }
  } catch {
    // DB unreachable — fall through to env so payments keep working.
  }
  return envVar ? { value: envVar, source: "env" } : { value: null, source: null };
}

export async function getStripeSecretKey(): Promise<string | null> {
  const { value } = await getSecretWithEnvFallback(
    SETTING_KEYS.stripeSecretKey,
    process.env.STRIPE_SECRET_KEY
  );
  return value;
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const { value } = await getSecretWithEnvFallback(
    SETTING_KEYS.stripeWebhookSecret,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  return value;
}

export type StripeSettingsStatus = {
  configured: boolean;
  source: "dashboard" | "env" | null;
  secretKeyLast4: string | null;
  publishableKey: string | null;
  webhookSecretSet: boolean;
};

export async function getStripeSettingsStatus(): Promise<StripeSettingsStatus> {
  const secret = await getSecretWithEnvFallback(
    SETTING_KEYS.stripeSecretKey,
    process.env.STRIPE_SECRET_KEY
  );
  const webhook = await getSecretWithEnvFallback(
    SETTING_KEYS.stripeWebhookSecret,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  let publishableKey: string | null = null;
  try {
    publishableKey = await getSetting(SETTING_KEYS.stripePublishableKey);
  } catch {
    publishableKey = null;
  }
  publishableKey ??= process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;

  return {
    configured: Boolean(secret.value),
    source: secret.source,
    secretKeyLast4: secret.value ? secret.value.slice(-4) : null,
    publishableKey,
    webhookSecretSet: Boolean(webhook.value),
  };
}

// ---------------------------------------------------------------------------
// Pricing & fees: services-data.ts holds the defaults, settings rows hold the
// owner's overrides.
// ---------------------------------------------------------------------------

export type ServicePricing = {
  slug: string;
  name: string;
  depositCents: number;
  estimateBaseCents: number;
};

function parseCents(value: string | undefined): number | null {
  if (value === undefined) return null;
  const cents = Number(value);
  return Number.isInteger(cents) && cents >= 0 ? cents : null;
}

export async function getServicePricing(): Promise<ServicePricing[]> {
  const keys = services.flatMap((service) => [
    SETTING_KEYS.depositCents(service.slug),
    SETTING_KEYS.estimateBaseCents(service.slug),
  ]);
  let overrides: Record<string, string> = {};
  try {
    overrides = await getSettings(keys);
  } catch {
    overrides = {};
  }
  return services.map((service) => ({
    slug: service.slug,
    name: service.name,
    depositCents:
      parseCents(overrides[SETTING_KEYS.depositCents(service.slug)]) ??
      service.depositCents,
    estimateBaseCents:
      parseCents(overrides[SETTING_KEYS.estimateBaseCents(service.slug)]) ??
      service.startingPriceCents,
  }));
}

export async function getDepositCentsForService(
  slug: string
): Promise<number | null> {
  const pricing = await getServicePricing();
  return pricing.find((entry) => entry.slug === slug)?.depositCents ?? null;
}

/** Optional flat booking fee added on top of the deposit at checkout. */
export async function getBookingFeeCents(): Promise<number> {
  try {
    return parseCents((await getSetting(SETTING_KEYS.bookingFeeCents)) ?? undefined) ?? 0;
  } catch {
    return 0;
  }
}
