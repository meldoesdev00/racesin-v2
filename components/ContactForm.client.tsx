"use client"

import { useState } from "react"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      })

      const json = await res.json()
      if (res.ok) {
        setSuccess(true)
        setName("")
        setEmail("")
        setPhone("")
        setMessage("")
      } else {
        setError(json.error || "Submission failed")
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-100 p-6">
        <h3 className="text-lg font-semibold text-green-800">Thanks — we got your message</h3>
        <p className="mt-2 text-sm text-green-700">We'll reply soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full rounded-2xl border px-4 py-3 min-h-[120px]"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-neutral-900 px-6 py-3 text-white font-medium disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Message"}
        </button>

        <button
          type="button"
          onClick={() => { setName(""); setEmail(""); setPhone(""); setMessage("") }}
          className="rounded-2xl border px-6 py-3"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
