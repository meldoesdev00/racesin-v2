export type Listing = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  brand: string | null
  seller_name: string | null
  price: number
  original_price: number | null
  condition: "new" | "like-new" | "good" | "fair"
  location: string | null
  phone: string | null
  email: string | null
  status: "pending_payment" | "active" | "expired" | "sold"
  views: number
  expires_at: string | null
  created_at: string
  updated_at: string
  listing_images?: ListingImage[]
  profiles?: Profile | null
}

export type ListingImage = {
  id: string
  listing_id: string
  url: string
  position: number
  created_at: string
}

export type Profile = {
  id: string
  name: string | null
  phone: string | null
  avatar_url: string | null
  description: string | null
  location: string | null
  created_at: string
}

export type Conversation = {
  id: string
  listing_id: string | null
  listing_title: string | null
  seller_id: string
  buyer_id: string
  last_message_at: string
  created_at: string
  listings?: Pick<Listing, "id" | "title"> | null
  seller?: Profile | null
  buyer?: Profile | null
  messages?: Message[]
  unread_count?: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  profiles?: Profile | null
}

export const MARKET_CATEGORIES = [
  { id: "frames", label: "Frames" },
  { id: "seats", label: "Seats" },
  { id: "wheel", label: "Wheel" },
  { id: "pedals", label: "Pedals" },
  { id: "wheelbase", label: "Wheelbase" },
  { id: "shifter", label: "Shifter" },
  { id: "handbrake", label: "Handbrake" },
  { id: "computers", label: "Computers" },
  { id: "monitors", label: "Monitors" },
  { id: "accessories", label: "Accessories" },
] as const

export const BRANDS = [
  "Fanatec", "Moza", "Simagic", "Thrustmaster", "Logitech",
  "Racesin", "Simlab", "Simucube", "Asetek", "Next Level Racing",
  "Heusinkveld", "Other",
] as const

export const CONDITIONS = [
  { id: "new", label: "New", color: "bg-green-100 text-green-700" },
  { id: "like-new", label: "Like New", color: "bg-blue-100 text-blue-700" },
  { id: "good", label: "Good", color: "bg-yellow-100 text-yellow-700" },
  { id: "fair", label: "Fair", color: "bg-neutral-100 text-neutral-600" },
] as const

export const LISTING_FEE = 1.99
export const LISTING_DURATION_DAYS = 30

export function conditionStyle(condition: string) {
  return CONDITIONS.find((c) => c.id === condition)?.color ?? "bg-neutral-100 text-neutral-600"
}

export function conditionLabel(condition: string) {
  return CONDITIONS.find((c) => c.id === condition)?.label ?? condition
}

export function categoryLabel(categoryId: string) {
  return MARKET_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
