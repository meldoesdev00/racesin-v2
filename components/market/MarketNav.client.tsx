"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function MarketNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [unread, setUnread] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchUnread = () =>
      supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("read", false)
        .neq("sender_id", user.id)
        .then(({ count }) => setUnread(count ?? 0))

    fetchUnread()

    const channel = supabase
      .channel("marketnav-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchUnread())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => fetchUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const active = (href: string) =>
    pathname === href ? "text-black font-semibold" : "text-neutral-500 hover:text-black"

  return (
    <div className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {user && (
            <>
              <Link href="/market/my-listings" className={`text-sm transition ${active("/market/my-listings")}`}>
                My Listings
              </Link>
              <Link href="/market/messages" className={`relative text-sm transition ${active("/market/messages")}`}>
                Messages
                {unread > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-black text-white text-[10px] font-medium">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/market/create"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Post a Listing
          </Link>
          {!authLoading && user && (
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = "/market" }}
              className="text-sm text-neutral-400 hover:text-black transition"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
