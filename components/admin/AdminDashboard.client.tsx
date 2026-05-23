"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Stats = {
  overview: {
    totalUsers: number
    activeListings: number
    pendingListings: number
    totalListings: number
    paidListingsCount: number
    totalRevenue: number
    totalInquiries: number
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
  }[]
  draftListings: {
    id: string
    title: string
    price: number
    created_at: string
    category: string
    location: string
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
}

const tabs = ["Overview", "Drafts", "Inquiries", "Listings", "Emails"] as const
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

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("Overview")

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Users", value: stats.overview.totalUsers, sub: "registered accounts" },
                    { label: "Active Listings", value: stats.overview.activeListings, sub: `${stats.overview.pendingListings} unpaid drafts` },
                    { label: "Revenue", value: `€${stats.overview.totalRevenue.toFixed(2)}`, sub: `${stats.overview.paidListingsCount} paid listings` },
                    { label: "Inquiries", value: stats.overview.totalInquiries, sub: "product enquiries" },
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

                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-semibold mb-4 text-neutral-700">Recent Listings</h2>
                  <div className="space-y-0 divide-y divide-neutral-100">
                    {stats.recentListings.slice(0, 5).map(l => (
                      <div key={l.id} className="flex items-center justify-between py-3">
                        <div>
                          <a href={`/market/listing/${l.id}`} target="_blank" className="text-sm font-medium text-black hover:underline">{l.title}</a>
                          <p className="text-xs text-neutral-400 mt-0.5">{l.location || "—"} · {timeAgo(l.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">€{Math.round(l.price).toLocaleString("de-DE")}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(l.status)}`}>
                            {l.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                {stats.draftListings.map(l => (
                  <div key={l.id} className="bg-white border border-neutral-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-black">{l.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {l.category.replace(/_/g, " ")} · {l.location || "—"} · created {timeAgo(l.created_at)}
                      </p>
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
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-700">{stats.overview.totalListings} total listings</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {stats.recentListings.map(l => (
                    <div key={l.id} className="px-5 py-3.5 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <a href={`/market/listing/${l.id}`} target="_blank" className="text-sm font-medium text-black hover:underline truncate block">
                          {l.title}
                        </a>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {l.category.replace(/_/g, " ")} · {l.location || "—"} · {timeAgo(l.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-medium">€{Math.round(l.price).toLocaleString("de-DE")}</p>
                          <p className="text-xs text-neutral-400">{l.views} views</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(l.status)}`}>
                          {l.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
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
    </div>
  )
}
