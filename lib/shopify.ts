const domain = process.env.SHOPIFY_STORE_DOMAIN!
const token = process.env.SHOPIFY_STOREFRONT_TOKEN!

export async function shopifyFetch({
  query,
  variables,
}: {
  query: string
  variables?: any
}) {
  if (!domain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not set")
  }

  if (!token) {
    throw new Error("SHOPIFY_STOREFRONT_TOKEN is not set")
  }

  const endpoint = `https://${domain}/api/2024-10/graphql.json`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Shopify HTTP error:", res.status)
      return {}
    }

    const json = await res.json()

    if (json.errors) {
      console.error("SHOPIFY ERRORS:", json.errors)
      return {}
    }

    return json.data
  } catch (error) {
    console.error("Shopify fetch failed:", error)
    return {}
  }
}
