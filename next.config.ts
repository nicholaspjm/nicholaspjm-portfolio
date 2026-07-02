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
};

export default nextConfig;
