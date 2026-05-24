/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@google-analytics/data"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "**.myshopify.com",
      },
      {
        protocol: "https",
        hostname: "pzezpldjmkkbpmlsvjbt.supabase.co",
      },
    ],
  },
}

module.exports = nextConfig
