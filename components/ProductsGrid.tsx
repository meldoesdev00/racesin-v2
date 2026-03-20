import Image from "next/image"
import Link from "next/link"
import { formatEuro } from "@/lib/formatPrice"

export type Product = {
  handle: string
  name: string
  price: string
  images: string[] | null
  tags?: string[]
}

function getBadge(tags?: string[]) {
  const t = (tags ?? []).map((x) => String(x).toLowerCase())
  if (t.includes("bestseller")) return "BESTSELLER"
  if (
    t.includes("limited") ||
    t.includes("limited edition") ||
    t.includes("limited_edition")
  )
    return "LIMITED EDITION"
  if (t.includes("new")) return "NEW"
  return null
}

export default function ProductsGrid({
  products,
}: {
  products: Product[]
}) {
  if (!products.length) return null

  return (
    <div
      suppressHydrationWarning
      className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 sm:gap-x-8 gap-y-10 sm:gap-y-14"
    >
      {products.map((product) => {
        const image = product.images?.[0] ?? null

        return (
          <Link
            key={product.handle}
            href={`/products/${product.handle}`}
            suppressHydrationWarning
            className="group block keychainify-checked"
          >
            <div className="relative aspect-square rounded-[28px] bg-[#f4f4f3] overflow-hidden">
              {getBadge(product.tags) && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-[#e9a39a] px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                  {getBadge(product.tags)}
                </span>
              )}

              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
                  No image
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-medium leading-snug break-words">
                {product.name}
              </h3>
              <p className="mt-4 font-medium">{formatEuro(product.price)}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
