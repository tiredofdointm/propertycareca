declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a custom event for both consumption models Analytics.tsx can load:
 *  - GTM: a plain `{event: eventName, ...}` dataLayer push, matched by a
 *    Custom Event trigger you configure inside the GTM workspace.
 *  - Direct gtag.js (no GTM configured): `window.gtag` is only defined in
 *    that fallback path, so this also calls `gtag('event', eventName,
 *    params)` — the shape gtag.js actually listens for. A bare dataLayer
 *    object push is invisible to gtag.js; it only reacts to gtag() calls.
 * No-ops (and never throws) when analytics isn't configured, so callers
 * never need to guard this themselves.
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...params });
  window.gtag?.("event", eventName, params);
}

/** Fires a Google Ads conversion, if a conversion id + label are configured. */
export function trackGoogleAdsConversion(
  labelEnvValue: string | undefined,
  params: Record<string, unknown> = {}
) {
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  if (!conversionId || !labelEnvValue) return;
  trackEvent("conversion", {
    send_to: `${conversionId}/${labelEnvValue}`,
    ...params,
  });
}
