const STORAGE_KEY = "pc_attribution";

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  referrer?: string;
  landingPage?: string;
};

const UTM_PARAM_MAP: Record<keyof Attribution, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
  gclid: "gclid",
  referrer: "",
  landingPage: "",
};

/**
 * Reads campaign params from the current URL and merges them into whatever
 * attribution is already stored for this visitor. A fresh utm_source/gclid
 * overwrites the stored value (last touch wins for the fields that were
 * actually present in this URL); fields absent from the URL keep whatever
 * was captured on an earlier page in the same visit, and referrer/landing
 * page are only ever recorded once (the visitor's true entry point).
 */
export function captureAttributionFromUrl(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const existing = readAttribution();
  const next: Attribution = { ...existing };

  for (const key of Object.keys(UTM_PARAM_MAP) as (keyof Attribution)[]) {
    const paramName = UTM_PARAM_MAP[key];
    if (!paramName) continue;
    const value = params.get(paramName);
    if (value) next[key] = value.slice(0, 200);
  }

  if (!existing.landingPage) {
    next.landingPage = window.location.pathname.slice(0, 500);
    next.referrer = document.referrer ? document.referrer.slice(0, 500) : undefined;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage can throw in private-browsing modes; attribution is a
    // nice-to-have, never worth breaking the page over.
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
