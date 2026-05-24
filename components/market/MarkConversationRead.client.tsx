"use client"

import { useState, useTransition } from "react"
import { markConversationRead } from "@/app/market/messages/actions"

export default function MarkConversationRead({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await markConversationRead(conversationId)
      setDone(true)
    })
  }

  if (done) return null

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 text-[10px] text-neutral-400 hover:text-black border border-neutral-200 hover:border-black rounded-full px-2 py-0.5 transition disabled:opacity-40"
    >
      {pending ? "…" : "Mark read"}
    </button>
  )
}
