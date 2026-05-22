import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { verifyMontonioToken } from "@/lib/montonio"
import { LISTING_DURATION_DAYS } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

export default async function PayReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ "payment-token"?: string; listing_id?: string }>
}) {
  const params = await searchParams
  const token = params["payment-token"]
  const listingId = params.listing_id

  if (!listingId) redirect("/market")

  let paid = false

  if (token) {
    try {
      const payload = verifyMontonioToken(token) as { payment_status?: string; paymentStatus?: string }
      const status = payload.paymentStatus ?? payload.payment_status
      if (status === "PAID") {
        paid = true
        // Activate listing (in case webhook hasn't fired yet)
        const supabase = await createClient()
        const expiresAt = new Date(Date.now() + LISTING_DURATION_DAYS * 86400000).toISOString()
        await supabase
          .from("listings")
          .update({ status: "active", expires_at: expiresAt })
          .eq("id", listingId)
          .eq("status", "pending_payment")
      }
    } catch {
      // invalid token — treat as unpaid
    }
  }

  if (paid) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Listing published!</h1>
        <p className="text-neutral-500 text-sm mb-8">Your listing is now live and visible to buyers.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/market/listing/${listingId}`}
            className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
          >
            View listing
          </Link>
          <Link
            href="/market/my-listings"
            className="px-6 py-3 rounded-full border border-neutral-200 text-sm font-medium hover:border-black transition"
          >
            My listings
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Payment not completed</h1>
      <p className="text-neutral-500 text-sm mb-8">Your listing is saved but not yet active. You can pay later from My Listings.</p>
      <Link
        href="/market/my-listings"
        className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
      >
        My listings
      </Link>
    </main>
  )
}
