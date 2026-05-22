import { notFound } from "next/navigation"
import { shopifyFetch } from "@/lib/shopify"
import ProductDetail from "../../../components/ProductDetail"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const data = await shopifyFetch({ query: PRODUCT_QUERY, variables: { handle } })
  const p = data?.productByHandle
  if (!p) return {}
  const image = p.images?.nodes?.[0]?.url
  const price = p.variants?.nodes?.[0]?.price?.amount
  return {
    title: p.title,
    description: p.description?.slice(0, 160) || `Buy ${p.title} at Racesin.`,
    openGraph: {
      title: `${p.title} | Racesin`,
      description: p.description?.slice(0, 160) || `Buy ${p.title} at Racesin.`,
      url: `https://www.racesin.com/products/${handle}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: p.title }] : [],
    },
    alternates: { canonical: `https://www.racesin.com/products/${handle}` },
    ...(price && {
      other: {
        "product:price:amount": price,
        "product:price:currency": "EUR",
      },
    }),
  }
}

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