import type { Product } from "@/lib/data/products"

/** Ligne renvoyée par Supabase (snake_case côté DB si besoin — ici colonnes alignées avec insert) */
export type ProductRow = {
  id: string
  name: string
  price: number | string
  original_price?: number | string | null
  image: string
  images: string[]
  description: string
  category: string
  sizes: number[]
  colors: string[]
  in_stock: boolean
  badge?: string | null
  rating: number | string
  review_count: number | string
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
