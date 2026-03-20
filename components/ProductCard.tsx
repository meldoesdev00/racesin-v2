import Image from "next/image"
import Link from "next/link"

type Product = {
  id: string
  image: string
  name: string
  subtitle?: string
  price: string
  badge?: string | null
}

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-neutral-100">
        {product.badge && (
          <div className="absolute right-4 top-4 z-10 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
            {product.badge}
          </div>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-5">
        <h3 className="text-base font-medium">{product.name}</h3>

        {product.subtitle && (
          <p className="mt-1 text-sm text-neutral-500">
            {product.subtitle}
          </p>
        )}

        <p className="mt-3 text-sm font-medium">
          {product.price}
        </p>
      </div>
    </Link>
  )
}
