const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@zoyzoy/ui"],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_SITE_ID: process.env.NEXT_PUBLIC_SITE_ID || "site-006-memory-photos",
  },
};

module.exports = nextConfig;
