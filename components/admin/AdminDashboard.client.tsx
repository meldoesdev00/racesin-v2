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

const tabs = ["Overview", "Inquiries", "Listings", "Emails"] as const
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
    active: "bg-green-500/15 text-green-400",
    pending_payment: "bg-amber-500/15 text-amber-400",
    sold: "bg-blue-500/15 text-blue-400",
    expired: "bg-neutral-700 text-neutral-400",
  }
  return map[status] ?? "bg-neutral-700 text-neutral-400"
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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/racesin-logo-black-desktop.png" alt="Racesin" width={100} height={28} className="invert" />
          <span className="text-neutral-600 text-sm">|</span>
          <span className="text-neutral-400 text-sm font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://www.racesin.com" target="_blank" rel="noopener" className="text-xs text-neutral-500 hover:text-white transition">
            View site ↗
          </a>
          <button onClick={logout} className="text-xs text-neutral-500 hover:text-red-400 transition">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-neutral-900 rounded-xl p-1 w-fit border border-neutral-800">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-neutral-500 text-sm">Loading…</div>
        )}

        {!loading && stats && (
          <>
            {/* OVERVIEW */}
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: stats.overview.totalUsers, sub: "registered accounts" },
                    { label: "Active Listings", value: stats.overview.activeListings, sub: `${stats.overview.pendingListings} pending payment` },
                    { label: "Total Revenue", value: `€${stats.overview.totalRevenue.toFixed(2)}`, sub: `${stats.overview.paidListingsCount} paid listings` },
                    { label: "Inquiries", value: stats.overview.totalInquiries, sub: "product enquiries" },
                  ].map(card => (
                    <div key={card.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                      <p className="text-neutral-500 text-xs mb-2">{card.label}</p>
                      <p className="text-2xl font-bold text-white">{card.value}</p>
                      <p className="text-neutral-600 text-xs mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Category breakdown */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold mb-4 text-neutral-300">Active Listings by Category</h2>
                  <div className="space-y-2">
                    {Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                      const total = stats.overview.activeListings || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400 capitalize">{cat.replace(/_/g, " ")}</span>
                            <span className="text-neutral-500">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white/30 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {Object.keys(stats.categoryBreakdown).length === 0 && (
                      <p className="text-neutral-600 text-sm">No active listings yet</p>
                    )}
                  </div>
                </div>

                {/* Recent listings preview */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold mb-4 text-neutral-300">Recent Listings</h2>
                  <div className="space-y-2">
                    {stats.recentListings.slice(0, 5).map(l => (
                      <div key={l.id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                        <div>
                          <a href={`/market/listing/${l.id}`} target="_blank" className="text-sm text-white hover:underline">{l.title}</a>
                          <p className="text-xs text-neutral-500">{l.location || "—"} · {timeAgo(l.created_at)}</p>
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

            {/* INQUIRIES */}
            {tab === "Inquiries" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-neutral-300">{stats.overview.totalInquiries} product enquiries</h2>
                </div>
                {stats.recentInquiries.length === 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-sm">
                    No inquiries yet — make sure to run the SQL to create the contact_submissions table.
                  </div>
                )}
                {stats.recentInquiries.map(inq => (
                  <div key={inq.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-medium text-white">{inq.name}</p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                          <a href={`mailto:${inq.email}`} className="hover:text-white transition">{inq.email}</a>
                          {inq.phone && <span>{inq.phone}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {inq.product_name && (
                          <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">{inq.product_name}</span>
                        )}
                        <p className="text-xs text-neutral-600 mt-1">{timeAgo(inq.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed bg-neutral-800/50 rounded-xl p-3">{inq.message}</p>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${inq.product_name ? `${inq.product_name} enquiry` : "Your enquiry"}`}
                        className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium hover:bg-neutral-200 transition"
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-800">
                  <h2 className="text-sm font-semibold text-neutral-300">{stats.overview.totalListings} total listings</h2>
                </div>
                <div className="divide-y divide-neutral-800">
                  {stats.recentListings.map(l => (
                    <div key={l.id} className="px-5 py-3.5 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <a href={`/market/listing/${l.id}`} target="_blank" className="text-sm text-white hover:underline truncate block">
                          {l.title}
                        </a>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {l.category.replace(/_/g, " ")} · {l.location || "—"} · {timeAgo(l.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <p className="text-sm font-medium">€{Math.round(l.price).toLocaleString("de-DE")}</p>
                          <p className="text-xs text-neutral-500">{l.views} views</p>
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
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4">
                  <p className="text-xs text-neutral-500">Last 20 emails sent via Resend</p>
                </div>
                {stats.resendEmails.length === 0 && (
                  <div className="text-neutral-500 text-sm">No email data available.</div>
                )}
                {stats.resendEmails.map(email => (
                  <div key={email.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{email.subject}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{email.to?.join(", ")}</p>
                    </div>
                    <p className="text-xs text-neutral-600 shrink-0">{timeAgo(email.created_at)}</p>
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
