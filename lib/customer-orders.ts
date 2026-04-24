/**
 * Session client + historique commandes (localStorage, démo sans backend).
 * Les commandes sont enregistrées au paiement sur /checkout avec l’email du formulaire.
 */

export type OrderStatus = "confirmée" | "préparation" | "expédiée" | "livrée"

export interface StoredOrderLine {
  productId: string
  name: string
  image: string
  quantity: number
  size: number
  color: string
  unitPrice: number
}

export interface StoredOrder {
  id: string
  createdAt: string
  email: string
  firstName: string
  lastName: string
  phone: string
  city: string
  address: string
  paymentMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  items: StoredOrderLine[]
}

const SESSION_KEY = "mboulane-session"
const ORDERS_KEY = "mboulane-orders"

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getCustomerSession(): { email: string } | null {
  if (typeof window === "undefined") return null
  return safeParse<{ email: string }>(localStorage.getItem(SESSION_KEY))
}

export function setCustomerSession(email: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email.trim().toLowerCase() }))
  window.dispatchEvent(new Event("mboulane-session-changed"))
}

export function clearCustomerSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event("mboulane-session-changed"))
}

export function getAllOrders(): StoredOrder[] {
  if (typeof window === "undefined") return []
  return safeParse<StoredOrder[]>(localStorage.getItem(ORDERS_KEY)) ?? []
}

export function saveOrder(order: StoredOrder): string {
  if (typeof window === "undefined") return order.id
  const all = getAllOrders()
  all.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all))
  return order.id
}

export function getOrdersForEmail(email: string): StoredOrder[] {
  const e = email.trim().toLowerCase()
  return getAllOrders().filter((o) => o.email === e)
}

export function generateOrderId(): string {
  const t = Date.now()
  const r = Math.floor(Math.random() * 900 + 100)
  return `MB-${t}-${r}`
}
