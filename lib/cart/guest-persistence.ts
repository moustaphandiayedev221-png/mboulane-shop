import type { CartItem } from "@/lib/cart/types"

const STORAGE_KEY = "mboulane-shop-guest-cart-v1"

function safeParse(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (row): row is CartItem =>
        row != null &&
        typeof row === "object" &&
        typeof (row as CartItem).quantity === "number" &&
        typeof (row as CartItem).size === "number" &&
        typeof (row as CartItem).color === "string" &&
        (row as CartItem).product != null &&
        typeof (row as CartItem).product.id === "string",
    )
  } catch {
    return []
  }
}

export function loadGuestCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveGuestCartToStorage(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  try {
    if (cart.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // quota dépassée ou navigation privée stricte
  }
}

export function clearGuestCartStorage(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
