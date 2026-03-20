import PreBuiltDetail from "@/components/PreBuiltDetail"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN! // <-- IMPORTANT (match your shopify.ts)

async function getPreBuiltProduct() {
  const query = `
    query GetPreBuiltProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
        images(first: 8) {
          nodes {
            url
            altText
          }
        }
      }
    }
  `

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: {
          handle: "racesin-complete-sim-racing-package", // ✅ CORRECT HANDLE
        },
      }),
      next: { revalidate: 60 },
    }
  )

  const json = await res.json()

  if (json.errors) {
    console.error("Shopify GraphQL errors:", json.errors)
    return null
  }

  return json.data?.product ?? null
}

export default async function PreBuiltSetPage() {
  const product = await getPreBuiltProduct()

  if (!product) {
    return (
      <div className="p-10 text-red-500 text-center">
        Pre-Built product not found.
      </div>
    )
  }

  return <PreBuiltDetail product={product} />
}
