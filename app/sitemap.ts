import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { shopifyFetch } from "@/lib/shopify"

const BASE = "https://www.racesin.com"

const ALL_PRODUCT_HANDLES = `
  {
    products(first: 250) {
      nodes { handle updatedAt }
    }
  }
`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/market`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${BASE}/pre-built-set`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/market/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/policies`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const data = await shopifyFetch({ query: ALL_PRODUCT_HANDLES })
    productRoutes = (data?.products?.nodes ?? []).map((p: { handle: string; updatedAt: string }) => ({
      url: `${BASE}/products/${p.handle}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {}

  let listingRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: listings } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500)
    listingRoutes = (listings ?? []).map((l: { id: string; updated_at: string }) => ({
      url: `${BASE}/market/listing/${l.id}`,
      lastModified: l.updated_at ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {}

  return [...staticRoutes, ...productRoutes, ...listingRoutes]
}
