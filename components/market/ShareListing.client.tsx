"use client"

import { useState } from "react"

export default function ShareListing({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium text-neutral-500 mb-2.5">Share listing</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
          <p className="text-xs text-neutral-500 truncate">{url}</p>
        </div>
        <button
          onClick={copy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
            copied
              ? "bg-green-500 text-white"
              : "bg-black text-white hover:opacity-80"
          }`}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
