import { describe, expect, it } from "vitest"
import type { Product } from "@/lib/data/products"
import { mergeGuestCartSources } from "@/lib/cart/merge-guest-sources"

const p = (id: string): Product => ({
  id,
  name: "Test",
  price: 1000,
  image: "/x.jpg",
  images: [],
  description: "",
  category: "X",
  sizes: [40],
  colors: ["Noir"],
  inStock: true,
  rating: 4,
  reviews: 1,
})

describe("mergeGuestCartSources", () => {
  it("prend le max pour une même ligne serveur / local", () => {
    const server = [{ product: p("1"), size: 40, color: "Noir", quantity: 2 }]
    const local = [{ product: p("1"), size: 40, color: "Noir", quantity: 3 }]
    const m = mergeGuestCartSources(server, local)
    expect(m).toHaveLength(1)
    expect(m[0].quantity).toBe(3)
  })

  it("concatène les lignes distinctes", () => {
    const server = [{ product: p("1"), size: 40, color: "Noir", quantity: 1 }]
    const local = [{ product: p("2"), size: 41, color: "Marron", quantity: 1 }]
    const m = mergeGuestCartSources(server, local)
    expect(m).toHaveLength(2)
  })
})
