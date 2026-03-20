import { shopifyFetch } from "./shopify"

const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 10) {
      nodes {
        handle
        title
        description
      }
    }
  }
`

export async function getCollections() {
  try {
    const data = await shopifyFetch({ query: COLLECTIONS_QUERY })

    return data?.collections?.nodes?.map((collection: any) => ({
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
    })) ?? []
  } catch (error) {
    console.error("getCollections error:", error)
    return []
  }
}
