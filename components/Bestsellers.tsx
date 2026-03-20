"use client"

import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

function formatPrice(amount: string | number) {
  const value = Number(amount)
  if (Number.isNaN(value)) return "0"
  return Math.round(value).toString()
}

export default function Bestsellers() {
  const { data, error } = useSWR("/api/products", fetcher)

  if (error) return null
  if (!data || !Array.isArray(data)) return null

  return (
    <section className="bg-white py-8 sm:py-16 md:py-3">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 sm:mb-10">
          Bestsellers
        </h2>

        <div className="flex gap-5 sm:gap-8 overflow-x-auto snap-x snap-mandatory pb-2">
          {data.map((product: any) => {
            const image =
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "/allproducts.png"

            const price =
              product.price ||
              product.priceRange?.minVariantPrice?.amount ||
              product.variants?.[0]?.price?.amount ||
              "0"

            return (
              <Link
                key={product.handle}
                href={`/products/${product.handle}`}
                className="group w-[220px] sm:w-[260px] shrink-0 snap-start"
              >
                <div className="relative h-[260px] bg-neutral-100 rounded-2xl overflow-hidden">
                  <Image
                    src={image}
                    alt={product.title || "Product image"}
                    fill
                    sizes="260px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-medium">
                    {product.title}
                  </h3>
                  <p className="mt-2 font-medium">
                    €{formatPrice(price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
