import Script from "next/script";
import { site } from "@/content/site";

/**
 * Google Analytics 4. Renders nothing unless a Measurement ID is set in
 * site.ts AND this is a production build, so local dev never pollutes stats.
 * gtag loads after the page is interactive, so it never blocks first paint.
 */
export function Analytics() {
  const id = site.gaId?.trim();
  if (!id || process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
