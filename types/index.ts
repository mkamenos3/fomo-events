export interface Event {
  id: string
  name: string
  slug: string
  category: string
  city: string
  city_label: string
  venue: string
  date_label: string
  date_sort: string
  price_from: number
  capacity: number
  attending: number
  grad_from: string
  grad_to: string
  emoji: string
  badge_label: string | null
  description: string | null
  tags: string[] | null
  lineup: LineupArtist[] | null
  is_featured: boolean | null
  created_at: string | null
}

export interface LineupArtist {
  name: string
  role?: string
  time?: string
}

export interface TicketTier {
  id: string
  event_id: string
  name: string
  price: number
  description: string | null
  available: number
  is_low_stock: boolean | null
  sort_order: number | null
}

export interface Order {
  event_id: string
  tier_id: string
  full_name: string
  email: string
  phone?: string
  quantity: number
  total: number
}
