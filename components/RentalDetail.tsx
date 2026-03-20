"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import Footer from "./Footer"
import ContactDrawer from "./ContactDrawer"

export default function RentalDetail({ product }: any) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [techSpecsHtml, setTechSpecsHtml] = useState<string | null>(null)

  const images = product.images.nodes

  // Extract "Technical Specs" section from Shopify HTML
  useEffect(() => {
    if (!product.descriptionHtml) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(product.descriptionHtml, "text/html")

    const heading = Array.from(doc.querySelectorAll("h2")).find((h) =>
      h.textContent?.toLowerCase().includes("technical specs")
    )

    if (!heading) {
      setTechSpecsHtml(null)
      return
    }

    const container = heading.closest("div")
    if (!container) {
      setTechSpecsHtml(null)
      return
    }

    setTechSpecsHtml(container.innerHTML)
  }, [product.descriptionHtml])

  return (
    <>
      <main className="w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:grid lg:grid-cols-[680px_1fr] gap-12 lg:gap-24">

            {/* GALLERY */}
            <section className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-w-0">

              {/* THUMBNAILS */}
              <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative min-w-[64px] h-[64px] rounded-xl overflow-hidden ${
                      i === activeIndex ? "ring-2 ring-black" : ""
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || ""}
                      fill
                      sizes="64px"
                      quality={90}
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* MAIN IMAGE */}
              <div className="order-1 lg:order-2 w-full">
                <div className="relative w-full aspect-square bg-neutral-100 rounded-3xl overflow-hidden max-w-full lg:max-w-[640px] mx-auto">
                  <Image
                    src={images[activeIndex]?.url}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    quality={90}
                    unoptimized
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </section>

            {/* INFO */}
            <section className="w-full max-w-[520px] min-w-0">
              <h1 className="text-4xl font-semibold">{product.title}</h1>

              {techSpecsHtml && (
                <div
                  className="mt-8 text-neutral-800 leading-relaxed
                    [&_h2]:text-xl
                    [&_h2]:font-semibold
                    [&_h2]:mb-6
                    [&_ul]:space-y-4
                    [&_li]:flex
                    [&_li]:justify-between
                    [&_li]:items-start
                    [&_li]:gap-6
                    [&_li]:border-b
                    [&_li]:border-neutral-300
                    [&_li]:pb-3
                    [&_span:first-child]:text-neutral-600
                    [&_span:first-child]:font-medium
                    [&_span:last-child]:text-neutral-900
                    [&_span:last-child]:font-medium
                    [&_span:last-child]:text-right"
                  dangerouslySetInnerHTML={{ __html: techSpecsHtml }}
                />
              )}

              <button
                onClick={() => setOpen(true)}
                className="mt-10 px-8 py-4 rounded-full bg-black text-white"
              >
                Contact Us
              </button>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <ContactDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        product={product.title}
        rentalMode
      />
    </>
  )
}
