"use client"

import { useEffect, useState } from "react"

type Preferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = "racesin_cookie_preferences"

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default function CookieConsent() {
  const [bannerVisible, setBannerVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const [prefs, setPrefs] = useState<Preferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID

  // Initialize consent mode default = denied
  useEffect(() => {
    if (!GA_ID) return

    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }

    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    })

    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      setBannerVisible(true)
    } else {
      const parsed = JSON.parse(saved)
      setPrefs(parsed)
      applyConsent(parsed)
      if (parsed.analytics) loadGA()
    }
  }, [])

  function loadGA() {
    if (!GA_ID) return
    if (document.getElementById("ga-script")) return

    const script = document.createElement("script")
    script.id = "ga-script"
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`

    // ✅ FIX: käivita gtag config alles pärast scripti laadimist
    script.onload = () => {
      window.gtag("js", new Date())
      window.gtag("config", GA_ID, {
        anonymize_ip: true,
      })
    }

    document.head.appendChild(script)
  }

  function applyConsent(p: Preferences) {
    window.gtag("consent", "update", {
      analytics_storage: p.analytics ? "granted" : "denied",
      ad_storage: p.marketing ? "granted" : "denied",
      ad_user_data: p.marketing ? "granted" : "denied",
      ad_personalization: p.marketing ? "granted" : "denied",
    })
  }

  function save(p: Preferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
    setPrefs(p)
    setBannerVisible(false)
    setModalOpen(false)

    applyConsent(p)

    if (p.analytics) loadGA()
  }

  function acceptAll() {
    save({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  function rejectAll() {
    save({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  if (!bannerVisible && !modalOpen) return null

  return (
    <>
      {/* ================= BANNER ================= */}
      {bannerVisible && !modalOpen && (
        <>
          {/* MOBILE VERSION */}
          <div className="fixed bottom-0 left-0 w-full bg-black text-white z-50 p-6 md:hidden">
            <p className="text-sm leading-relaxed mb-4">
              We use cookies to enhance your experience, analyze traffic,
              and improve marketing relevance.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={acceptAll}
                className="bg-white text-black py-2 rounded-md text-sm font-medium"
              >
                Accept all
              </button>

              <button
                onClick={rejectAll}
                className="border border-white py-2 rounded-md text-sm"
              >
                Reject non-essential
              </button>

              <button
                onClick={() => setModalOpen(true)}
                className="underline text-sm"
              >
                Preferences
              </button>
            </div>
          </div>

          {/* DESKTOP VERSION */}
          <div className="hidden md:block fixed bottom-6 right-6 z-50">
            <div className="bg-white text-black w-[420px] rounded-2xl shadow-2xl p-6 border">
              <p className="text-sm leading-relaxed mb-5">
                We use cookies to enhance your experience, analyze traffic,
                and improve marketing relevance.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={acceptAll}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                >
                  Accept all
                </button>

                <button
                  onClick={rejectAll}
                  className="bg-gray-200 px-4 py-2 rounded-lg text-sm"
                >
                  Reject non-essential
                </button>

                <button
                  onClick={() => setModalOpen(true)}
                  className="underline text-sm"
                >
                  Preferences
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Customize your cookie preferences
              </h2>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Necessary cookies are always enabled. You can enable or disable
              other categories below.
            </p>

            <div className="space-y-6">
              {/* Necessary */}
              <Toggle
                title="Necessary cookies"
                description="Required for the website to function properly."
                checked={true}
                disabled
              />

              {/* Analytics */}
              <Toggle
                title="Analytical Cookies"
                description="Help us understand website traffic (Google Analytics)."
                checked={prefs.analytics}
                onChange={(v) => setPrefs({ ...prefs, analytics: v })}
              />

              {/* Marketing */}
              <Toggle
                title="Marketing Cookies"
                description="Used for advertising and personalization."
                checked={prefs.marketing}
                onChange={(v) => setPrefs({ ...prefs, marketing: v })}
              />
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={acceptAll}
                  className="bg-black text-white px-6 py-2 rounded-lg text-sm"
                >
                  Accept all
                </button>

                <button
                  onClick={rejectAll}
                  className="border border-black px-6 py-2 rounded-lg text-sm"
                >
                  Reject non-essential
                </button>
              </div>

              <button
                onClick={() => save(prefs)}
                className="underline text-sm"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ================= TOGGLE COMPONENT ================= */

function Toggle({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string
  description: string
  checked: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex justify-between items-center border p-4 rounded-xl">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <button
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`relative w-12 h-6 rounded-full transition ${
          checked ? "bg-black" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  )
}