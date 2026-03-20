import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { CartProvider } from "@/components/CartProvider.client"
import CartDrawer from "@/components/CartDrawer.client"
import CookieConsent from "@/components/CookieConsent.client"

export const metadata: Metadata = {
  title: "Racesin Motorsport",
  description: "Performance and motorsport parts",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/774b58a5ef59dc9219eb572277294f65?family=Avantt+TRIAL+Medium"
          rel="stylesheet"
        />
      </head>

      <body className="antialiased">
        <CartProvider>
          <Navbar />
          {children}
          <CartDrawer />
        </CartProvider>

        {/* Cookie Consent Banner (loads GA only after accept) */}
        <CookieConsent />
      </body>
    </html>
  )
}
