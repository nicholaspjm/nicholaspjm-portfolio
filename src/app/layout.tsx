import type { Metadata } from "next";
import { site } from "@/content/site";
import { Chrome } from "@/components/layout/chrome";
import { TitleScroller } from "@/components/ui/title-scroller";
import { Readout } from "@/components/ui/readout";
import { PointCloud } from "@/components/ui/point-cloud";
import { PreviewZone } from "@/components/ui/preview-zone";
import { SideSlider } from "@/components/ui/side-slider";
import "./globals.css";

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
        <TitleScroller text="Nicholas Marriott — site is always rendering — " />
        <PointCloud />
        <Chrome>{children}</Chrome>
        <SideSlider />
        <Readout />
        <PreviewZone />
      </body>
    </html>
  );
}
