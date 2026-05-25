"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  MARKET_CATEGORIES, CONDITIONS, BRANDS, LISTING_FEE, LISTING_DURATION_DAYS,
  conditionLabel, conditionStyle, categoryLabel,
} from "@/lib/supabase/types"

type FormData = {
  category: string
  brand: string
  title: string
  description: string
  price: string
  condition: string
  city: string
  country: string
  phone: string
  email: string
}

type ImageFile = { file: File; preview: string }

const DRAFT_KEY = "market_create_draft"

export default function CreateListingForm({ userEmail }: { userEmail?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window === "undefined") return {
      category: "", brand: "", title: "", description: "", price: "",
      condition: "good", city: "", country: "Estonia", phone: "", email: userEmail ?? "",
    }
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) return { ...JSON.parse(saved), email: userEmail ?? JSON.parse(saved).email }
    } catch {}
    return {
      category: "", brand: "", title: "", description: "", price: "",
      condition: "good", city: "", country: "Estonia", phone: "", email: userEmail ?? "",
    }
  })
  const [images, setImages] = useState<ImageFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Persist draft to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)) } catch {}
  }, [form])

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 8 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newFiles])
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function submit() {
    if (!form.category) { setError("Please select a category."); return }
    if (!form.title.trim()) { setError("Title is required."); return }
    if (!form.price) { setError("Price is required."); return }
    if (!form.city.trim()) { setError("City is required."); return }

    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const expiresAt = new Date(Date.now() + LISTING_DURATION_DAYS * 86400000).toISOString()

      const { data: listing, error: listingErr } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          category: form.category,
          brand: form.brand || null,
          price: Number(form.price),
          original_price: Number(form.price),
          condition: form.condition,
          location: [form.city.trim(), form.country].filter(Boolean).join(", ") || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          status: "pending_payment",
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (listingErr || !listing) throw new Error(listingErr?.message ?? "Failed to create listing")

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i]
        const ext = file.name.split(".").pop()
        const path = `${user.id}/${listing.id}/${i}.${ext}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { upsert: true })
        if (uploadErr || !uploadData) continue
        const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path)
        await supabase.from("listing_images").insert({ listing_id: listing.id, url: publicUrl, position: i })
      }

      // Clear draft before redirecting to payment
      try { localStorage.removeItem(DRAFT_KEY) } catch {}

      // Initiate Montonio payment
      const payRes = await fetch("/api/market/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      const payData = await payRes.json()
      if (!payRes.ok || !payData.payment_url) throw new Error(payData.error ?? "Failed to initiate payment")
      window.location.href = payData.payment_url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const previewPrice = form.price ? `€${Number(form.price).toLocaleString("et-EE")}` : "€—"
  const previewCategory = form.category ? categoryLabel(form.category) : null
  const previewCondition = form.condition ? conditionLabel(form.condition) : null
  const previewConditionStyle = form.condition ? conditionStyle(form.condition) : "bg-neutral-100 text-neutral-400"

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-2xl font-semibold mb-8">Post a Listing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT: FORM ── */}
        <div className="space-y-6">

          {/* Category */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <label className="text-sm font-semibold text-neutral-800 block mb-3">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MARKET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("category", cat.id)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium text-left transition ${
                    form.category === cat.id
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <label className="text-sm font-semibold text-neutral-800 block mb-3">Brand</label>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => set("brand", form.brand === brand ? "" : brand)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                    form.brand === brand
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Title + Description */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Fanatec CSL Elite Steering Wheel"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the item — age, condition, reason for selling, what's included..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition resize-none"
              />
            </div>
          </div>

          {/* Price + Condition */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Price (€) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Condition *</label>
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition bg-white"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location + Contact */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Tallinn"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition bg-white"
                >
                  {["Estonia","Latvia","Lithuania","Finland","Sweden","Norway","Denmark","Germany","Netherlands","Belgium","France","Spain","Italy","Poland","Czech Republic","Austria","Switzerland","United Kingdom","Ireland","Portugal","Hungary","Romania","Bulgaria","Croatia","Slovakia","Slovenia","Greece","Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+372 5xxx xxxx"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Contact email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <label className="text-sm font-semibold text-neutral-800 block mb-3">
              Photos <span className="font-normal text-neutral-400">({images.length}/8)</span>
            </label>

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center cursor-pointer hover:border-black transition"
              >
                <svg className="mx-auto text-neutral-300 mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm font-medium text-neutral-500">Click or drag photos here</p>
                <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WEBP · up to 8 photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={img.preview} alt="" fill className="object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">Cover</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-black flex items-center justify-center text-neutral-300 hover:text-black transition"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

        </div>

        {/* ── RIGHT: PREVIEW + PUBLISH ── */}
        <div className="lg:sticky lg:top-24 space-y-4">

          {/* Live preview card */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-4 pt-4 pb-3 border-b border-neutral-100">
              Preview
            </p>

            {/* Cover image */}
            <div className="aspect-[4/3] bg-neutral-100 relative">
              {images[0] ? (
                <Image src={images[0].preview} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-xs mt-2">No photo yet</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-snug line-clamp-2">
                  {form.title || <span className="text-neutral-300">Your listing title</span>}
                </p>
                <p className="text-base font-bold whitespace-nowrap">{previewPrice}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {previewCondition && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${previewConditionStyle}`}>
                    {previewCondition}
                  </span>
                )}
                {previewCategory && (
                  <span className="text-[11px] text-neutral-400">{previewCategory}</span>
                )}
              </div>

              {(form.city || form.country) && (
                <p className="text-xs text-neutral-400 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {[form.city, form.country].filter(Boolean).join(", ")}
                </p>
              )}

              {form.description && (
                <p className="text-xs text-neutral-500 line-clamp-3 pt-1">{form.description}</p>
              )}
            </div>
          </div>

          {/* Publish box */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Listing fee</p>
                <p className="text-xs text-neutral-400">Active for {LISTING_DURATION_DAYS} days</p>
              </div>
              <p className="text-xl font-bold">€{LISTING_FEE}</p>
            </div>

            <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-3.5 py-3 text-xs text-neutral-500 leading-relaxed">
              <p>Your listing is live for <strong className="text-neutral-700">{LISTING_DURATION_DAYS} days</strong>. After expiry, renew by paying again or it will be archived in your profile.</p>
            </div>

            <div className="h-px bg-neutral-100" />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              {submitting ? "Redirecting to payment..." : `Pay €${LISTING_FEE} & Publish`}
            </button>

            <p className="text-xs text-center text-neutral-400">Secure payment via Montonio</p>
          </div>

        </div>
      </div>
    </div>
  )
}
