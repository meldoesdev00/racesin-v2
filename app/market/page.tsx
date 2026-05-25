import { Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ListingCard from "@/components/market/ListingCard"
import MarketFilters from "@/components/market/MarketFilters.client"
import type { Listing } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 24

type SearchParams = {
  category?: string
  condition?: string
  q?: string
  min?: string
  max?: string
  location?: string
  sort?: string
  page?: string
}

async function getListings(params: SearchParams) {
  const supabase = await createClient()
  const page = Number(params.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("listings")
    .select("*, listing_images(url, position)", { count: "exact" })
    .eq("status", "active")
    .range(from, to)

  if (params.category) query = query.eq("category", params.category)
  if (params.condition) query = query.eq("condition", params.condition)
  if (params.q) query = query.ilike("title", `%${params.q}%`)
  if (params.min) query = query.gte("price", Number(params.min))
  if (params.max) query = query.lte("price", Number(params.max))
  if (params.location) query = query.ilike("location", `%${params.location}%`)

  switch (params.sort) {
    case "price_asc":  query = query.order("price", { ascending: true }); break
    case "price_desc": query = query.order("price", { ascending: false }); break
    case "views":      query = query.order("views", { ascending: false }); break
    default:           query = query.order("created_at", { ascending: false })
  }

  const { data, count } = await query
  return { listings: (data ?? []) as Listing[], total: count ?? 0 }
}

async function getStats() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
  return count ?? 0
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [{ listings, total }, activeCount] = await Promise.all([
    getListings(params),
    getStats(),
  ])

  const page = Number(params.page ?? 1)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams(params as Record<string, string>)
    sp.set("page", String(p))
    return `/market?${sp.toString()}`
  }

  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-2">
            Sim-racing Marketplace
          </h1>
          <p className="text-neutral-500 text-base">
            {activeCount.toLocaleString()} active listings — buy and sell sim-racing equipment
          </p>
        </div>
        <Link
          href="/market/create"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post a Listing
        </Link>
      </div>

      {/* Filters — needs Suspense because of useSearchParams */}
      <div className="space-y-3 mb-8">
        <Suspense fallback={null}>
          <MarketFilters />
        </Suspense>
      </div>

      {/* Results */}
      {listings.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-neutral-200 mb-4">
            <svg className="mx-auto" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-neutral-700 mb-2">No listings found</p>
          <p className="text-neutral-400 mb-6">Try adjusting your filters or be the first to post.</p>
          <Link
            href="/market/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
          >
            Post a Listing
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-400 mb-4">{total} listing{total !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link href={buildUrl(page - 1)} className="px-4 py-2 rounded-full border border-neutral-200 hover:border-black text-sm transition">
                  ← Previous
                </Link>
              )}
              <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={buildUrl(page + 1)} className="px-4 py-2 rounded-full border border-neutral-200 hover:border-black text-sm transition">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
