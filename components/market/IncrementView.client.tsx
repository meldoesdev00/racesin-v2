"use client"

import { useEffect, useRef } from "react"
import { incrementViewIfNew } from "@/app/market/listing/[id]/actions"

export default function IncrementView({ listingId }: { listingId: string }) {
  const called = useRef(false)
  useEffect(() => {
    if (called.current) return
    called.current = true
    incrementViewIfNew(listingId)
  }, [listingId])
  return null
}
