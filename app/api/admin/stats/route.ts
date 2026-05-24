import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/adminAuth"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { LISTING_FEE } from "@/lib/supabase/types"

const SYSTEM_EMAIL = "listings@racesin.com"
let cachedSystemUserId: string | null = null

async function resolveSystemUserId(serviceRoleKey: string): Promise<string | null> {
  if (cachedSystemUserId) return cachedSystemUserId
  try {
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    let page = 1
    while (true) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      const found = data?.users?.find(u => u.email === SYSTEM_EMAIL)
      if (found) { cachedSystemUserId = found.id; return cachedSystemUserId }
      if ((data?.users?.length ?? 0) < 1000) break
      page++
    }
  } catch {}
  return null
}

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
    { data: topListingsByViews },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id, title, price, status, created_at, views, category, location, listing_images(url, position)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("listings")
      .select("id, title, price, created_at, category, location, user_id")
      .eq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("category").eq("status", "active"),
    supabase
      .from("listings")
      .select("id, title, views, category")
      .eq("status", "active")
      .order("views", { ascending: false })
      .limit(10),
  ])

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Resolve user emails for drafts via service role key
  type DraftWithEmail = typeof draftListings extends (infer T)[] | null ? T & { email?: string } : never
  let draftsWithEmail: DraftWithEmail[] = (draftListings ?? []) as DraftWithEmail[]
  if (serviceRoleKey && draftListings && draftListings.length > 0) {
    try {
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      )
      const userIds = [...new Set(draftListings.map(d => d.user_id))]
      const emailMap: Record<string, string> = {}
      await Promise.all(userIds.map(async (uid) => {
        const { data } = await adminSupabase.auth.admin.getUserById(uid)
        if (data?.user?.email) emailMap[uid] = data.user.email
      }))
      draftsWithEmail = draftListings.map(d => ({
        ...d,
        email: emailMap[d.user_id],
      }))
    } catch {}
  }

  // Exclude admin-created listings from revenue (they were never paid for)
  const systemUserId = serviceRoleKey ? await resolveSystemUserId(serviceRoleKey) : null
  let adminListingCount = 0
  if (systemUserId) {
    const { count } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", systemUserId)
      .neq("status", "pending_payment")
    adminListingCount = count ?? 0
  }
  const paidListingsCount = (totalListings ?? 0) - (pendingListings ?? 0) - adminListingCount
  const totalRevenue = paidListingsCount * LISTING_FEE

  const categoryCount: Record<string, number> = {}
  for (const row of listingsByCategory ?? []) {
    categoryCount[row.category] = (categoryCount[row.category] ?? 0) + 1
  }

  // Total listing views
  const totalViews = (topListingsByViews ?? []).reduce((sum, l) => sum + (l.views ?? 0), 0)

  // Resend recent emails
  let resendEmails: { id: string; to: string[]; subject: string; created_at: string }[] = []
  try {
    const res = await fetch("https://api.resend.com/emails?limit=20", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      cache: "no-store",
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
      totalListingViews: totalViews,
    },
    recentListings: recentListings ?? [],
    draftListings: draftsWithEmail,
    topListingsByViews: topListingsByViews ?? [],
    recentInquiries: recentInquiries ?? [],
    categoryBreakdown: categoryCount,
    resendEmails,
    gaPropertyId: process.env.NEXT_PUBLIC_GA_ID ?? null,
  })
}
