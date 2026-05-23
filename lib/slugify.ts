const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "")
}

export function listingUrl(title: string, id: string): string {
  const slug = slugify(title)
  return `/market/listing/${slug ? `${slug}-` : ""}${id}`
}

export function extractListingId(param: string): string {
  const match = param.match(UUID_RE)
  return match ? match[0] : param
}
