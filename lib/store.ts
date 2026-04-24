import { create } from "zustand"
import type { Product } from "@/lib/data/products"
import {
  deleteGuestCartAll,
  deleteGuestCartLine,
  cartToGuestSyncLines,
  fetchGuestCartFromApi,
  postGuestCartFullSync,
  putGuestCartLine,
} from "@/lib/cart/guest-cart-client"
import { clearGuestCartStorage, loadGuestCartFromStorage, saveGuestCartToStorage } from "@/lib/cart/guest-persistence"
import { mergeGuestCartSources } from "@/lib/cart/merge-guest-sources"
import type { CartItem } from "@/lib/cart/types"
import { createClient } from "@/lib/supabase/client"

export type { Product } from "@/lib/data/products"
export type { CartItem } from "@/lib/cart/types"

let initializeLock: Promise<void> | null = null

function cartLineKey(item: Pick<CartItem, "product" | "size" | "color">): string {
  return `${item.product.id}|${item.size}|${item.color}`
}

function mergeCartListsMax(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>()
  for (const b of base) map.set(cartLineKey(b), { ...b })
  for (const it of incoming) {
    const k = cartLineKey(it)
    const e = map.get(k)
    if (!e) map.set(k, { ...it })
    else map.set(k, { ...e, quantity: Math.max(e.quantity, it.quantity) })
  }
  return [...map.values()]
}

async function saveGuestCartIfAnonymous(cart: CartItem[]): Promise<void> {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) saveGuestCartToStorage(cart)
}

export interface WishlistItem {
  product: Product
}

interface StoreState {
  initialized: boolean
  authRequired: boolean
  setAuthRequired: (v: boolean) => void
  initializeFromSupabase: () => Promise<void>

  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, size: number, color: string) => void
  updateQuantity: (productId: string, size: number, color: string, quantity: number) => void
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartCount: () => number
  
  // Wishlist
  wishlist: WishlistItem[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  
  // UI State
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  
  // Quick View
  quickViewProduct: Product | null
  setQuickView: (product: Product | null) => void
  isQuickViewOpen: boolean
  setQuickViewOpen: (open: boolean) => void
}

export const useStore = create<StoreState>()((set, get) => ({
  initialized: false,
  authRequired: false,
  setAuthRequired: (v) => set({ authRequired: v }),
  initializeFromSupabase: async () => {
    if (initializeLock) {
      await initializeLock
      return
    }

    initializeLock = (async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null
    if (!user) {
      const local = loadGuestCartFromStorage()
      const fromApi = await fetchGuestCartFromApi()
      const mergedGuest = mergeGuestCartSources(fromApi, local)
      const currentCart = get().cart
      const merged = mergeCartListsMax(mergedGuest, currentCart)
      saveGuestCartToStorage(merged)
      set({
        initialized: true,
        authRequired: true,
        cart: merged,
        wishlist: [],
      })
      void postGuestCartFullSync(cartToGuestSyncLines(merged))
      return
    }

    const [cartRes, wishRes] = await Promise.all([
      supabase
        .from("cart_items")
        .select("quantity,size,color, product:products(*)")
        .order("updated_at", { ascending: false }),
      supabase
        .from("wishlist_items")
        .select("product:products(*)")
        .order("created_at", { ascending: false }),
    ])

    if (cartRes.error || wishRes.error) {
      set({ initialized: true })
      return
    }

    type CartItemRow = {
      quantity: number
      size: number
      color: string
      product: Product | null
    }
    type WishlistItemRow = {
      product: Product | null
    }

    const cart: CartItem[] = (cartRes.data ?? [])
      .map((row) => row as unknown as CartItemRow)
      .map((row) => ({
        product: row.product as Product,
        quantity: Number(row.quantity),
        size: Number(row.size),
        color: String(row.color ?? ""),
      }))
      .filter((it) => Boolean(it.product?.id))

    const wishlist: WishlistItem[] = (wishRes.data ?? [])
      .map((row) => row as unknown as WishlistItemRow)
      .map((row) => ({ product: row.product as Product }))
      .filter((it) => Boolean(it.product?.id))

    let mergedCart = cart
    const currentCart = get().cart
    if (currentCart.length > 0) {
      mergedCart = mergeCartListsMax(mergedCart, currentCart)
    }
    const apiGuest = await fetchGuestCartFromApi()
    const localGuest = loadGuestCartFromStorage()
    const guestBundle = mergeGuestCartSources(apiGuest, localGuest)
    if (guestBundle.length > 0) {
      const latestCart = get().cart
      const candidate = mergeCartListsMax(mergeCartListsMax(cart, latestCart), guestBundle)
      const uid = user.id
      let syncOk = true
      for (const line of candidate) {
        const { error } = await supabase.from("cart_items").upsert(
          {
            user_id: uid,
            product_id: line.product.id,
            size: line.size,
            color: line.color,
            quantity: line.quantity,
          },
          { onConflict: "user_id,product_id,size,color" },
        )
        if (error) {
          syncOk = false
          break
        }
      }
      if (syncOk) {
        clearGuestCartStorage()
        await deleteGuestCartAll()
        mergedCart = candidate
      }
    }

    set({ initialized: true, authRequired: false, cart: mergedCart, wishlist })
    })().finally(() => {
      initializeLock = null
    })

    await initializeLock
  },

  // Cart
  cart: [],
  addToCart: (item) => {
    const cart = get().cart
    const existingIndex = cart.findIndex(
      (i) =>
        i.product.id === item.product.id &&
        i.size === item.size &&
        i.color === item.color,
    )

    const nextCart =
      existingIndex > -1
        ? cart.map((it, idx) =>
            idx === existingIndex
              ? { ...it, quantity: it.quantity + item.quantity }
              : it,
          )
        : [...cart, item]

    set({ cart: nextCart })
    void saveGuestCartIfAnonymous(nextCart)

    // Fire-and-forget DB sync (auth requis)
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        set({ authRequired: true })
        const hit = nextCart.find(
          (i) =>
            i.product.id === item.product.id &&
            i.size === item.size &&
            i.color === item.color,
        )
        if (hit) {
          await putGuestCartLine({
            product_id: hit.product.id,
            size: hit.size,
            color: hit.color,
            quantity: hit.quantity,
          })
        }
        return
      }
      set({ authRequired: false })
      const row = {
        user_id: data.user.id,
        product_id: item.product.id,
        size: item.size,
        color: item.color,
        quantity:
          existingIndex > -1
            ? nextCart[existingIndex].quantity
            : item.quantity,
      }
      await supabase
        .from("cart_items")
        .upsert(row, { onConflict: "user_id,product_id,size,color" })
    })()
  },
  removeFromCart: (productId, size, color) => {
    const next = get().cart.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.size === size &&
          item.color === color
        ),
    )
    set({ cart: next })
    void saveGuestCartIfAnonymous(next)
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        set({ authRequired: true })
        await deleteGuestCartLine(productId, size, color)
        return
      }
      set({ authRequired: false })
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", data.user.id)
        .eq("product_id", productId)
        .eq("size", size)
        .eq("color", color)
    })()
  },
  updateQuantity: (productId, size, color, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, size, color)
      return
    }
    const nextMap = get().cart.map((item) =>
      item.product.id === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item,
    )
    set({ cart: nextMap })
    void saveGuestCartIfAnonymous(nextMap)
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        set({ authRequired: true })
        await putGuestCartLine({ product_id: productId, size, color, quantity })
        return
      }
      set({ authRequired: false })
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", data.user.id)
        .eq("product_id", productId)
        .eq("size", size)
        .eq("color", color)
    })()
  },
  clearCart: async () => {
    set({ cart: [] })
    clearGuestCartStorage()
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      set({ authRequired: true })
      await deleteGuestCartAll()
      return
    }
    set({ authRequired: false })
    await supabase.from("cart_items").delete().eq("user_id", data.user.id)
  },
  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    )
  },
  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0)
  },
  
  // Wishlist
  wishlist: [],
  addToWishlist: (product) => {
    const wishlist = get().wishlist
    if (wishlist.some((item) => item.product.id === product.id)) return
    set({ wishlist: [...wishlist, { product }] })
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        set({ authRequired: true })
        return
      }
      set({ authRequired: false })
      await supabase
        .from("wishlist_items")
        .upsert(
          { user_id: data.user.id, product_id: product.id },
          { onConflict: "user_id,product_id" },
        )
    })()
  },
  removeFromWishlist: (productId) => {
    set({
      wishlist: get().wishlist.filter((item) => item.product.id !== productId),
    })
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        set({ authRequired: true })
        return
      }
      set({ authRequired: false })
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", data.user.id)
        .eq("product_id", productId)
    })()
  },
  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item.product.id === productId)
  },
  
  // UI State
  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  // Quick View
  quickViewProduct: null,
  setQuickView: (product) =>
    set({ quickViewProduct: product, isQuickViewOpen: !!product }),
  isQuickViewOpen: false,
  setQuickViewOpen: (open) =>
    set({
      isQuickViewOpen: open,
      quickViewProduct: open ? get().quickViewProduct : null,
    }),
}))

// Format price in FCFA
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' FCFA'
}
