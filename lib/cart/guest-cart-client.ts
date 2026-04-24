import type { CartItem } from "@/lib/cart/types"

export type GuestCartLinePayload = {
  product_id: string
  size: number
  color: string
  quantity: number
}

export function cartToGuestSyncLines(cart: CartItem[]): GuestCartLinePayload[] {
  return cart.map((c) => ({
    product_id: c.product.id,
    size: c.size,
    color: c.color,
    quantity: c.quantity,
  }))
}

export async function fetchGuestCartFromApi(): Promise<CartItem[]> {
  try {
    const res = await fetch("/api/cart/guest", { credentials: "include" })
    if (!res.ok) return []
    const data = (await res.json()) as { items?: CartItem[] }
    return Array.isArray(data.items) ? data.items : []
  } catch {
    return []
  }
}

export async function postGuestCartFullSync(lines: GuestCartLinePayload[]): Promise<boolean> {
  try {
    const res = await fetch("/api/cart/guest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function putGuestCartLine(line: GuestCartLinePayload): Promise<boolean> {
  try {
    const res = await fetch("/api/cart/guest", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(line),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function deleteGuestCartLine(productId: string, size: number, color: string): Promise<boolean> {
  try {
    const q = new URLSearchParams({
      product_id: productId,
      size: String(size),
      color,
    })
    const res = await fetch(`/api/cart/guest?${q}`, { method: "DELETE", credentials: "include" })
    return res.ok
  } catch {
    return false
  }
}

export async function deleteGuestCartAll(): Promise<boolean> {
  try {
    const res = await fetch("/api/cart/guest?all=1", { method: "DELETE", credentials: "include" })
    return res.ok
  } catch {
    return false
  }
}
