import type { Metadata } from "next";
import { site } from "@/content/site";
import { Chrome } from "@/components/layout/chrome";
import { Readout } from "@/components/ui/readout";
import { PointCloud } from "@/components/ui/point-cloud";
import { PreviewZone } from "@/components/ui/preview-zone";
import { SideSlider } from "@/components/ui/side-slider";
import { DarkToggle } from "@/components/ui/dark-toggle";
import { SquishToggle } from "@/components/ui/squish-toggle";
import { EditBar } from "@/components/ui/edit-bar";
import "./globals.css";

// Apply saved dark mode + squished layout before first paint to avoid a flash.
const themeInit = `try{var d=document.documentElement;if(localStorage.getItem('npjm-theme')==='dark')d.dataset.theme='dark';if(localStorage.getItem('npjm-squish')==='1')d.dataset.squish='1'}catch(e){}`;

export const metadata: Metadata = {
  title: { default: site.name, template: `%s — ${site.name}` },
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
        <PointCloud />
        <Chrome>{children}</Chrome>
        <SideSlider />
        <Readout />
        <PreviewZone />
        <div className="top-toggles">
          <SquishToggle />
          <DarkToggle />
        </div>
        <EditBar />
      </body>
    </html>
  );
}
