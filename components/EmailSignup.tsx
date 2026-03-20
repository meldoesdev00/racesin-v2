"use client"

import Image from "next/image"
import { useState } from "react"

export default function EmailSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<null | { code: string }>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const json = await res.json()
      if (res.ok) {
        setSuccess({ code: json.code || "WELCOME10" })
        setEmail("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="rounded-[28px] bg-[#f5f5f4] overflow-hidden">

          {/* IMAGE COLUMN WIDER + FULL HEIGHT ALIGNMENT */}
          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] md:items-stretch">

            {/* LEFT CONTENT */}
            <div className="px-6 py-12 sm:px-8 md:px-16 md:py-16">
              <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900">
                Sign up for our newsletter
              </h2>

              <p className="mt-6 max-w-xl text-lg text-neutral-600">
                Get the latest news, exclusive offers, and updates on our sim racing products and events — straight to your inbox.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 max-w-xl">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email address
                </label>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="example@provider.com"
                    className="flex-1 rounded-full border border-neutral-400 bg-transparent px-6 py-4 text-base outline-none focus:border-neutral-900"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-neutral-900 px-8 py-4 text-base font-medium text-white hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {isLoading ? "Signing..." : "Sign up"}
                  </button>
                </div>

                {success && (
                  <div className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
                    Success — your code: <strong>{success.code}</strong>
                  </div>
                )}
              </form>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative hidden md:block h-full">
              <Image
                src="/aboutpic2.jpg"
                alt="Newsletter"
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}