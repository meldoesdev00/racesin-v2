import { shopifyFetch } from "./shopify"
import { formatPrice } from "./formatPrice"

const PRODUCTS_BY_COLLECTION = `
  query ProductsByCollection($handle: String!) {
    collection(handle: $handle) {
      products(first: 50) {
        nodes {
          handle
          title
          productType
          images(first: 1) {
            nodes {
              url
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`

export async function getProducts(
  collectionHandle: string = "pre-built-set"
) {
  try {
    const data = await shopifyFetch({
      query: PRODUCTS_BY_COLLECTION,
      variables: { handle: collectionHandle },
    })

    const nodes = data?.collection?.products?.nodes ?? []

    return nodes
      .filter((p: any) => p.productType === "Product")
      .map((p: any) => ({
        handle: p.handle,
        name: p.title,
        price: formatPrice(p.priceRange.minVariantPrice.amount),
        images: p.images?.nodes?.length
          ? p.images.nodes.map((i: any) => i.url)
          : [],
      }))
  } catch (error) {
    console.error("getProducts error:", error)
    return []
  }
}
