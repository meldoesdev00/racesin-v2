import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/market/auth",
          "/market/create",
          "/market/my-listings",
          "/market/messages",
          "/market/profile",
          "/market/pay/",
        ],
      },
    ],
    sitemap: "https://www.racesin.com/sitemap.xml",
  }
}
