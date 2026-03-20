"use client"

import { useCart } from "./CartProvider.client"
import ContactDrawer from "./ContactDrawer"

export default function CartDrawer() {
  const { open, setOpen } = useCart()

  return (
    <ContactDrawer
      isOpen={open}
      onClose={() => setOpen(false)}
    />
  )
}
