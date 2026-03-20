"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import ContactDrawer from "./ContactDrawer"
import Footer from "./Footer"

type Variant = {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number | null
  price: {
    amount: string
  }
  selectedOptions: {
    name: string
    value: string
  }[]
}

type ProductDetailProps = {
  product: {
    title: string
    description: string
    descriptionHtml?: string
    tags: string[]
    metafields?: { key: string; value: string }[]
    images: {
      url: string
      altText?: string | null
    }[]
    variants: Variant[]
  }
}

function formatPrice(amount: string | number) {
  const value = Number(amount)
  if (Number.isNaN(value)) return "0"
  return Math.round(value).toString()
}

function processDescription(html: string) {
  return html
    .replace(/<p[^>]*>((?:•|&bull;)\s*)(.*?)<br[^>]*>((?:•|&bull;)\s*)(.*?)<br[^>]*>((?:•|&bull;)\s*)(.*?)<\/p>/g, '<ul><li>$2</li><li>$4</li><li>$6</li></ul>')
    .replace(/<p[^>]*>((?:•|&bull;)\s*)(.*?)<br[^>]*>((?:•|&bull;)\s*)(.*?)<\/p>/g, '<ul><li>$2</li><li>$4</li></ul>')
    .replace(/<p[^>]*>((?:•|&bull;)\s*)(.*?)<\/p>/g, '<ul><li>$2</li></ul>')
}

function parseDescription(sourceHtml: string): { techSpecsHtml: string | null; cleanDescriptionHtml: string } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(sourceHtml, "text/html")

  doc.querySelectorAll("meta").forEach((meta) => meta.remove())

  const heading = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).find((h) =>
    h.textContent?.toLowerCase().includes("technical")
  )

  if (heading) {
    heading.className = "text-2xl font-semibold mb-5"
  }

  let specsContainer: HTMLElement | null = null
  if (heading) {
    const next = heading.nextElementSibling
    if (next && /UL|OL/.test(next.tagName)) {
      specsContainer = next as HTMLElement
    } else {
      specsContainer = heading.parentElement?.querySelector("ul") || null
    }
  }

  if (!specsContainer) {
    specsContainer = doc.querySelector("ul")
  }

  if (!specsContainer) {
    const bulletParas = Array.from(doc.querySelectorAll("p")).filter((p) =>
      /•|&bull;/.test(p.textContent ?? "")
    )
    if (bulletParas.length) {
      const ul = doc.createElement("ul")
      bulletParas.forEach((p) => {
        const text = (p.textContent ?? "").replace(/•|&bull;/g, "").trim()
        const li = doc.createElement("li")
        li.textContent = text
        ul.appendChild(li)
        p.remove()
      })
      specsContainer = ul
    }
  }

  if (specsContainer) {
    const headingEl = specsContainer.querySelector("h1,h2,h3,h4,h5,h6")
    if (headingEl) {
      headingEl.className = "text-2xl font-semibold mb-5"
    }

    const ul =
      specsContainer.tagName === "UL"
        ? specsContainer
        : specsContainer.querySelector("ul")

    if (ul) {
      ul.className = "space-y-3 text-neutral-800"
      ul.querySelectorAll("li").forEach((li) => {
        li.className = "flex justify-between border-b border-neutral-300 pb-2"

        const spans = li.querySelectorAll("span")
        if (spans.length >= 2) {
          spans[0].className = "text-gray-400 font-medium"
          spans[1].className = "text-neutral-900 font-medium text-right"
          return
        }

        const text = li.textContent?.trim() ?? ""
        const [label, ...rest] = text.split(/\s+/)
        const value = rest.join(" ").trim()
        if (label) {
          li.innerHTML = `<span class="text-neutral-600 font-medium">${label}</span><span class="text-neutral-900 font-medium text-right">${value}</span>`
        }
      })
    }

    const specsHtml =
      specsContainer.tagName === "UL"
        ? specsContainer.outerHTML
        : specsContainer.innerHTML
    specsContainer.remove()

    return {
      techSpecsHtml: specsHtml,
      cleanDescriptionHtml: doc.body.innerHTML,
    }
  }

  return {
    techSpecsHtml: null,
    cleanDescriptionHtml: doc.body.innerHTML,
  }
}

/** Returns grouped options like: [{ name: "Length", values: ["500mm", "1000mm", ...] }] */
function getOptionGroups(variants: Variant[]) {
  const map = new Map<string, string[]>()
  for (const variant of variants) {
    for (const opt of variant.selectedOptions) {
      if (!map.has(opt.name)) map.set(opt.name, [])
      const arr = map.get(opt.name)!
      if (!arr.includes(opt.value)) arr.push(opt.value)
    }
  }
  return Array.from(map.entries()).map(([name, values]) => ({ name, values }))
}

/** Find a variant matching the currently selected option values */
function findMatchingVariant(variants: Variant[], selectedOptions: Record<string, string>): Variant | null {
  return variants.find((v) =>
    v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  ) || null
}

/** Returns true if this product has real (meaningful) variants */
function hasRealVariants(variants: Variant[]) {
  if (variants.length <= 1) return false
  // Shopify puts "Default Title" when there are no real options
  if (variants.length === 1 && variants[0].title === "Default Title") return false
  return true
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const qty = 1
  const [activeIndex, setActiveIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [techSpecsHtml, setTechSpecsHtml] = useState<string | null>(null)
  const [cleanDescriptionHtml, setCleanDescriptionHtml] = useState("")

  const variants = product.variants || []
  const optionGroups = getOptionGroups(variants)
  const showVariants = hasRealVariants(variants)

  // Initialise selected options to the first available variant's options
  const firstAvailable = variants.find((v) => v.availableForSale) || variants[0]
  const initialOptions: Record<string, string> = {}
  if (firstAvailable) {
    for (const opt of firstAvailable.selectedOptions) {
      initialOptions[opt.name] = opt.value
    }
  }

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions)

  const selectedVariant: Variant | null = showVariants
    ? findMatchingVariant(variants, selectedOptions)
    : (variants.find((v) => v.availableForSale) || variants[0] || null)

  const price = selectedVariant
    ? formatPrice(selectedVariant.price.amount)
    : "0"

  const remainingStock = selectedVariant?.availableForSale
    ? (selectedVariant.quantityAvailable ?? 999)
    : 0

  const inStock = remainingStock > 0

  useEffect(() => {
    const sourceHtml = product.descriptionHtml ?? product.description
    if (!sourceHtml) {
      setTechSpecsHtml(null)
      setCleanDescriptionHtml("")
      return
    }
    const result = parseDescription(sourceHtml)
    setTechSpecsHtml(result.techSpecsHtml)
    setCleanDescriptionHtml(result.cleanDescriptionHtml)
  }, [product.description, product.descriptionHtml])

  const specifications =
    techSpecsHtml ||
    product.metafields?.find((m) => m.key === "technical_specs")?.value ||
    ""

  const images = product.images || []

  return (
    <>
      <main className="w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:grid lg:grid-cols-[680px_1fr] gap-12 lg:gap-24">

            {/* GALLERY */}
            <section className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-w-0">

              {/* THUMBNAILS */}
              <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative min-w-[64px] h-[64px] rounded-xl overflow-hidden ${
                      i === activeIndex ? "ring-2 ring-black" : ""
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
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
                  {images[activeIndex] && (
                    <Image
                      src={images[activeIndex].url}
                      alt={product.title}
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      quality={90}
                      unoptimized
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
              </div>
            </section>

            {/* PRODUCT INFO */}
            <section className="w-full max-w-[520px]">
              <h1 className="text-4xl font-semibold leading-tight">
                {product.title}
              </h1>

              <p className="mt-6 text-3xl font-medium">
                €{price}
              </p>

              {/* STOCK BADGE */}
              {selectedVariant && (
                <div className="mt-5">
                  {remainingStock > 0 ? (
                    <div className="inline-flex items-center gap-3 rounded-full bg-green-100 px-5 py-3 text-green-700">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-600">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      </span>
                      <span className="text-sm font-medium">
                        {remainingStock <= 5
                          ? `Only ${remainingStock} left in stock`
                          : "In stock, ready to ship"}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 rounded-full bg-red-100 px-5 py-3 text-red-700">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      </span>
                      <span className="text-sm font-medium">
                        Not available at the moment
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* VARIANT SELECTOR */}
              {showVariants && (
                <div className="mt-7 space-y-5">
                  {optionGroups.map((group) => (
                    <div key={group.name}>
                      <p className="text-lg font-medium text-neutral-800 mb-5">
                        {group.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => {
                          // Check if this option value leads to an available variant
                          const matchingVariant = findMatchingVariant(variants, {
                            ...selectedOptions,
                            [group.name]: value,
                          })
                          const isSelected = selectedOptions[group.name] === value
                          const isAvailable = matchingVariant?.availableForSale ?? false

                          return (
                            <button
                              key={value}
                              disabled={!isAvailable}
                              onClick={() =>
                                setSelectedOptions((prev) => ({ ...prev, [group.name]: value }))
                              }
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition
                                ${isSelected
                                  ? "bg-black text-white border-black"
                                  : isAvailable
                                    ? "bg-white text-neutral-800 border-neutral-300 hover:border-black"
                                    : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through"
                                }`}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="product-description mt-7 text-base text-neutral-700 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processDescription(cleanDescriptionHtml) }}
              />

              {specifications && (
                <div
                  className="mt-0 text-neutral-800 leading-relaxed
                    [&_h2]:text-2xl
                    [&_h2]:font-semibold
                    [&_h2]:mb-5
                    [&_h2]:text-neutral-900
                    [&_ul]:space-y-3
                    [&_ul]:text-neutral-900
                    [&_li]:flex
                    [&_li]:justify-between
                    [&_li]:items-start
                    [&_li]:gap-6
                    [&_li]:border-b
                    [&_li]:border-gray-200
                    [&_li]:pb-2
                    [&_span:first-child]:--color-neutral-700
                    [&_span:first-child]:font-medium
                    [&_span:last-child]:text-right
                    [&_span:last-child]:font-medium"
                >
                  <div dangerouslySetInnerHTML={{ __html: specifications }} />
                </div>
              )}

              <div className="mt-12">
                <button
                  disabled={!inStock}
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-black text-white text-sm hover:opacity-90 transition disabled:opacity-40"
                >
                  Contact Us
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ContactDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={product.title}
        price={`€${price}`}
        quantity={qty}
      />

      <Footer />
    </>
  )
}