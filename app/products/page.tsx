import ProductsGrid, { Product } from "@/components/ProductsGrid"
import { getProducts } from "@/lib/getProducts"
import { getCollections } from "@/lib/getCollections"
import Footer from "@/components/Footer"

type Collection = {
  handle: string
  title: string
}

type CollectionWithProducts = {
  collection: Collection
  products: Product[]
}

export default async function ProductsPage() {
  const collections: Collection[] = await getCollections()

  const collectionsWithProducts = (
    await Promise.all(
      collections.map(
        async (collection: Collection): Promise<CollectionWithProducts | null> => {
          const products = await getProducts(collection.handle)
          if (!products.length) return null
          return { collection, products }
        }
      )
    )
  ).filter(Boolean) as CollectionWithProducts[]

  return (
    <>
      <main className="bg-white">
        {collectionsWithProducts.map(({ collection, products }) => (
          <section key={collection.handle} className="py-16">
            <div className="mx-auto max-w-[1600px] px-4">
              <h1 className="text-4xl sm:text-5xl font-semibold text-center">
                {collection.title}
              </h1>

              <div className="mt-16">
                <ProductsGrid products={products} />
              </div>
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </>
  )
}
