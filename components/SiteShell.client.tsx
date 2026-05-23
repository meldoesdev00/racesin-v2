"use client"

import { usePathname } from "next/navigation"
import { CartProvider } from "@/components/CartProvider.client"
import Navbar from "@/components/Navbar"
import CartDrawer from "@/components/CartDrawer.client"

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) return <>{children}</>

  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      {children}
    </CartProvider>
  )
}
