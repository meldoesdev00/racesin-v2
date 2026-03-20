import { shopifyFetch } from "./shopify"

export type RentalCard = {
  handle: string
  title: string
  description: string
  images: {
    nodes: { url: string }[]
  }
  priceRange: {
    minVariantPrice: {
      amount: string
    }
  }
}

const RENTALS_QUERY = `
  query Rentals {
    products(first: 20, query: "product_type:Rental") {
      nodes {
        handle
        title
        description
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
`

export async function getRentals(): Promise<RentalCard[]> {
  try {
    const data = await shopifyFetch({ query: RENTALS_QUERY })
    return data?.products?.nodes ?? []
  } catch (error) {
    console.error("getRentals error:", error)
    return []
  }
}
