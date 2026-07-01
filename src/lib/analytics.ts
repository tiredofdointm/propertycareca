declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Pushes an event to GA4/GTM's dataLayer. No-ops (and never throws) when
 * analytics isn't configured or the script hasn't loaded yet, so callers
 * never need to guard this themselves.
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...params });
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
