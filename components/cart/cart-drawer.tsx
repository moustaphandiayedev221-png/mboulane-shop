"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, formatPrice } from "@/lib/store"
import { cn } from "@/lib/utils"

export function CartDrawer() {
  const { isCartOpen, setCartOpen, cart, updateQuantity, removeFromCart, getCartTotal, authRequired } =
    useStore()
  const [threshold, setThreshold] = useState(50000)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/site/settings/checkout", { cache: "no-store" })
        const data = (await res.json()) as { value?: { freeShippingThreshold?: number } | null }
        const t = Number(data.value?.freeShippingThreshold ?? 50000)
        if (Number.isFinite(t) && t > 0) setThreshold(t)
      } catch {
        // ignore
      }
    })()
  }, [])

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isCartOpen])

  const total = getCartTotal()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[110] bg-black/50 transition-opacity duration-300",
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[110] flex h-full w-full flex-col bg-background shadow-xl transition-transform duration-300 sm:w-[420px]",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Votre Panier</h2>
            <span className="text-sm text-muted-foreground">
              ({cart.length} {cart.length === 1 ? "article" : "articles"})
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(false)}
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {authRequired ? (
            <p className="mb-4 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Votre panier est sauvegardé sur cet appareil (navigateur et serveur si la connexion est active).
              Connectez-vous pour le lier à votre compte et le retrouver partout.
            </p>
          ) : null}
          {cart.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium text-muted-foreground">Livraison gratuite</span>
                <span className="font-bold text-accent">
                  {total >= threshold ? "Validée ! 🎉" : `Plus que ${formatPrice(threshold - total)}`}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", total >= threshold ? "bg-green-500" : "bg-accent")}
                  style={{ width: `${Math.min((total / threshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">Votre panier est vide</p>
              <Button onClick={() => setCartOpen(false)} asChild>
                <Link href="/boutique">Découvrir nos produits</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Taille: {item.size} | {item.color}
                    </p>
                    <p className="text-sm font-semibold text-accent mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Frais de livraison calculés à la commande
            </p>
            <div className="grid gap-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setCartOpen(false)}
                asChild
              >
                <Link href="/checkout">
                  Commander - {formatPrice(total)}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCartOpen(false)}
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
