"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function incrementViewIfNew(listingId: string) {
  const cookieStore = await cookies()
  const viewed = (cookieStore.get("viewed_listings")?.value ?? "").split(",").filter(Boolean)
  if (viewed.includes(listingId)) return

  const supabase = await createClient()
  supabase.rpc("increment_listing_views", { p_listing_id: listingId }).then(() => {})

  const next = [...viewed, listingId].slice(-200).join(",")
  cookieStore.set("viewed_listings", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
  })
}
