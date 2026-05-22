import Footer from "@/components/Footer"

export const metadata = {
  title: "Sim-Racing Marketplace — Buy & Sell Gear",
  description:
    "The Baltics' first dedicated sim-racing marketplace. Buy and sell second-hand simulator frames, cockpits, wheels, pedals, and all sim racing equipment.",
  keywords: [
    "sim racing marketplace",
    "buy sim racing",
    "sell sim racing",
    "second hand simulator",
    "sim racing gear for sale",
    "sim racing equipment Baltics",
  ],
  openGraph: {
    url: "https://www.racesin.com/market",
    title: "Sim-Racing Marketplace — Buy & Sell Gear | Racesin",
    description:
      "Buy and sell second-hand simulator frames, cockpits, wheels, pedals and sim racing accessories on Racesin Market.",
  },
  alternates: { canonical: "https://www.racesin.com/market" },
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        {children}
      </div>
      <Footer />
    </>
  )
}
