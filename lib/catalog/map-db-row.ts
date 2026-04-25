import type { Product } from "@/lib/data/products"

/** Ligne renvoyée par Supabase (snake_case côté DB si besoin — ici colonnes alignées avec insert) */
export type ProductRow = {
  id: string
  name: string
  price: number | string
  original_price?: number | string | null
  image: string
  images: string[]
  home_section?: string | null
  description: string
  category: string
  sizes: number[]
  colors: string[]
  in_stock: boolean
  badge?: string | null
  rating: number | string
  review_count: number | string
}

function normalizeHomeSection(v: unknown): Product["homeSection"] | undefined {
  if (v === "best_sellers") return "best_sellers"
  if (v === "premium_luxe") return "premium_luxe"
  if (v === "nouveautes") return "nouveautes"
  if (v === "collection_artisanale") return "collection_artisanale"
  return undefined
}

export function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice:
      row.original_price != null && row.original_price !== ""
        ? Number(row.original_price)
        : undefined,
    image: row.image,
    images: Array.isArray(row.images) ? row.images : [],
    homeSection: normalizeHomeSection(row.home_section),
    description: row.description,
    category: row.category,
    sizes: Array.isArray(row.sizes) ? row.sizes.map(Number) : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    inStock: row.in_stock,
    badge: row.badge ?? undefined,
    rating: Number(row.rating),
    reviews: Number(row.review_count),
  }
}
