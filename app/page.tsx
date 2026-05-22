import type { Metadata } from "next"
import HeroSlider from "@/components/HeroSlider.client"

export const metadata: Metadata = {
  title: "Racesin — Sim Racing Products & Marketplace",
  description:
    "Racesin: shop high-quality simulator frames, cockpits and sim racing accessories — or buy and sell second-hand sim racing gear on the Baltics' first dedicated marketplace.",
  alternates: { canonical: "https://www.racesin.com" },
  openGraph: { url: "https://www.racesin.com" },
}


import CollectionsGrid from "@/components/CollectionsGrid"
import BrandStorySection from "@/components/BrandStorySection"
import SimurentCampaign from "@/components/SimurentCampaign"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="bg-white">
      <HeroSlider />
      <CollectionsGrid />
      <BrandStorySection />
      <SimurentCampaign />
      <Footer />
    </main>
  )
}
