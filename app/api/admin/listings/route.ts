import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/adminAuth"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const SYSTEM_EMAIL = "listings@racesin.com"
let cachedSystemUserId: string | null = null

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(url, key)
}

async function getSystemUserId(): Promise<string> {
  if (cachedSystemUserId) return cachedSystemUserId

  const adminSupabase = getAdminSupabase()

  const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
    email: SYSTEM_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
  })

  if (!createErr && created.user) {
    await adminSupabase.from("profiles").upsert(
      { id: created.user.id, name: "Racesin" },
      { onConflict: "id" }
    )
    cachedSystemUserId = created.user.id
    return cachedSystemUserId
  }

  // User already exists — find it
  let page = 1
  while (true) {
    const { data: usersData } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 })
    const found = usersData?.users?.find(u => u.email === SYSTEM_EMAIL)
    if (found) {
      cachedSystemUserId = found.id
      return cachedSystemUserId
    }
    if ((usersData?.users?.length ?? 0) < 1000) break
    page++
  }

  throw new Error("Could not find or create system user")
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabase()
  const { data: listings, error } = await adminSupabase
    .from("listings")
    .select("*, listing_images(id, url, position)")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listings: listings ?? [] })
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, category, brand, seller_name, price, condition, city, country, phone, email } = body

  if (!title || !category || !price || !condition) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()
  const systemUserId = await getSystemUserId()

  const location = [city?.trim(), country].filter(Boolean).join(", ") || null

  const { data: listing, error } = await adminSupabase
    .from("listings")
    .insert({
      user_id: systemUserId,
      title: title.trim(),
      description: description?.trim() || null,
      category,
      brand: brand || null,
      seller_name: seller_name?.trim() || null,
      price: Number(price),
      original_price: Number(price),
      condition,
      location,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      status: "active",
      expires_at: null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listing }, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { id, title, description, category, brand, seller_name, price, condition, city, country, phone, email, status, removeImageIds } = body

  if (!id) return NextResponse.json({ error: "Missing listing id" }, { status: 400 })

  const adminSupabase = getAdminSupabase()
  const location = [city?.trim(), country].filter(Boolean).join(", ") || null

  const { data: listing, error } = await adminSupabase
    .from("listings")
    .update({
      title: title?.trim(),
      description: description?.trim() || null,
      category,
      brand: brand || null,
      seller_name: seller_name?.trim() || null,
      price: Number(price),
      condition,
      location,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      status,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (removeImageIds?.length > 0) {
    await adminSupabase.from("listing_images").delete().in("id", removeImageIds)
  }

  return NextResponse.json({ listing })
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing listing id" }, { status: 400 })

  const adminSupabase = getAdminSupabase()
  const { error } = await adminSupabase.from("listings").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
