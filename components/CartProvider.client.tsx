"use client"

import React, { createContext, useContext, useState } from "react"

type CartItem = {
  variantId: string
  title: string
  price: string
  image?: string
  quantity: number
  availableQuantity: number // 🔥 important
}

type CartContextType = {
  items: CartItem[]
  open: boolean
  setOpen: (v: boolean) => void
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  function addItem(newItem: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.variantId === newItem.variantId
      )

      if (existing) {
        const updatedQuantity = Math.min(
          existing.quantity + newItem.quantity,
          existing.availableQuantity
        )

        return prev.map((i) =>
          i.variantId === newItem.variantId
            ? { ...i, quantity: updatedQuantity }
            : i
        )
      }

      return [...prev, newItem]
    })

    setOpen(true)
  }

  function removeItem(variantId: string) {
    setItems((prev) =>
      prev.filter((item) => item.variantId !== variantId)
    )
  }

  function updateQuantity(variantId: string, newQuantity: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId !== variantId) return item

        if (newQuantity < 1) return item

        if (newQuantity > item.availableQuantity) {
          return {
            ...item,
            quantity: item.availableQuantity,
          }
        }

        return {
          ...item,
          quantity: newQuantity,
        }
      })
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addItem,
        removeItem,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("CartProvider missing")
  return ctx
}