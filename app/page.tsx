import HeroSlider from "@/components/HeroSlider.client"
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
