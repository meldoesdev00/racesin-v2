import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { timeAgo } from "@/lib/supabase/types"
import MarkConversationRead from "@/components/market/MarkConversationRead.client"

export const dynamic = "force-dynamic"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/market/auth?next=/market/messages")

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, messages(id, content, sender_id, read, created_at)")
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  const convs = conversations ?? []

  // Collect all unique user IDs we need profiles for
  const userIds = [...new Set(convs.flatMap((c) => [c.seller_id, c.buyer_id]))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", userIds.length ? userIds : ["none"])

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold mb-8">Messages</h1>

      {convs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-neutral-200 mb-4">
            <svg className="mx-auto" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-700 mb-2">No messages yet</p>
          <p className="text-neutral-400 text-sm mb-6">When you contact a seller or receive inquiries, they&apos;ll appear here.</p>
          <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-200 text-sm hover:border-black transition">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="max-w-2xl space-y-2">
          {convs.map((conv) => {
            const msgs = (conv.messages ?? []) as { id: string; content: string; sender_id: string; read: boolean; created_at: string }[]
            const lastMsg = [...msgs].sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            const otherPersonId = conv.seller_id === user.id ? conv.buyer_id : conv.seller_id
            const otherPerson = profileMap[otherPersonId]
            const unread = msgs.filter((m) => !m.read && m.sender_id !== user.id).length

            return (
              <Link
                key={conv.id}
                href={`/market/messages/${conv.id}`}
                className="flex items-center gap-4 bg-white border border-neutral-200 rounded-2xl p-4 hover:border-neutral-400 transition"
              >
                <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold text-sm flex-shrink-0">
                  {otherPerson?.name?.[0]?.toUpperCase() ?? "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${unread > 0 ? "font-bold text-black" : "font-semibold text-neutral-900"}`}>
                      {otherPerson?.name ?? "Unknown"}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">{timeAgo(lastMsg.created_at)}</span>
                    )}
                  </div>
                  {conv.listing_title && (
                    <p className="text-xs text-neutral-400 mb-0.5 truncate">Re: {conv.listing_title}</p>
                  )}
                  {lastMsg && (
                    <p className={`text-sm truncate ${unread > 0 ? "text-neutral-800 font-medium" : "text-neutral-500"}`}>
                      {lastMsg.sender_id === user.id ? "You: " : ""}{lastMsg.content}
                    </p>
                  )}
                </div>

                {unread > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <MarkConversationRead conversationId={conv.id} currentUserId={user.id} />
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-medium">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
