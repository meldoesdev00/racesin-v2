"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { listingUrl } from "@/lib/slugify"
import { createClient } from "@/lib/supabase/client"
import { timeAgo } from "@/lib/supabase/types"
import type { Message, Profile } from "@/lib/supabase/types"

type ListingPreview = {
  id: string
  title: string
  price: number
  coverImage: string | null
}

type Props = {
  conversation: { id: string; listing_id: string | null; listing_title: string | null; seller_id: string; buyer_id: string }
  initialMessages: Message[]
  currentUserId: string
  otherPerson: Profile | null
  listingPreview: ListingPreview | null
}

export default function ChatWindow({ conversation, initialMessages, currentUserId, otherPerson, listingPreview }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversation.id)
      .neq("sender_id", currentUserId)
      .then(() => {})
  }, [conversation.id, currentUserId])

  useEffect(() => {
    const channel = supabase
      .channel(`conv:${conversation.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg])
        if (msg.sender_id !== currentUserId) {
          supabase.from("messages").update({ read: true }).eq("id", msg.id).then(() => {})
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversation.id, currentUserId])

  async function send() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText("")
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content,
    })
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Back */}
      <Link href="/market/messages" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-black transition w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        All messages
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">

        {/* LEFT: listing + person */}
        <div className="space-y-3">
          {/* Listing preview */}
          {listingPreview && (
            <Link
              href={listingUrl(listingPreview.title, listingPreview.id)}
              className="block bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-400 transition"
            >
              <div className="aspect-[4/3] bg-neutral-100 relative">
                {listingPreview.coverImage ? (
                  <Image src={listingPreview.coverImage} alt={listingPreview.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">{listingPreview.title}</p>
                <p className="text-base font-bold mt-1">€{Math.round(listingPreview.price).toLocaleString("de-DE")}</p>
                <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View listing
                </p>
              </div>
            </Link>
          )}

          {/* Other person */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold flex-shrink-0">
              {otherPerson?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold">{otherPerson?.name ?? "Unknown"}</p>
              <p className="text-xs text-neutral-400">Private seller</p>
            </div>
          </div>
        </div>

        {/* RIGHT: chat */}
        <div className="bg-white rounded-2xl border border-neutral-200 flex flex-col overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>

          {/* Chat header */}
          <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xs font-semibold flex-shrink-0">
              {otherPerson?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <p className="text-sm font-semibold">{otherPerson?.name ?? "Unknown"}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-center text-neutral-400 text-sm py-12">No messages yet. Say hello!</p>
            )}
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === currentUserId
              const showTime = i === 0 || (
                new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 5 * 60 * 1000
              )
              const prevIsMine = i > 0 && messages[i - 1].sender_id === currentUserId
              const grouped = i > 0 && prevIsMine === isMine && !showTime

              return (
                <div key={msg.id}>
                  {showTime && (
                    <p className="text-center text-xs text-neutral-300 py-3">{timeAgo(msg.created_at)}</p>
                  )}
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-2"}`}>
                    <div className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? `bg-black text-white ${grouped ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"}`
                        : `bg-neutral-100 text-neutral-900 ${grouped ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"}`
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-neutral-100 flex gap-2 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition resize-none"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = "auto"
                t.style.height = t.scrollHeight + "px"
              }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:opacity-80 transition disabled:opacity-30 flex-shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m22 2-7 20-4-9-9-4 20-7Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
