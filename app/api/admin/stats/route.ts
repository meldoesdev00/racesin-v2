import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/adminAuth"
import { createClient } from "@/lib/supabase/server"
import { LISTING_FEE } from "@/lib/supabase/types"

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeListings },
    { count: pendingListings },
    { count: totalListings },
    { data: recentListings },
    { data: draftListings },
    { data: recentInquiries },
    { count: totalInquiries },
    { data: listingsByCategory },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id, title, price, status, created_at, views, category, location")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("listings")
      .select("id, title, price, created_at, category, location")
      .eq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("category")
      .eq("status", "active"),
  ])

  // Revenue: count paid listings (active + sold/expired that went active) × fee
  // Simplest proxy: total listings that ever became active = total - pending
  const paidListingsCount = (totalListings ?? 0) - (pendingListings ?? 0)
  const totalRevenue = paidListingsCount * LISTING_FEE

  // Category breakdown
  const categoryCount: Record<string, number> = {}
  for (const row of listingsByCategory ?? []) {
    categoryCount[row.category] = (categoryCount[row.category] ?? 0) + 1
  }

  // Resend recent emails
  let resendEmails: { id: string; to: string[]; subject: string; created_at: string }[] = []
  try {
    const res = await fetch("https://api.resend.com/emails?limit=20", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      next: { revalidate: 0 },
    })
    if (res.ok) {
      const json = await res.json()
      resendEmails = json.data ?? []
    }
  } catch {}

  return NextResponse.json({
    overview: {
      totalUsers: totalUsers ?? 0,
      activeListings: activeListings ?? 0,
      pendingListings: pendingListings ?? 0,
      totalListings: totalListings ?? 0,
      paidListingsCount,
      totalRevenue,
      totalInquiries: totalInquiries ?? 0,
    },
    recentListings: recentListings ?? [],
    draftListings: draftListings ?? [],
    recentInquiries: recentInquiries ?? [],
    categoryBreakdown: categoryCount,
    resendEmails,
  })
}
