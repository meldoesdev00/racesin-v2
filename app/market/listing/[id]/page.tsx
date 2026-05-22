import { notFound } from "next/navigation"
import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import ImageGallery from "@/components/market/ImageGallery.client"
import ContactSeller from "@/components/market/ContactSeller.client"
import ListingCard from "@/components/market/ListingCard"
import { conditionLabel, conditionStyle, categoryLabel, timeAgo } from "@/lib/supabase/types"
import type { Listing } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, price, location, listing_images(url, position)")
    .eq("id", id)
    .eq("status", "active")
    .single()
  if (!listing) return {}
  const images = [...(listing.listing_images ?? [])].sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  const image = images[0]?.url
  const price = Math.round(listing.price).toLocaleString("de-DE")
  const desc = listing.description
    ? listing.description.slice(0, 140)
    : `${listing.title} for sale — €${price}${listing.location ? ` in ${listing.location}` : ""}.`
  return {
    title: listing.title,
    description: desc,
    openGraph: {
      title: `${listing.title} — €${price} | Racesin Market`,
      description: desc,
      url: `https://www.racesin.com/market/listing/${id}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: listing.title }] : [],
    },
    alternates: { canonical: `https://www.racesin.com/market/listing/${id}` },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from("listings")
    .select("*, listing_images(id, url, position)")
    .eq("id", id)
    .single()

  if (!listing) return notFound()

  const isOwner = user?.id === listing.user_id

  // Non-owners can only see active listings
  if (!isOwner && listing.status !== "active") return notFound()

  // Increment view count — skip owner, dedupe per browser via cookie
  if (!isOwner) {
    const cookieStore = await cookies()
    const viewed = (cookieStore.get("viewed_listings")?.value ?? "").split(",").filter(Boolean)
    if (!viewed.includes(id)) {
      supabase.rpc("increment_listing_views", { p_listing_id: id }).then(() => {})
      const next = [...viewed, id].slice(-200).join(",")
      cookieStore.set("viewed_listings", next, { path: "/", maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax" })
    }
  }

  // Fetch seller profile separately (listings.user_id -> auth.users, not profiles directly)
  const { data: seller } = await supabase
    .from("profiles")
    .select("id, name, phone, avatar_url, description, location, created_at")
    .eq("id", listing.user_id)
    .single()

  // Sorted images
  const images = [...(listing.listing_images ?? [])].sort((a, b) => a.position - b.position)

  // Similar listings
  const { data: similar } = await supabase
    .from("listings")
    .select("*, listing_images(url, position)")
    .eq("status", "active")
    .eq("category", listing.category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Link href="/market" className="flex items-center gap-1.5 hover:text-black transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Market
          </Link>
          <span>/</span>
          <span className="text-neutral-600 truncate max-w-[200px]">{listing.title}</span>
        </div>
        {isOwner && (
          <Link
            href={`/market/listing/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium hover:border-black transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit listing
          </Link>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12">
        {/* Left: gallery only */}
        <div>
          <ImageGallery images={images} />
        </div>

        {/* Right: everything */}
        <div className="space-y-6">
          {/* Title + badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${conditionStyle(listing.condition)}`}>
                {conditionLabel(listing.condition)}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                {categoryLabel(listing.category)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">{listing.title}</h1>

            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-3xl font-bold text-black">€{Math.round(listing.price).toLocaleString("de-DE")}</p>
              {listing.original_price && listing.original_price > listing.price && (
                <>
                  <p className="text-lg text-neutral-400 line-through">€{Math.round(listing.original_price).toLocaleString("de-DE")}</p>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              {listing.location && (
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {listing.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {timeAgo(listing.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                </svg>
                {listing.views} views
              </span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-base font-semibold mb-2">Description</h2>
              <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-sm">
                {listing.description}
              </div>
            </div>
          )}

          {/* Details table */}
          <div>
            <h2 className="text-base font-semibold mb-2">Details</h2>
            <div className="grid grid-cols-2 gap-px bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
              {[
                { label: "Category", value: categoryLabel(listing.category) },
                { label: "Condition", value: conditionLabel(listing.condition) },
                listing.location && { label: "Location", value: listing.location },
                { label: "Listed", value: new Date(listing.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
              ].filter(Boolean).map((row) => row && (
                <div key={row.label} className="bg-white px-4 py-3">
                  <p className="text-xs text-neutral-400 mb-0.5">{row.label}</p>
                  <p className="text-sm font-medium text-neutral-900">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <ContactSeller listing={listing as Listing} seller={seller} />
        </div>
      </div>

      {/* Similar listings */}
      {similar && similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-5">Similar Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l as Listing} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
