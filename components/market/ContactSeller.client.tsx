"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { Listing, Profile } from "@/lib/supabase/types"

type Props = {
  listing: Listing
  seller: Profile | null
}

export default function ContactSeller({ listing, seller }: Props) {
  const [phoneVisible, setPhoneVisible] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [msgText, setMsgText] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage() {
    if (!msgText.trim()) return
    setSending(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/market/auth?next=/market/listing/${listing.id}`
        return
      }
      if (user.id === listing.user_id) {
        setError("You cannot message yourself.")
        return
      }

      // Upsert conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .upsert({
          listing_id: listing.id,
          listing_title: listing.title,
          seller_id: listing.user_id,
          buyer_id: user.id,
        }, { onConflict: "listing_id,buyer_id", ignoreDuplicates: false })
        .select()
        .single()

      if (convErr || !conv) throw new Error("Could not start conversation")

      // Send message
      const { data: msgData } = await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_id: user.id,
        content: msgText.trim(),
      }).select().single()

      // Email notification to seller (fire and forget)
      if (listing.email && msgData) {
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single()
        fetch("/api/market/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerEmail: listing.email,
            sellerName: seller?.name ?? "",
            buyerName: buyerProfile?.name ?? user.email ?? "",
            listingTitle: listing.title,
            message: msgText.trim(),
            listingUrl: `${window.location.origin}/market/messages/${conv.id}`,
          }),
        })
      }

      setMessageSent(true)
      setMsgText("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 sticky top-20">
      {/* Seller info */}
      <Link href={`/market/seller/${listing.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition">
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold text-sm flex-shrink-0 overflow-hidden">
          {seller?.avatar_url ? (
            <Image src={seller.avatar_url} alt={seller.name ?? ""} width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            (listing.seller_name ?? seller?.name)?.[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-neutral-900">{listing.seller_name ?? seller?.name ?? "Seller"}</p>
          <p className="text-xs text-neutral-400">View profile →</p>
        </div>
      </Link>

      <hr className="border-neutral-100" />

      {/* Phone */}
      {listing.phone && (
        <button
          onClick={() => setPhoneVisible(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-black bg-white text-black text-sm font-semibold hover:bg-neutral-50 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 12.22a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
          {phoneVisible ? listing.phone : "Show phone number"}
        </button>
      )}

      {/* Message */}
      {messageSent ? (
        <div className="text-center py-3">
          <p className="text-green-600 font-medium text-sm">Message sent!</p>
          <Link href="/market/messages" className="text-xs text-neutral-500 hover:text-black underline mt-1 inline-block">
            View in messages
          </Link>
        </div>
      ) : showForm ? (
        <div className="space-y-2">
          <textarea
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder={`Hi, I'm interested in "${listing.title}". Is it still available?`}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm hover:border-black transition">Cancel</button>
            <button
              onClick={sendMessage}
              disabled={sending || !msgText.trim()}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-80 transition disabled:opacity-40"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Send Message
        </button>
      )}

      {listing.email && (
        <a
          href={`mailto:${listing.email}?subject=Re: ${encodeURIComponent(listing.title)}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 text-sm hover:border-black transition text-neutral-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          Send Email
        </a>
      )}
    </div>
  )
}
