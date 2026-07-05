import type { Metadata } from "next";
import { site } from "@/content/site";
import { Chrome } from "@/components/layout/chrome";
import { Readout } from "@/components/ui/readout";
import { PointCloud } from "@/components/ui/point-cloud";
import { PreviewZone } from "@/components/ui/preview-zone";
import { SideSlider } from "@/components/ui/side-slider";
import { DarkToggle } from "@/components/ui/dark-toggle";
import { SquishToggle } from "@/components/ui/squish-toggle";
import { SquishFrame } from "@/components/ui/squish-frame";
import { EditBar } from "@/components/ui/edit-bar";
import "./globals.css";

// Apply saved dark mode + squish preview before first paint to avoid a flash.
// data-squish is set ONLY on the top window, so the site copy loaded inside the
// preview iframe (window.self !== window.top) can never hide its own content,
// whatever its localStorage says. data-sq-frame marks that inner copy too.
const themeInit = `try{var d=document.documentElement,top=window.self===window.top;if(localStorage.getItem('npjm-theme')==='dark')d.dataset.theme='dark';if(top){if(localStorage.getItem('npjm-squish')==='1')d.dataset.squish='1'}else{d.dataset.sqFrame='1'}}catch(e){}`;

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <div className="app-root">
          <PointCloud />
          <Chrome>{children}</Chrome>
          <SideSlider />
          <Readout />
          <PreviewZone />
        </div>
        <SquishFrame />
        <div className="top-toggles">
          <SquishToggle />
          <DarkToggle />
        </div>
        <EditBar />
      </body>
    </html>
  );
}
