"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { listingUrl } from "@/lib/slugify"
import { useRouter } from "next/navigation"
import { conditionLabel, conditionStyle, categoryLabel, timeAgo } from "@/lib/supabase/types"
import type { Listing } from "@/lib/supabase/types"
import DeleteListingButton from "@/components/market/DeleteListingButton.client"
import PayButton from "@/components/market/PayButton.client"

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending_payment: "bg-amber-100 text-amber-700",
  expired: "bg-neutral-100 text-neutral-500",
  sold: "bg-blue-100 text-blue-700",
}
const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending_payment: "Pending payment",
  expired: "Expired",
  sold: "Sold",
}

type Props = {
  items: Listing[]
  deleteListing: (formData: FormData) => Promise<void>
  markSold: (formData: FormData) => Promise<void>
}

export default function MyListingsClient({ items, deleteListing, markSold }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(false)

  const allSelected = items.length > 0 && selected.size === items.length
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))

  async function bulkDelete() {
    setBulkDeleting(true)
    setConfirmBulk(false)
    await fetch("/api/market/listings/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected] }),
    })
    setSelected(new Set())
    setBulkDeleting(false)
    router.refresh()
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div className={`flex items-center justify-between mb-3 transition-all ${selected.size > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <p className="text-sm text-neutral-500">{selected.size} selected</p>
        <button
          onClick={() => setConfirmBulk(true)}
          disabled={bulkDeleting}
          className="text-xs px-4 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-40"
        >
          {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
        </button>
      </div>

      <div className="space-y-3">
        {/* Select all row */}
        <div className="flex items-center gap-3 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-black cursor-pointer"
          />
          <span className="text-xs text-neutral-400 select-none">Select all</span>
        </div>

        {items.map((listing) => {
          const img = listing.listing_images?.sort((a, b) => a.position - b.position)[0]
          const isSelected = selected.has(listing.id)
          return (
            <div
              key={listing.id}
              className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition ${isSelected ? "border-black" : "border-neutral-200"}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(listing.id)}
                className="w-4 h-4 rounded accent-black cursor-pointer flex-shrink-0"
              />

              {/* Thumbnail */}
              <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                {img ? (
                  <Image src={img.url} alt={listing.title} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={listingUrl(listing.title, listing.id)} className="font-semibold text-sm hover:underline truncate block">
                  {listing.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[listing.status]}`}>
                    {STATUS_LABEL[listing.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionStyle(listing.condition)}`}>
                    {conditionLabel(listing.condition)}
                  </span>
                  <span className="text-xs text-neutral-400">{categoryLabel(listing.category)}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{listing.views} views · {timeAgo(listing.created_at)}</p>
              </div>

              {/* Price */}
              <p className="font-bold text-base text-black flex-shrink-0">€{Math.round(listing.price).toLocaleString("de-DE")}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {listing.status === "pending_payment" ? (
                  <PayButton listingId={listing.id} />
                ) : (
                  <Link
                    href={`/market/listing/${listing.id}/edit`}
                    className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 hover:border-black transition"
                  >
                    Edit
                  </Link>
                )}
                {listing.status === "active" && (
                  <form action={markSold}>
                    <input type="hidden" name="id" value={listing.id} />
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 hover:border-black transition">
                      Mark sold
                    </button>
                  </form>
                )}
                <DeleteListingButton id={listing.id} action={deleteListing} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Bulk delete confirm modal */}
      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmBulk(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-neutral-900">Delete {selected.size} listing{selected.size !== 1 ? "s" : ""}?</p>
                <p className="text-xs text-neutral-500 mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmBulk(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm hover:border-black transition">
                Cancel
              </button>
              <button onClick={bulkDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
