"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markAsSold } from "@/app/market/listing/[id]/actions"

export default function MarkAsSoldButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await markAsSold(listingId)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium hover:border-black transition"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Mark as sold
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-base font-semibold mb-2">Mark as sold?</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Your listing will be hidden from the marketplace. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-50"
              >
                {loading ? "Saving…" : "Yes, mark as sold"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-sm font-medium hover:border-black transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
