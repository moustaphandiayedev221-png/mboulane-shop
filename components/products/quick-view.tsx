"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingBag, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"
import { Product, formatPrice, useStore } from "@/lib/store"
import { COLOR_MAP } from "@/lib/data/products"
import { getColorSwatchStyle, isWhiteSwatch } from "@/lib/colors"
import { toast } from "sonner"

const GOLD = "#D4AF37"
const CREAM = "#F7F3EC"

interface QuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const { addToCart, setCartOpen } = useStore()

  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize(null)
      setSelectedColor(null)
    }
  }, [isOpen, product])

  if (!product) return null

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Veuillez sélectionner une taille et une couleur")
      return
    }

    addToCart({
      product,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    })
    toast.success(`${product.name} ajouté au panier !`)
    onClose()
    setCartOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-[min(100vw-1rem,920px)] max-h-[92vh] gap-0 overflow-hidden rounded-[5px] border border-[#d8ccb8] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.18)]",
          "bg-[#FDFBF7] duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Aperçu rapide — {product.name}</DialogTitle>
        </DialogHeader>

        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute right-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-[#e5dfd4] bg-white/95 text-[#4a4036] shadow-md backdrop-blur-sm transition-all duration-300",
            "hover:border-[#b38b6d]/55 hover:bg-white hover:text-[#2a2520] hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38b6d]/40 focus-visible:ring-offset-2",
          )}
          aria-label="Fermer"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="grid max-h-[inherit] md:grid-cols-[1.05fr_1fr]">
          {/* Visuel */}
          <div className="relative isolate min-h-[220px] shrink-0 overflow-hidden bg-[#ebe6dc] md:min-h-[min(520px,92vh)]">
            <Image
              src={product.image}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"
              aria-hidden
            />
            {product.badge ? (
              <span className="absolute left-4 top-4 z-10 rounded-full border border-white/35 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                {product.badge}
              </span>
            ) : (
              <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-[#f0d78c]" aria-hidden />
                MBOULANE
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 hidden p-4 md:block">
              <Link
                href={`/produit/${product.id}`}
                onClick={onClose}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md transition-all duration-300",
                  "hover:border-[#D4AF37]/65 hover:bg-black/35 hover:text-white",
                )}
              >
                Fiche complète
                <ChevronRight className="h-3.5 w-3.5 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Panneau infos */}
          <div
            className="relative flex max-h-[min(56vh,420px)] flex-col overflow-y-auto border-t border-[#e8e2d8] px-5 pb-6 pt-8 md:max-h-[min(520px,92vh)] md:border-l md:border-t-0 md:px-7 md:pb-8 md:pt-10"
            style={{
              backgroundColor: CREAM,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.12) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          >
            <div className="pointer-events-none absolute inset-x-8 top-6 h-px bg-gradient-to-r from-transparent via-[#b38b6d]/55 to-transparent md:inset-x-10 md:top-8" />

            <div className="relative mb-6 flex flex-1 flex-col gap-6">
              <div>
                <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a7d70]">
                  Aperçu rapide
                </p>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-[#2c2419] md:text-[1.35rem]">
                    {product.name}
                  </h2>
                  <p
                    className="shrink-0 pt-0.5 font-serif text-lg font-semibold md:text-xl"
                    style={{ color: GOLD }}
                  >
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Couleurs */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b5d4f]">
                    Couleur
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color
                      const isWhite = isWhiteSwatch(color, COLOR_MAP)
                      const swatchStyle = getColorSwatchStyle(color, COLOR_MAP)

                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38b6d]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]",
                            isSelected
                              ? "scale-105 ring-2 ring-[#b38b6d] ring-offset-2 ring-offset-[#F7F3EC]"
                              : "hover:scale-105 hover:ring-1 hover:ring-[#d8ccb8]",
                          )}
                        >
                          <span
                            className={cn(
                              "block h-7 w-7 rounded-full border shadow-inner",
                              isWhite ? "border-neutral-300" : "border-black/10",
                            )}
                            style={{
                              ...(swatchStyle.backgroundColor
                                ? { backgroundColor: swatchStyle.backgroundColor }
                                : null),
                              ...(swatchStyle.backgroundImage
                                ? { backgroundImage: swatchStyle.backgroundImage }
                                : null),
                            }}
                          />
                          {isSelected ? (
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/15">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/95 shadow-sm">
                                <svg
                                  viewBox="0 0 24 24"
                                  className={cn(
                                    "h-2.5 w-2.5",
                                    isWhite ? "text-neutral-900" : "text-[#b38b6d]",
                                  )}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  aria-hidden
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tailles */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b5d4f]">
                      Taille
                    </h3>
                    <Link
                      href="/guide-tailles"
                      onClick={onClose}
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b38b6d] underline-offset-4 transition-colors hover:text-[#8B5E3C] hover:underline"
                    >
                      Guide des tailles
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const sel = selectedSize === size
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[2.75rem] rounded-[5px] border px-3 py-2 text-xs font-semibold transition-all duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b38b6d]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]",
                            sel
                              ? "border-[#b38b6d] bg-[#2a2520] text-[#F7F3EC] shadow-[0_6px_20px_rgba(43,37,33,0.22)]"
                              : "border-[#e0d9ce] bg-white/85 text-[#4a4036] hover:border-[#C0A080]/65 hover:bg-[#fffefb]",
                          )}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3 border-t border-[#e5dfd4]/90 pt-5">
                <Link
                  href={`/produit/${product.id}`}
                  onClick={onClose}
                  className="flex md:hidden items-center justify-center gap-2 rounded-[5px] border border-[#d8ccb8] bg-white/90 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a4036] shadow-sm transition-colors hover:border-[#b38b6d]/45"
                >
                  Voir la fiche complète
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>

                <Button
                  size="lg"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className={cn(
                    "h-12 w-full rounded-[5px] gap-2 border border-[#D4AF37]/35 bg-[#2a2520] text-[11px] font-bold uppercase tracking-[0.22em] text-[#F7F3EC]",
                    "shadow-[0_10px_36px_rgba(0,0,0,0.15)] transition-all duration-300",
                    "hover:bg-[#b38b6d] hover:text-white hover:border-[#b38b6d]",
                    "disabled:opacity-45",
                  )}
                >
                  <ShoppingBag className="h-4 w-4 opacity-95" aria-hidden />
                  Ajouter au panier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
