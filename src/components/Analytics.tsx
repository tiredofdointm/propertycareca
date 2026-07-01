import Script from "next/script";

/**
 * Loads a GTM container OR direct GA4 (gtag.js), driven entirely by env
 * vars. Renders nothing when neither is configured. Mounted only on public
 * marketing pages (see src/app/(site)/layout.tsx) — not on /admin.
 *
 * When NEXT_PUBLIC_GTM_ID is set, GTM is the single source of truth for
 * every tag: GA4 and Google Ads conversions should be configured as tags
 * *inside* the GTM workspace (not loaded a second time here), triggered by
 * the custom events this app already pushes to dataLayer — generate_lead,
 * booking_created, deposit_paid (see src/lib/analytics.ts trackEvent). That
 * avoids double-counting GA4 hits from two independent tag loads.
 *
 * NEXT_PUBLIC_GA_MEASUREMENT_ID / NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID are
 * only used as a *direct* gtag.js fallback when GTM isn't configured at all.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

  if (gtmId) {
    return (
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
    );
  }

  if (!gaId) return null;

  return (
    <>
      <Script id="datalayer-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`gtag('config', '${gaId}');`}
      </Script>
      {adsId ? (
        <Script id="google-ads-config" strategy="afterInteractive">
          {`gtag('config', '${adsId}');`}
        </Script>
      ) : null}
    </>
  );
}
