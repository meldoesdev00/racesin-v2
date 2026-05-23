import type { Metadata } from "next"
import "./globals.css"
import SiteShell from "@/components/SiteShell.client"
import CookieConsent from "@/components/CookieConsent.client"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const BASE_URL = "https://www.racesin.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Racesin — Sim Racing Products & Marketplace",
    template: "%s | Racesin",
  },
  description:
    "Racesin is the Baltics' home for sim racing. Shop high-quality simulator frames, cockpits and accessories — or buy and sell second-hand sim racing gear on our marketplace.",
  keywords: [
    "sim racing",
    "sim racing marketplace",
    "buy sim racing gear",
    "sell sim racing equipment",
    "simulator frames",
    "sim racing cockpit",
    "racing simulator",
    "sim racing Estonia",
    "sim racing Baltics",
    "second hand sim racing",
    "motorsport marketplace",
    "direct drive wheel",
    "sim racing accessories",
    "racesin",
  ],
  authors: [{ name: "Racesin", url: BASE_URL }],
  creator: "Racesin Management OÜ",
  publisher: "Racesin Management OÜ",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: BASE_URL,
    siteName: "Racesin",
    title: "Racesin — Sim Racing Products & Marketplace",
    description:
      "Shop sim racing simulator frames, cockpits and accessories. Buy and sell second-hand sim racing gear on the Baltics' first dedicated marketplace.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Racesin" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Racesin — Sim Racing Products & Marketplace",
    description:
      "Shop sim racing simulator frames, cockpits and accessories. Buy and sell second-hand sim racing gear on the Baltics' first dedicated marketplace.",
    images: ["/og-default.jpg"],
  },
  alternates: { canonical: BASE_URL },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.racesin.com/#organization",
      name: "Racesin",
      url: "https://www.racesin.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.racesin.com/racesin-logo-black-desktop.png",
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@racesin.com",
        contactType: "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.racesin.com/#website",
      url: "https://www.racesin.com",
      name: "Racesin",
      publisher: { "@id": "https://www.racesin.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.racesin.com/market?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
