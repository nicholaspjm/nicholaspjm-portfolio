import type { Metadata } from "next";
import { site } from "@/content/site";
import { Chrome } from "@/components/layout/chrome";
import { Readout } from "@/components/ui/readout";
import { PointCloud } from "@/components/ui/point-cloud";
import { PreviewZone } from "@/components/ui/preview-zone";
import { SideSlider } from "@/components/ui/side-slider";
import { DarkToggle } from "@/components/ui/dark-toggle";
import "./globals.css";

// Apply saved dark mode before first paint to avoid a flash of light.
const themeInit = `try{if(localStorage.getItem('npjm-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

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
        <DarkToggle />
      </body>
    </html>
  );
}
