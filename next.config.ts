import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) loads its worker via a runtime path lookup
  // that breaks when Turbopack bundles it into a chunk — keep it external
  // so Node resolves it normally from node_modules instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
