"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push("/admin")
      router.refresh()
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/racesin-logo-black-desktop.png" alt="Racesin" width={120} height={32} className="invert" />
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-1">Admin Panel</h1>
          <p className="text-neutral-500 text-sm mb-6">Sign in to access the dashboard</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
