"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify user is part of this conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, seller_id, buyer_id")
    .eq("id", conversationId)
    .single()

  if (!conv || (conv.seller_id !== user.id && conv.buyer_id !== user.id)) return

  // Use service role to bypass RLS for updating read status
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await adminSupabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)

  revalidatePath("/market/messages")
}
