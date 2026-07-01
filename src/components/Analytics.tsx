import Script from "next/script";

/**
 * Loads GA4 (gtag.js) and/or a GTM container, driven entirely by env vars.
 * Renders nothing when neither is configured, so local/dev builds without
 * analytics IDs behave exactly as before. Mounted only on public marketing
 * pages (see src/app/(site)/layout.tsx) — not on /admin.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gaId && !gtmId) return null;

  return (
    <>
      <Script id="datalayer-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());`}
      </Script>
      {gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`gtag('config', '${gaId}');`}
          </Script>
        </>
      ) : null}
      {process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID ? (
        <Script id="google-ads-config" strategy="afterInteractive">
          {`gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}');`}
        </Script>
      ) : null}
    </>
  );
}
