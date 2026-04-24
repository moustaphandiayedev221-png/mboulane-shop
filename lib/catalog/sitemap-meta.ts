import { unstable_cache } from "next/cache"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { products as fallbackProducts } from "@/lib/data/products"

type ProductSitemapRow = { id: string; updated_at: string | null }

const fetchProductSitemapRows = unstable_cache(
  async (): Promise<ProductSitemapRow[]> => {
    try {
      const supabase = createPublicServerClient()
      const { data, error } = await supabase
        .from("products")
        .select("id, updated_at")
        .order("sort_order", { ascending: true })

      if (error) throw new Error(error.message)
      return (data ?? []) as ProductSitemapRow[]
    } catch {
      return fallbackProducts.map((p) => ({ id: p.id, updated_at: null }))
    }
  },
  ["catalog.sitemap.v1"],
  { revalidate: 300 },
)

export async function getProductSitemapRows(): Promise<ProductSitemapRow[]> {
  return await fetchProductSitemapRows()
}
