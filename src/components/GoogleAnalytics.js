// GoogleAnalytics.js
// Path: src/components/GoogleAnalytics.js
// Description: GA4 tracking tag (gtag.js) for parks-rec-sullivan.me.
//              Loaded via next/script for proper Next.js script handling
//              (non-blocking, deduped across route changes).
// ============================================================
import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-63FDX597QP'

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}

// end of file
