import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) loads its worker via a runtime path lookup
  // that breaks when Turbopack bundles it into a chunk — keep it external
  // so Node resolves it normally from node_modules instead.
  // firebase-admin's auth submodule pulls in jwks-rsa -> jose (ESM), which
  // Turbopack's bundling doesn't interop with cleanly in Vercel's serverless
  // runtime (ERR_REQUIRE_ESM) — same fix, keep it external too.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "firebase-admin"],
};

export default nextConfig;
