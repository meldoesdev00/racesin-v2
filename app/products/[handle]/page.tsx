import { notFound } from "next/navigation"
import { shopifyFetch } from "@/lib/shopify"
import ProductDetail from "../../../components/ProductDetail"

const PRODUCT_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      title
      description
      descriptionHtml
      tags

      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
          }
          selectedOptions {
            name
            value
          }
        }
      }

      metafields(
        identifiers: [
          { namespace: "custom", key: "technical_specs" }
        ]
      ) {
        key
        value
      }

      images(first: 8) {
        nodes {
          url
          altText
        }
      }
    }
  }
`

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  // ✅ THIS IS THE FIX
  const { handle } = await params

  const data = await shopifyFetch({
    query: PRODUCT_QUERY,
    variables: { handle },
  })

  if (!data?.productByHandle) return notFound()

  return (
    <ProductDetail
      product={{
        title: data.productByHandle.title,
        description: data.productByHandle.description,
        descriptionHtml: data.productByHandle.descriptionHtml,
        tags: data.productByHandle.tags ?? [],
        metafields: data.productByHandle.metafields ?? [],
        images: data.productByHandle.images.nodes ?? [],
        variants: data.productByHandle.variants.nodes ?? [],
      }}
    />
  )
}