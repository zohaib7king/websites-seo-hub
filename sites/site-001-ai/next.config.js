const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // @zoyzoy/ui is a local file: dependency — transpile it through Next's pipeline
  // and point file tracing at the repo root so it's bundled into the standalone output.
  transpilePackages: ["@zoyzoy/ui"],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_SITE_ID: process.env.NEXT_PUBLIC_SITE_ID || "site-001-ai",
  },
};

module.exports = nextConfig;
