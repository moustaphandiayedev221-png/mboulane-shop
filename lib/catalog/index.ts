import type { Product } from "@/lib/data/products"
import { products as fallbackProducts, categories as fallbackCategories, reviews as fallbackReviews } from "@/lib/data/products"

export type { Product } from "@/lib/data/products"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { mapRowToProduct, type ProductRow } from "@/lib/catalog/map-db-row"
import { unstable_cache } from "next/cache"

export type CustomerReview = {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

async function fetchProductsFromSupabase(): Promise<Product[]> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw new Error(error.message)
    if (!data?.length) throw new Error("Aucun produit en base (table products vide). Lancez le seed.")
    return (data as unknown as ProductRow[]).map(mapRowToProduct)
  } catch {
    return fallbackProducts
  }
}

const getProductsCached = unstable_cache(
  async () => await fetchProductsFromSupabase(),
  ["catalog.products.v2"],
  { revalidate: 300, tags: ["catalog.products"] },
)

export async function getProducts(): Promise<Product[]> {
  return await getProductsCached()
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getProducts()
  return all.find((p) => p.id === id)
}

async function fetchReviewsFromSupabase(): Promise<CustomerReview[]> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw new Error(error.message)
    if (!data?.length) return []
    return data.map((r) => ({
      id: String(r.id),
      name: r.name as string,
      location: r.location as string,
      rating: Number(r.rating),
      comment: r.comment as string,
      date: r.review_date as string,
      verified: Boolean(r.verified),
    }))
  } catch {
    return (fallbackReviews ?? []).map((r) => ({
      id: String((r as { id?: string }).id ?? ""),
      name: (r as { name: string }).name,
      location: (r as { location: string }).location,
      rating: Number((r as { rating: number }).rating),
      comment: (r as { comment: string }).comment,
      date: (r as { date: string }).date,
      verified: Boolean((r as { verified: boolean }).verified),
    }))
  }
}

export async function getReviews(): Promise<CustomerReview[]> {
  return await fetchReviewsFromSupabase()
}

export async function getCategoryLabels(): Promise<string[]> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("categories")
      .select("label")
      .order("sort_order", { ascending: true })

    if (error) throw new Error(error.message)
    if (!data?.length) throw new Error("Aucune catégorie en base (table categories vide). Lancez le seed.")

    return ["Tous", ...data.map((c) => c.label as string)]
  } catch {
    return fallbackCategories
  }
}
