"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminListingModal, { type AdminListing } from "./AdminListingModal.client"
import { conditionLabel, conditionStyle, categoryLabel } from "@/lib/supabase/types"

type Stats = {
  overview: {
    totalUsers: number
    activeListings: number
    pendingListings: number
    totalListings: number
    paidListingsCount: number
    totalRevenue: number
    totalInquiries: number
    totalListingViews: number
  }
  recentListings: {
    id: string
    title: string
    price: number
    status: string
    created_at: string
    views: number
    category: string
    location: string
    listing_images?: { url: string; position: number }[]
  }[]
  draftListings: {
    id: string
    title: string
    price: number
    created_at: string
    category: string
    location: string
    user_id: string
    email?: string
  }[]
  topListingsByViews: {
    id: string
    title: string
    views: number
    category: string
  }[]
  recentInquiries: {
    id: string
    name: string
    email: string
    phone?: string
    message: string
    product_name?: string
    created_at: string
  }[]
  categoryBreakdown: Record<string, number>
  resendEmails: {
    id: string
    to: string[]
    subject: string
    created_at: string
  }[]
  gaPropertyId: string | null
}

const tabs = ["Overview", "Drafts", "Inquiries", "Listings", "Emails", "Analytics"] as const
type Tab = typeof tabs[number]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending_payment: "bg-amber-100 text-amber-700",
    sold: "bg-blue-100 text-blue-700",
    expired: "bg-neutral-100 text-neutral-500",
  }
  return map[status] ?? "bg-neutral-100 text-neutral-500"
}

type GA4Data = {
  overview: {
    pageViews: number
    sessions: number
    activeUsers: number
    bounceRate: number
    avgSessionDuration: number
  }
  topPages: { path: string; views: number }[]
  countries: { name: string; sessions: number }[]
  cities: { name: string; sessions: number }[]
  realtime: { activeUsers: number; pages: { page: string; users: number }[] }
}

type CardListing = {
  id: string
  title: string
  price: number
  status: string
  created_at: string
  views: number
  category: string
  location: string | null
  condition?: string
  seller_name?: string | null
  listing_images?: { url: string; position?: number }[]
}

function AdminListingCard({
  listing,
  onEdit,
  onDelete,
}: {
  listing: CardListing
  onEdit?: () => void
  onDelete?: () => Promise<void>
}) {
  const firstImage = listing.listing_images?.[0]?.url

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col">
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {firstImage ? (
          <Image src={firstImage} alt={listing.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(listing.status)}`}>
          {listing.status.replace("_", " ")}
        </span>
        <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          {listing.views}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <a href={`/market/listing/${listing.id}`} target="_blank" className="font-semibold text-sm leading-snug line-clamp-2 hover:underline text-neutral-900">
          {listing.title}
        </a>

        <p className="text-lg font-bold text-black">€{Math.round(listing.price).toLocaleString("de-DE")}</p>

        <div className="flex flex-wrap gap-1.5">
          {listing.condition && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionStyle(listing.condition)}`}>
              {conditionLabel(listing.condition)}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
            {categoryLabel(listing.category)}
          </span>
          {listing.seller_name && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
              {listing.seller_name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 mt-auto pt-1">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {listing.location || "—"}
          </span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-neutral-100 mt-1">
            {onEdit && (
              <button onClick={onEdit} className="flex-1 text-xs py-1.5 rounded-full border border-neutral-200 hover:border-black transition font-medium">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="flex-1 text-xs py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition font-medium">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("Overview")
  const [ga4, setGa4] = useState<GA4Data | null>(null)
  const [ga4Loading, setGa4Loading] = useState(false)
  const [ga4Error, setGa4Error] = useState<string | null>(null)
  const [ga4Days, setGa4Days] = useState("28")
  const [allListings, setAllListings] = useState<AdminListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [modalListing, setModalListing] = useState<AdminListing | null | undefined>(undefined)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab !== "Analytics") return
    setGa4Loading(true)
    setGa4Error(null)
    setGa4(null)
    fetch(`/api/admin/ga4?days=${ga4Days}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setGa4Error(data.detail ? `${data.error}: ${data.detail}` : data.error)
        else setGa4(data)
      })
      .catch(() => setGa4Error("Failed to load GA4 data"))
      .finally(() => setGa4Loading(false))
  }, [tab, ga4Days])

  useEffect(() => {
    if (tab !== "Listings") return
    setListingsLoading(true)
    fetch("/api/admin/listings")
      .then(r => r.json())
      .then(data => setAllListings(data.listings ?? []))
      .finally(() => setListingsLoading(false))
  }, [tab])

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/racesin-logo-black-desktop.png" alt="Racesin" width={100} height={28} />
          <span className="text-neutral-300 text-sm">|</span>
          <span className="text-neutral-500 text-sm font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.racesin.com" target="_blank" rel="noopener" className="text-xs text-neutral-400 hover:text-black transition">
            View site ↗
          </a>
          <button onClick={logout} className="text-xs text-neutral-400 hover:text-red-500 transition">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 w-fit border border-neutral-200 shadow-sm">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? "bg-black text-white" : "text-neutral-500 hover:text-black"
              }`}
            >
              {t}
              {t === "Drafts" && stats && stats.overview.pendingListings > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                  {stats.overview.pendingListings}
                </span>
              )}
              {t === "Inquiries" && stats && stats.overview.totalInquiries > 0 && (
                <span className="ml-1.5 bg-neutral-100 text-neutral-600 text-xs px-1.5 py-0.5 rounded-full">
                  {stats.overview.totalInquiries}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && <div className="text-neutral-400 text-sm">Loading…</div>}

        {!loading && stats && (
          <>
            {/* OVERVIEW */}
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Users", value: stats.overview.totalUsers, sub: "registered accounts" },
                    { label: "Active Listings", value: stats.overview.activeListings, sub: `${stats.overview.pendingListings} unpaid drafts` },
                    { label: "Revenue", value: `€${stats.overview.totalRevenue.toFixed(2)}`, sub: `${stats.overview.paidListingsCount} paid listings` },
                    { label: "Inquiries", value: stats.overview.totalInquiries, sub: "product enquiries" },
                    { label: "Listing Views", value: stats.overview.totalListingViews, sub: "across active listings" },
                  ].map(card => (
                    <div key={card.label} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-neutral-400 text-xs mb-2">{card.label}</p>
                      <p className="text-2xl font-bold text-black">{card.value}</p>
                      <p className="text-neutral-400 text-xs mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-semibold mb-4 text-neutral-700">Active Listings by Category</h2>
                  <div className="space-y-2.5">
                    {Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                      const total = stats.overview.activeListings || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-600 capitalize">{cat.replace(/_/g, " ")}</span>
                            <span className="text-neutral-400">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {Object.keys(stats.categoryBreakdown).length === 0 && (
                      <p className="text-neutral-400 text-sm">No active listings yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold mb-4 text-neutral-700">Recent Listings</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.recentListings.slice(0, 8).map(l => (
                      <AdminListingCard key={l.id} listing={l} />
                    ))}
                  </div>
                  {stats.recentListings.length === 0 && (
                    <p className="text-sm text-neutral-400">Listinguid pole veel.</p>
                  )}
                </div>
              </div>
            )}

            {/* DRAFTS */}
            {tab === "Drafts" && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-500 mb-4">{stats.draftListings.length} unpaid listing{stats.draftListings.length !== 1 ? "s" : ""} — created but payment not completed</p>
                {stats.draftListings.length === 0 && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-sm">
                    No drafts at the moment.
                  </div>
                )}
                {!stats.gaPropertyId && stats.draftListings.some(d => !d.email) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-2">
                    Add <code className="font-mono bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to Vercel env to see user emails.
                  </div>
                )}
                {stats.draftListings.map(l => (
                  <div key={l.id} className="bg-white border border-neutral-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black">{l.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {l.category.replace(/_/g, " ")} · {l.location || "—"} · {timeAgo(l.created_at)}
                      </p>
                      {l.email && (
                        <a
                          href={`mailto:${l.email}?subject=Your%20Racesin%20listing%20is%20waiting&body=Hi%2C%0A%0AYour%20listing%20%22${encodeURIComponent(l.title)}%22%20is%20ready%20to%20be%20published%20on%20Racesin%20Market.%20Complete%20payment%20to%20go%20live%3A%0Ahttps%3A%2F%2Fracesin.com%2Fmarket%2Fmy-listings`}
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          {l.email}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium">€{Math.round(l.price).toLocaleString("de-DE")}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">unpaid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INQUIRIES */}
            {tab === "Inquiries" && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-500 mb-2">{stats.overview.totalInquiries} product enquiries total</p>
                {stats.recentInquiries.length === 0 && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-sm">
                    No inquiries yet.
                  </div>
                )}
                {stats.recentInquiries.map(inq => (
                  <div key={inq.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-medium text-black">{inq.name}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                          <a href={`mailto:${inq.email}`} className="hover:text-black transition">{inq.email}</a>
                          {inq.phone && <span>{inq.phone}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {inq.product_name && (
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">{inq.product_name}</span>
                        )}
                        <p className="text-xs text-neutral-400 mt-1">{timeAgo(inq.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed bg-neutral-50 rounded-xl p-3 border border-neutral-100">{inq.message}</p>
                    <div className="mt-3">
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${inq.product_name ? `${inq.product_name} enquiry` : "Your enquiry"}`}
                        className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium hover:opacity-80 transition"
                      >
                        Reply
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTINGS */}
            {tab === "Listings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-500">
                    {listingsLoading ? "Loading…" : `${allListings.length} listings total`}
                  </p>
                  <button
                    onClick={() => setModalListing(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Listing
                  </button>
                </div>

                {listingsLoading ? (
                  <div className="py-12 text-center text-neutral-400 text-sm">Loading listings…</div>
                ) : allListings.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 text-sm">No listings yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {allListings.map(l => (
                      <AdminListingCard
                        key={l.id}
                        listing={l}
                        onEdit={() => setModalListing(l)}
                        onDelete={async () => {
                          if (!confirm(`Kustuta "${l.title}"? Seda ei saa tagasi võtta.`)) return
                          const res = await fetch("/api/admin/listings", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: l.id }),
                          })
                          if (res.ok) setAllListings(prev => prev.filter(x => x.id !== l.id))
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {tab === "Analytics" && (
              <div className="space-y-6">
                {/* GA4 overview stats */}
                {/* Date range selector */}
                <div className="flex gap-1.5">
                  {[
                    { label: "7 päeva", value: "7" },
                    { label: "28 päeva", value: "28" },
                    { label: "90 päeva", value: "90" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setGa4Days(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        ga4Days === opt.value ? "bg-black text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-black"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {ga4Loading && (
                  <div className="text-neutral-400 text-sm">Loading GA4 data…</div>
                )}

                {ga4Error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 space-y-1">
                    <p className="font-medium">GA4 not connected</p>
                    <p>{ga4Error === "GA4 not configured"
                      ? "Add GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON to Vercel env vars to see live analytics."
                      : ga4Error}</p>
                  </div>
                )}

                {ga4 && (
                  <>
                    {/* Live */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                        <span className="text-sm font-semibold text-neutral-800">Live praegu</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-black">{ga4.realtime.activeUsers}</span>
                        <span className="text-sm text-neutral-400">aktiivset kasutajat</span>
                      </div>
                      {ga4.realtime.pages.length > 0 && (
                        <div className="ml-auto flex gap-2 flex-wrap justify-end">
                          {ga4.realtime.pages.map(p => (
                            <span key={p.page} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                              {p.page} <span className="font-semibold text-black">{p.users}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Page Views", value: ga4.overview.pageViews.toLocaleString(), sub: `viimased ${ga4Days} päeva` },
                        { label: "Sessions", value: ga4.overview.sessions.toLocaleString(), sub: `viimased ${ga4Days} päeva` },
                        { label: "Active Users", value: ga4.overview.activeUsers.toLocaleString(), sub: `viimased ${ga4Days} päeva` },
                        { label: "Avg. Session", value: `${Math.round(ga4.overview.avgSessionDuration)}s`, sub: `${Math.round(ga4.overview.bounceRate * 100)}% bounce rate` },
                      ].map(card => (
                        <div key={card.label} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                          <p className="text-neutral-400 text-xs mb-2">{card.label}</p>
                          <p className="text-2xl font-bold text-black">{card.value}</p>
                          <p className="text-neutral-400 text-xs mt-1">{card.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-neutral-100">
                        <h2 className="text-sm font-semibold text-neutral-700">Top Pages</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Enim külastatud lehed</p>
                      </div>
                      <div className="divide-y divide-neutral-100">
                        {ga4.topPages.map((page, i) => {
                          const maxViews = ga4.topPages[0]?.views || 1
                          const pct = Math.round((page.views / maxViews) * 100)
                          return (
                            <div key={page.path} className="px-5 py-3.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs text-neutral-300 w-4 shrink-0">#{i + 1}</span>
                                  <span className="text-sm font-mono text-neutral-700 truncate">{page.path}</span>
                                </div>
                                <span className="text-sm font-semibold text-black shrink-0 ml-4">{page.views.toLocaleString()}</span>
                              </div>
                              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden ml-6">
                                <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Countries */}
                      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-neutral-100">
                          <h2 className="text-sm font-semibold text-neutral-700">Riigid</h2>
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {ga4.countries.map((c, i) => {
                            const max = ga4.countries[0]?.sessions || 1
                            const pct = Math.round((c.sessions / max) * 100)
                            return (
                              <div key={c.name} className="px-5 py-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-300 w-4">#{i + 1}</span>
                                    <span className="text-sm text-neutral-700">{c.name || "Unknown"}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-black">{c.sessions.toLocaleString()}</span>
                                </div>
                                <div className="h-1 bg-neutral-100 rounded-full overflow-hidden ml-6">
                                  <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Cities */}
                      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-neutral-100">
                          <h2 className="text-sm font-semibold text-neutral-700">Linnad</h2>
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {ga4.cities.map((c, i) => {
                            const max = ga4.cities[0]?.sessions || 1
                            const pct = Math.round((c.sessions / max) * 100)
                            return (
                              <div key={c.name} className="px-5 py-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-300 w-4">#{i + 1}</span>
                                    <span className="text-sm text-neutral-700">{c.name || "Unknown"}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-black">{c.sessions.toLocaleString()}</span>
                                </div>
                                <div className="h-1 bg-neutral-100 rounded-full overflow-hidden ml-6">
                                  <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* GA4 link */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-800">Google Analytics</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {stats.gaPropertyId ? `Measurement ID: ${stats.gaPropertyId}` : "Open GA4 for full reports"}
                    </p>
                  </div>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:opacity-80 transition"
                  >
                    Open GA4 ↗
                  </a>
                </div>

                {/* Top listings by views */}
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-700">Top Listings by Views</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">Active listings with most views on Racesin Market</p>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {stats.topListingsByViews.length === 0 && (
                      <p className="px-5 py-4 text-sm text-neutral-400">No listing views yet.</p>
                    )}
                    {stats.topListingsByViews.map((l, i) => {
                      const maxViews = stats.topListingsByViews[0]?.views || 1
                      const pct = Math.round((l.views / maxViews) * 100)
                      return (
                        <div key={l.id} className="px-5 py-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs text-neutral-300 w-4 shrink-0">#{i + 1}</span>
                              <a href={`/market/listing/${l.id}`} target="_blank" className="text-sm font-medium text-black hover:underline truncate">
                                {l.title}
                              </a>
                            </div>
                            <span className="text-sm font-semibold text-black shrink-0 ml-4">{l.views}</span>
                          </div>
                          <div className="h-1 bg-neutral-100 rounded-full overflow-hidden ml-6">
                            <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* EMAILS */}
            {tab === "Emails" && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-500 mb-4">Last 20 emails sent via Resend</p>
                {stats.resendEmails.length === 0 && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-sm">
                    No email data available.
                  </div>
                )}
                {stats.resendEmails.map(email => (
                  <div key={email.id} className="bg-white border border-neutral-200 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black truncate">{email.subject}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{email.to?.join(", ")}</p>
                    </div>
                    <p className="text-xs text-neutral-400 shrink-0">{timeAgo(email.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Admin listing modal — undefined = closed, null = create new, AdminListing = edit */}
      {modalListing !== undefined && (
        <AdminListingModal
          listing={modalListing}
          onClose={() => setModalListing(undefined)}
          onSaved={saved => {
            setModalListing(undefined)
            setAllListings(prev => {
              const idx = prev.findIndex(l => l.id === saved.id)
              if (idx >= 0) {
                const next = [...prev]
                next[idx] = saved
                return next
              }
              return [saved, ...prev]
            })
          }}
        />
      )}
    </div>
  )
}
