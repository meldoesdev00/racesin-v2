"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
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

export async function markAsSold(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidatePath(`/market/listing/${listingId}`)
  revalidatePath("/market/my-listings")
  return { ok: true }
}
