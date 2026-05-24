"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import RentalsOverlay from "@/components/RentalsOverlay.client"
import { useCart } from "@/components/CartProvider.client"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const navItems = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Products", href: "/products" },
  { label: "Pre-Built Set", href: "/pre-built-set" },
  { label: "Rentals", href: "overlay" },
  { label: "Market", href: "/market" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [rentalsOpen, setRentalsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { items, setOpen: setCartOpen } = useCart()
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const pathname = usePathname()
  const isMarket = pathname.startsWith("/market")
  const [marketUser, setMarketUser] = useState<User | null>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isMarket) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setMarketUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setMarketUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [isMarket])

  useEffect(() => {
    if (!marketUser) { setUnread(0); return }
    const supabase = createClient()

    supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("read", false)
      .neq("sender_id", marketUser.id)
      .then(({ count }) => setUnread(count ?? 0))
  }, [marketUser, pathname])

  useEffect(() => {
    if (!marketUser) return
    const supabase = createClient()

    const fetchUnread = () =>
      supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("read", false)
        .neq("sender_id", marketUser.id)
        .then(({ count }) => setUnread(count ?? 0))

    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        if (payload.new.sender_id !== marketUser.id) fetchUnread()
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        fetchUnread()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [marketUser])

  const marketActive = (href: string) =>
    pathname === href ? "font-semibold text-black" : "text-neutral-500 hover:text-black"

  return (
    <>
      <header className="bg-white border-b border-neutral-100">
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 h-20 flex items-center">

          {/* LEFT */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <span className="block w-6 h-[2px] bg-black mb-1" />
              <span className="block w-6 h-[2px] bg-black mb-1" />
              <span className="block w-6 h-[2px] bg-black" />
            </button>

            <Link href="/" className="hidden lg:block">
              <Image
                src="/racesin-logo-black-desktop.svg"
                alt="Racesin Motorsport"
                width={200}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* CENTER NAV (DESKTOP) */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex gap-10 whitespace-nowrap">
            {navItems.map((item) =>
              item.href === "overlay" ? (
                <button
                  key={item.label}
                  onClick={() => setRentalsOpen(true)}
                  className="text-base font-medium hover:text-red-500 transition"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base font-medium hover:text-red-500 transition"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CART ICON (MOBILE, non-market only) */}
          {!isMarket && (
            <button
              onClick={() => setCartOpen(true)}
              className="lg:hidden ml-auto p-2 relative"
              aria-label="Open cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-label="Home"
          >
            <Image
              src="/racesin-logo-black-desktop.svg"
              alt="Racesin Motorsport"
              width={48}
              height={48}
              priority
              className="h-9 w-auto"
            />
          </Link>

          {/* RIGHT SIDE (DESKTOP ONLY) */}
          <div className="ml-auto hidden lg:flex items-center gap-5">
            {isMarket ? (
              <>
                {marketUser && (
                  <Link
                    href="/market/create"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Post a Listing
                  </Link>
                )}
                {marketUser && (
                  <Link
                    href="/market/messages"
                    className="relative hover:opacity-60 transition"
                    aria-label="Messages"
                    title="Messages"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-medium">
                        {unread}
                      </span>
                    )}
                  </Link>
                )}
                {marketUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="hover:opacity-60 transition"
                      aria-label="My account"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </button>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 top-8 z-40 w-48 bg-white border border-neutral-200 rounded-2xl shadow-lg py-1.5 overflow-hidden">
                          <Link href="/market/my-listings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                            My Listings
                          </Link>
                          <Link href="/market/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Messages {unread > 0 && <span className="ml-auto text-xs bg-black text-white rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
                          </Link>
                          <Link href="/market/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            Account Settings
                          </Link>
                          <div className="h-px bg-neutral-100 my-1" />
                          <button
                            onClick={async () => { setUserMenuOpen(false); await createClient().auth.signOut(); window.location.href = "/market" }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-50 hover:text-red-500 transition"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/market/auth?next=${encodeURIComponent(pathname)}`}
                    className="hover:opacity-60 transition"
                    aria-label="Sign in"
                    title="Sign in"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </Link>
                )}
              </>
            ) : (
              <>
                {/* Instagram */}
                <Link
                  href="https://www.instagram.com/racesin_com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:opacity-60 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
                  </svg>
                </Link>

                {/* TikTok */}
                <Link
                  href="https://www.tiktok.com/@racesin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="hover:opacity-60 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor" className="translate-y-[1px]">
                    <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.4v178.1a162.6 162.6 0 1 1-141.1-161.6v89.3a73.2 73.2 0 1 0 51.8 69.8V0h90.6a119.2 119.2 0 0 0 121.5 119.2v90.7Z" />
                  </svg>
                </Link>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative hover:opacity-60 transition"
                  aria-label="Open cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-medium">
                      {itemCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* MOBILE MENU */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="rounded-t-3xl bg-white px-6 pt-6 pb-10 shadow-2xl relative">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute right-6 top-4 text-xl"
          >
            ✕
          </button>

          <nav className="mt-8 flex flex-col gap-6">
            {navItems.map((item) =>
              item.href === "overlay" ? (
                <button
                  key={item.label}
                  onClick={() => { setMenuOpen(false); setRentalsOpen(true) }}
                  className="text-lg font-medium text-left"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  {item.label}
                </Link>
              )
            )}
            {isMarket && (
              <>
                <div className="h-px bg-neutral-100" />
                {marketUser ? (
                  <>
                    <Link href="/market/my-listings" onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                      My Listings
                    </Link>
                    <Link href="/market/messages" onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                      Messages {unread > 0 && `(${unread})`}
                    </Link>
                    <Link href="/market/create" onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                      Post a Listing
                    </Link>
                    <Link href="/market/profile" onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                      Account Settings
                    </Link>
                    <button
                      onClick={async () => { setMenuOpen(false); await createClient().auth.signOut(); window.location.href = "/market" }}
                      className="text-lg font-medium text-left text-neutral-400"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link href={`/market/auth?next=${encodeURIComponent(pathname)}`} onClick={() => setMenuOpen(false)} className="text-lg font-medium">
                    Sign in to Market
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>

      <RentalsOverlay
        isOpen={rentalsOpen}
        onClose={() => setRentalsOpen(false)}
      />
    </>
  )
}
