"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { MARKET_CATEGORIES, CONDITIONS, BRANDS } from "@/lib/supabase/types"

type ExistingImage = { id: string; url: string; position: number }
type NewImageFile = { file: File; preview: string }

export type AdminListing = {
  id: string
  title: string
  description: string | null
  category: string
  brand: string | null
  seller_name: string | null
  price: number
  condition: string
  location: string | null
  phone: string | null
  email: string | null
  status: string
  views: number
  created_at: string
  listing_images?: ExistingImage[]
}

type Props = {
  listing?: AdminListing | null
  onClose: () => void
  onSaved: (listing: AdminListing) => void
}

const COUNTRIES = [
  "Estonia","Latvia","Lithuania","Finland","Sweden","Norway","Denmark","Germany",
  "Netherlands","Belgium","France","Spain","Italy","Poland","Czech Republic",
  "Austria","Switzerland","United Kingdom","Ireland","Portugal","Hungary",
  "Romania","Bulgaria","Croatia","Slovakia","Slovenia","Greece","Other",
]

export default function AdminListingModal({ listing, onClose, onSaved }: Props) {
  const isEdit = !!listing
  const locationParts = listing?.location?.split(", ") ?? []
  const initialCity = locationParts.length > 1 ? locationParts.slice(0, -1).join(", ") : locationParts[0] ?? ""
  const initialCountry = locationParts.length > 1 ? locationParts[locationParts.length - 1] : "Estonia"

  const [form, setForm] = useState({
    seller_name: listing?.seller_name ?? "",
    category: listing?.category ?? "",
    brand: listing?.brand ?? "",
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    price: listing ? String(Math.round(listing.price)) : "",
    condition: listing?.condition ?? "good",
    city: initialCity,
    country: initialCountry,
    phone: listing?.phone ?? "",
    email: listing?.email ?? "",
    status: listing?.status ?? "active",
  })

  const [keptImages, setKeptImages] = useState<ExistingImage[]>(
    [...(listing?.listing_images ?? [])].sort((a, b) => a.position - b.position)
  )
  const [newImages, setNewImages] = useState<NewImageFile[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleFiles(files: FileList | null) {
    if (!files) return
    const total = keptImages.length + newImages.length
    const added = Array.from(files).slice(0, 8 - total).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setNewImages(prev => [...prev, ...added])
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return }
    if (!form.category) { setError("Category is required."); return }
    if (!form.price) { setError("Price is required."); return }

    setSaving(true)
    setError(null)

    try {
      const removedIds = isEdit
        ? (listing?.listing_images ?? [])
            .filter(img => !keptImages.find(k => k.id === img.id))
            .map(img => img.id)
        : []

      const payload = {
        ...(isEdit ? { id: listing!.id } : {}),
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        brand: form.brand || null,
        seller_name: form.seller_name.trim() || null,
        price: Number(form.price),
        condition: form.condition,
        city: form.city,
        country: form.country,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        status: form.status,
        ...(removedIds.length > 0 ? { removeImageIds: removedIds } : {}),
      }

      const res = await fetch("/api/admin/listings", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save listing")

      const savedListing: AdminListing = data.listing

      // Upload new images
      const startPos = keptImages.length
      for (let i = 0; i < newImages.length; i++) {
        const fd = new FormData()
        fd.append("file", newImages[i].file)
        fd.append("listingId", savedListing.id)
        fd.append("position", String(startPos + i))
        await fetch("/api/admin/upload", { method: "POST", body: fd })
      }

      onSaved(savedListing)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const totalImages = keptImages.length + newImages.length

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <h2 className="text-base font-semibold text-neutral-900">
            {isEdit ? "Edit Listing" : "New Listing"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition text-neutral-500"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Seller name (admin only) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide block">
              Seller Display Name (admin only)
            </label>
            <input
              value={form.seller_name}
              onChange={e => set("seller_name", e.target.value)}
              placeholder="e.g. Marko K."
              className="w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm focus:outline-none focus:border-amber-500 bg-white"
            />
            <p className="text-xs text-amber-600">Leave empty to show default profile name.</p>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="active">Active</option>
                <option value="pending_payment">Pending payment</option>
                <option value="sold">Sold</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-neutral-800 block mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {MARKET_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("category", cat.id)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium text-left transition ${
                    form.category === cat.id
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-semibold text-neutral-800 block mb-2">Brand</label>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map(brand => (
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
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="e.g. Fanatec CSL Elite Steering Wheel"
                maxLength={120}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={4}
                placeholder="Describe the item..."
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Price + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Price (€) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Condition *</label>
              <select
                value={form.condition}
                onChange={e => set("condition", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">City</label>
              <input
                value={form.city}
                onChange={e => set("city", e.target.value)}
                placeholder="Tallinn"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Country</label>
              <select
                value={form.country}
                onChange={e => set("country", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black bg-white"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="+372 5xxx xxxx"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-1.5">Contact email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="seller@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-semibold text-neutral-800 block mb-2">
              Photos <span className="font-normal text-neutral-400">({totalImages}/8)</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {keptImages.map((img, i) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img.url} alt="" fill className="object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">Cover</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setKeptImages(prev => prev.filter(x => x.id !== img.id))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img.preview} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {totalImages < 8 && (
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 shrink-0 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium hover:border-black transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition disabled:opacity-40"
            >
              {saving
                ? (newImages.length > 0 ? "Uploading..." : "Saving...")
                : isEdit ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
