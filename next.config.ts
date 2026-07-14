import type { NextConfig } from "next";

// On GitHub Pages this ships to a project subpath
// (nicholaspjm.github.io/nicholaspjm-portfolio). The CI build sets
// NEXT_PUBLIC_BASE_PATH; local dev leaves it empty so everything serves
// from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Escape hatch for a hung dev server holding the default .next lock:
  //   NEXT_DIST_DIR=.next-alt npm run dev -- --port 3001
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
