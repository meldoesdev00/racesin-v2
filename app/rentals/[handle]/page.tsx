import { notFound } from "next/navigation"
import RentalDetail from "@/components/RentalDetail"
import { shopifyFetch } from "@/lib/shopify"

const RENTAL_QUERY = `
  query RentalByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      title
      descriptionHtml
      productType
      images(first: 8) {
        nodes {
          url
          altText
        }
      }
    }
  }
`

export default async function RentalPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params // ✅ THIS IS THE KEY FIX

  if (!handle) notFound()

  const data = await shopifyFetch({
    query: RENTAL_QUERY,
    variables: { handle },
  })

  const product = data?.productByHandle

  // 🚨 HARD SAFETY CHECK
  if (!product || product.productType !== "Rental") {
    notFound()
  }

  return <RentalDetail product={product} />
}
