import Image from "next/image"
import Link from "next/link"
import { conditionLabel, conditionStyle, categoryLabel, timeAgo } from "@/lib/supabase/types"
import { listingUrl } from "@/lib/slugify"
import type { Listing } from "@/lib/supabase/types"

export default function ListingCard({ listing }: { listing: Listing }) {
  const firstImage = listing.listing_images?.[0]?.url
  const price = Math.round(listing.price).toLocaleString("de-DE")
  const originalPrice = listing.original_price && listing.original_price > listing.price
    ? Math.round(listing.original_price).toLocaleString("de-DE")
    : null
  const discountPct = listing.original_price && listing.original_price > listing.price
    ? Math.round((1 - listing.price / listing.original_price) * 100)
    : null

  return (
    <Link
      href={listingUrl(listing.title, listing.id)}
      className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {listing.listing_images && listing.listing_images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
            +{listing.listing_images.length - 1}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-black">
          {listing.title}
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-xl font-bold text-black">€{price}</p>
          {originalPrice && (
            <>
              <p className="text-sm text-neutral-400 line-through">€{originalPrice}</p>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">-{discountPct}%</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionStyle(listing.condition)}`}>
            {conditionLabel(listing.condition)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
            {categoryLabel(listing.category)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {listing.location || "—"}
          </span>
          <span className="text-xs text-neutral-400">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
