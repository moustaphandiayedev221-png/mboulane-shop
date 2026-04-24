import type { CartItem } from "@/lib/cart/types"

function lineKey(c: Pick<CartItem, "product" | "size" | "color">) {
  return `${c.product.id}|${c.size}|${c.color}`
}

/**
 * Fusionne panier serveur invité et copie locale (localStorage).
 * En cas de doublon : quantité max (évite la somme qui gonflerait après sync partielle).
 */
export function mergeGuestCartSources(server: CartItem[], local: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>()
  for (const s of server) map.set(lineKey(s), { ...s })
  for (const l of local) {
    const k = lineKey(l)
    const e = map.get(k)
    if (!e) map.set(k, { ...l })
    else map.set(k, { ...e, quantity: Math.max(e.quantity, l.quantity) })
  }
  return [...map.values()]
}
