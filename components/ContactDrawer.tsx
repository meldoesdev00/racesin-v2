"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
  product?: string
  price?: string
  quantity?: number
  rentalMode?: boolean
}

export default function ContactDrawer({
  isOpen,
  onClose,
  product,
  price,
  quantity,
  rentalMode = false,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    track: "",
    date: "",
    message: "",
  })

  const [status, setStatus] = useState("")

  /* ================= Prefill message ================= */
  const prefillMessage = useMemo(() => {
    if (!product) return ""

    const qtyPrefix = quantity && quantity > 1 ? `${quantity}× ` : ""
    return rentalMode
      ? `I would like to rent the "${product}". Please provide availability and more information.`
      : `I'm interested in purchasing ${qtyPrefix}${product}. Please contact me with more details.`
  }, [product, quantity, rentalMode])

  /* ================= Lock body scroll ================= */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("Sending…")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          product,
          rentalMode,
          message: formData.message || prefillMessage,
        }),
      })

      setStatus(res.ok ? "Message sent successfully" : "Failed to send message")
    } catch {
      setStatus("Something went wrong")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ================= Overlay ================= */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* ================= MOBILE DRAWER ================= */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col sm:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            <DrawerContent
              onClose={onClose}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              status={status}
              rentalMode={rentalMode}
              product={product}
              price={price}
              prefillMessage={prefillMessage}
            />
          </motion.div>

          {/* ================= DESKTOP DRAWER ================= */}
          <motion.div
            className="hidden sm:flex fixed top-0 right-0 z-50 h-full w-[460px] bg-white rounded-l-3xl shadow-2xl flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <DrawerContent
              onClose={onClose}
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              status={status}
              rentalMode={rentalMode}
              product={product}
              price={price}
              prefillMessage={prefillMessage}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ================= Drawer Content ================= */

type DrawerContentProps = {
  onClose: () => void
  formData: {
    name: string
    email: string
    phone: string
    track: string
    date: string
    message: string
  }
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  status: string
  rentalMode: boolean
  product?: string
  price?: string
  prefillMessage: string
}

function DrawerContent({
  onClose,
  formData,
  handleChange,
  handleSubmit,
  status,
  rentalMode,
  product,
  price,
  prefillMessage,
}: DrawerContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-lg font-semibold">
            {rentalMode ? "Rental Request" : "Contact Us"}
          </h2>
          {product && (
            <p className="text-sm text-neutral-500">
              {product}
              {!rentalMode && price && (
                <span className="block text-xs text-neutral-400">
                  {price}
                </span>
              )}
            </p>
          )}
        </div>

        <button onClick={onClose}>
          <X className="w-5 h-5 text-neutral-500 hover:text-black transition" />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-5"
      >
        <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

        {rentalMode && (
          <>
            <Input label="Track (optional)" name="track" value={formData.track} onChange={handleChange} />
            <Input label="Date (optional)" name="date" type="date" value={formData.date} onChange={handleChange} />
          </>
        )}

        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            name="message"
            value={formData.message || prefillMessage}
            onChange={handleChange}
            className="mt-2 w-full h-32 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-black text-white py-3 text-sm hover:opacity-90 transition"
        >
          {rentalMode ? "Request Rental" : "Send Message"}
        </button>

        {status && (
          <p className="text-center text-sm text-neutral-600">
            {status}
          </p>
        )}
      </form>
    </>
  )
}

/* ================= Input Helper ================= */

function Input({
  label,
  ...props
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
      />
    </div>
  )
}
