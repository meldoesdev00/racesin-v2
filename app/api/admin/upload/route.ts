import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/adminAuth"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const listingId = formData.get("listingId") as string | null
  const position = Number(formData.get("position") ?? 0)

  if (!file || !listingId) {
    return NextResponse.json({ error: "Missing file or listingId" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `admin/${listingId}/${Date.now()}-${position}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await adminSupabase.storage
    .from("listing-images")
    .upload(path, arrayBuffer, { upsert: true, contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = adminSupabase.storage.from("listing-images").getPublicUrl(path)

  const { error: dbError } = await adminSupabase.from("listing_images").insert({
    listing_id: listingId,
    url: publicUrl,
    position,
  })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ url: publicUrl })
}
