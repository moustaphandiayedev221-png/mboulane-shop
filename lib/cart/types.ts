import type { Product } from "@/lib/data/products"

export interface CartItem {
  product: Product
  quantity: number
  size: number
  color: string
}
