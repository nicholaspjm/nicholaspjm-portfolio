import type { Metadata } from "next";
import { site } from "@/content/site";
import { Chrome } from "@/components/layout/chrome";
import { Readout } from "@/components/ui/readout";
import { PointCloud } from "@/components/ui/point-cloud";
import { PreviewZone } from "@/components/ui/preview-zone";
import { DarkToggle } from "@/components/ui/dark-toggle";
import { EditBar } from "@/components/ui/edit-bar";
import { Analytics } from "@/components/layout/analytics";
import {
  PersonSchema,
  WebSiteSchema,
  ServiceSchema,
} from "@/components/layout/structured-data";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

// Apply saved dark mode before first paint to avoid a flash.
const themeInit = `try{if(localStorage.getItem('npjm-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

// Site-wide defaults. Each page overrides title/description and — critically —
// sets its own `alternates.canonical`; a canonical declared here would be
// inherited by every route and point them all at the homepage.
export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  metadataBase: new URL(site.url),
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_AU",
    images: [
      { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: site.name },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.tagline,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // The work is the point — let Google show full-size stills in results
      // and untruncated snippets rather than thumbnails.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <PointCloud />
        <Chrome>{children}</Chrome>
        <Readout />
        <PreviewZone />
        <div className="top-toggles">
          <DarkToggle />
        </div>
        <EditBar />
        <Analytics />
        <PersonSchema />
        <WebSiteSchema />
        <ServiceSchema />
      </body>
    </html>
  );
}
