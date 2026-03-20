"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user already saw the popup
    const hasSeenPopup = localStorage.getItem("seenWelcomePopup")
    
    // Show popup after 2 seconds if user hasn't seen it
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem("seenWelcomePopup", "true")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setShowCode(false)
    setEmail("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setShowCode(true)
      }
    } catch (error) {
      console.error("Error subscribing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-[30px] bg-[#4d4b3c] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white text-2xl z-10 hover:opacity-80"
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex flex-col p-8 sm:p-10">
          {/* Logo/Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-12 w-32">
              <Image
                src="/logo.png"
                alt="Racesin"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {!showCode ? (
            <>
              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
                You've got 10% off
              </h2>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-white/90 mb-8">
                Join our community and unlock exclusive deals
              </p>

              {/* Email Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-full text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white"
                />

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 rounded-full bg-white text-[#4d4b3c] font-semibold hover:bg-neutral-100 transition disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Claim offer"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 rounded-full bg-[#4d4b3c] text-white border border-white font-semibold hover:bg-[#5a4f47] transition"
                  >
                    No thanks
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4 text-center">
                Your discount code
              </h2>

              <p className="text-center text-white/90 mb-6">
                Use this code at checkout
              </p>

              {/* Code Display */}
              <div className="bg-white/10 border border-white/30 rounded-full px-6 py-4 text-center mb-8">
                <p className="text-sm text-white/70 mb-2">Discount Code</p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-widest">
                  WELCOME10
                </p>
              </div>

              <p className="text-center text-white/80 text-sm mb-6">
                Code sent to {email}
              </p>

              <button
                onClick={handleClose}
                className="w-full px-6 py-3 rounded-full bg-white text-[#4d4b3c] font-semibold hover:bg-neutral-100 transition"
              >
                Start Shopping
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
