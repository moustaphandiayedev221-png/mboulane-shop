"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Product, formatPrice, useStore } from "@/lib/store"
import { COLOR_MAP } from "@/lib/data/products"
import { getColorSwatchStyle } from "@/lib/colors"
import { Eye, Heart, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  showNewBadge?: boolean
  variant?: "default" | "luxury"
  /** Affichage boutique : grille (carte verticale) ou liste (rangée horizontale) */
  layout?: "grid" | "list"
}

export function ProductCard({
  product,
  showNewBadge,
  variant = "default",
  layout = "grid",
}: ProductCardProps) {
  const {
    setQuickView,
    addToCart,
    setCartOpen,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const inWishlist = mounted ? isInWishlist(product.id) : false

  const badgeLabel =
    showNewBadge && !product.badge ? "Nouveau" : product.badge

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.success("Retiré des favoris")
    } else {
      addToWishlist(product)
      toast.success("Ajouté aux favoris")
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickView(product)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const size = product.sizes[0]
    const color = product.colors[0] ?? ""
    if (size == null) {
      toast.error("Taille indisponible")
      return
    }
    addToCart({ product, quantity: 1, size, color })
    toast.success(`${product.name} ajouté au panier`)
    setCartOpen(true)
  }

  const wishlistButtonClass =
    variant === "luxury"
      ? cn(
          "absolute right-3 top-3 z-[35] flex h-10 w-10 items-center justify-center rounded-full",
          "border border-black/15 bg-black/45 backdrop-blur-md transition-all duration-300 ease-out",
          "hover:scale-105 hover:border-[#D4AF37]/60 hover:bg-black/65 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]",
          inWishlist && "border-[#D4AF37]/70 bg-black/75 text-[#D4AF37]",
        )
      : cn(
          "absolute right-3 top-3 z-[35] flex h-10 w-10 items-center justify-center rounded-full",
          "border border-white/20 bg-black/50 backdrop-blur-md transition-all duration-300 ease-out",
          "hover:scale-105 hover:border-[#D4AF37]/55 hover:bg-black/70 hover:shadow-[0_0_18px_rgba(212,175,55,0.3)]",
          inWishlist && "border-[#D4AF37]/65 bg-black/80 text-[#D4AF37]",
        )

  if (variant === "luxury" && layout === "list") {
    return (
      <div className="group/card relative">
        <div className="flex flex-row gap-3 border border-[#e5e0d6] bg-white p-3 shadow-[0_4px_22px_rgba(0,0,0,0.06)] transition-shadow duration-300 sm:gap-4 sm:p-4 md:hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]">
          <div className="relative h-[132px] w-[99px] shrink-0 overflow-hidden bg-[#f5f2ed] sm:h-[168px] sm:w-[126px] md:h-[200px] md:w-[150px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 99px, (max-width: 1024px) 126px, 150px"
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
            />

            <Link
              href={`/produit/${product.id}`}
              className="absolute inset-0 z-[5]"
              aria-label={`Voir ${product.name}`}
            >
              <span className="sr-only">Voir la fiche produit</span>
            </Link>

            {(product.badge || showNewBadge) && badgeLabel && (
              <span className="absolute left-2 top-2 z-30 max-w-[calc(100%-2.5rem)] bg-white px-2 py-1 text-[8px] font-semibold uppercase leading-tight tracking-wide text-black shadow-sm sm:text-[9px]">
                {badgeLabel}
              </span>
            )}

            <button
              type="button"
              onClick={toggleWishlist}
              className={cn(
                wishlistButtonClass,
                "right-2 top-2 h-9 w-9 sm:right-2.5 sm:top-2.5",
              )}
              aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors duration-300 sm:h-[18px] sm:w-[18px]",
                  inWishlist ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white",
                )}
              />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
            <div className="min-w-0 space-y-1.5 text-left">
              <Link href={`/produit/${product.id}`} className="block">
                <h3 className="font-serif text-[15px] font-medium leading-snug tracking-wide text-foreground sm:text-base">
                  {product.name}
                </h3>
              </Link>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7d70]">
                {product.category}
              </p>
              <p className="line-clamp-2 text-[12px] leading-relaxed text-[#6b5d4f] sm:text-[13px]">
                {product.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <p className="text-sm font-semibold tabular-nums text-[#b38b6d]">{formatPrice(product.price)}</p>
                {product.originalPrice != null && (
                  <p className="text-xs text-[#9a8b7d] line-through">{formatPrice(product.originalPrice)}</p>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center gap-1">
                    {product.colors.slice(0, 4).map((color) => {
                      const swatchStyle = getColorSwatchStyle(color, COLOR_MAP)
                      return (
                        <div
                          key={color}
                          className="h-2 w-2 rounded-full border border-black/10 shadow-sm sm:h-2.5 sm:w-2.5"
                          style={{
                            ...(swatchStyle.backgroundColor ? { backgroundColor: swatchStyle.backgroundColor } : null),
                            ...(swatchStyle.backgroundImage
                              ? { backgroundImage: swatchStyle.backgroundImage }
                              : null),
                          }}
                          title={color}
                        />
                      )
                    })}
                    {product.colors.length > 4 && (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        +{product.colors.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[#ebe5dc] pt-3 sm:gap-3">
              <button
                type="button"
                onClick={handleQuickView}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e0d9ce] bg-[#FDFBF7] px-3 text-[11px] font-semibold uppercase tracking-wide text-[#4a4036] transition-colors hover:border-[#b38b6d]/45 hover:bg-white"
              >
                <Eye className="h-3.5 w-3.5" />
                Aperçu
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#2a2520] px-3 text-[11px] font-semibold uppercase tracking-wide text-[#F7F3EC] shadow-sm transition-colors hover:bg-[#b38b6d]"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Panier
              </button>
              <Link
                href={`/produit/${product.id}`}
                className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-[#b38b6d] underline-offset-4 hover:underline"
              >
                Fiche
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "luxury") {
    return (
      <div className="group/card relative">
        <div className="border border-[#e5e0d6] bg-white p-4 shadow-[0_4px_22px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.09)]">
          <div className="relative mb-5 aspect-[3/4] overflow-hidden bg-[#f5f2ed]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
            />

            <Link
              href={`/produit/${product.id}`}
              className="absolute inset-0 z-[5] transition-opacity duration-300 md:group-hover/card:pointer-events-none md:group-hover/card:opacity-0"
              aria-label={`Voir ${product.name}`}
            >
              <span className="sr-only">Voir la fiche produit</span>
            </Link>

            {(product.badge || showNewBadge) && badgeLabel && (
              <span className="absolute left-3 top-3 z-30 max-w-[calc(100%-5rem)] bg-white px-2.5 py-1.5 text-[9px] font-semibold uppercase leading-tight tracking-wide text-black shadow-sm">
                {badgeLabel}
              </span>
            )}

            <button
              type="button"
              onClick={toggleWishlist}
              className={wishlistButtonClass}
              aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px] transition-colors duration-300",
                  inWishlist ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white",
                )}
              />
            </button>

            {/* Actions overlay: desktop uniquement (mobile = clic direct sur la carte) */}
            <div className="absolute inset-0 z-20 hidden items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-300 md:flex md:group-hover/card:bg-black/25 md:group-hover/card:opacity-100">
              <button
                type="button"
                onClick={handleQuickView}
                className="flex h-11 w-11 scale-95 items-center justify-center rounded-full bg-white text-black shadow-md transition-transform duration-300 hover:scale-105"
                title="Aperçu rapide"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-11 w-11 scale-95 items-center justify-center rounded-full bg-[#8B5E3C] text-white shadow-md transition-transform duration-300 hover:scale-105"
                title="Ajouter au panier"
              >
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Link
            href={`/produit/${product.id}`}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <h3 className="font-serif text-base font-medium tracking-wide text-foreground md:text-[1.05rem]">
              {product.name}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {formatPrice(product.price)}
              </p>
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {product.colors.slice(0, 3).map((color) => {
                    const swatchStyle = getColorSwatchStyle(color, COLOR_MAP)
                    return (
                      <div
                        key={color}
                        className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-sm"
                        style={{
                          ...(swatchStyle.backgroundColor ? { backgroundColor: swatchStyle.backgroundColor } : null),
                          ...(swatchStyle.backgroundImage
                            ? { backgroundImage: swatchStyle.backgroundImage }
                            : null),
                        }}
                        title={color}
                      />
                    )
                  })}
                  {product.colors.length > 3 && (
                    <span className="text-[9px] font-bold text-muted-foreground">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <div className="rounded-md border border-border bg-card p-3 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:rotate-[1deg] hover:scale-[1.02] hover:shadow-2xl sm:p-4">
        <div className="relative mb-5 aspect-[3/4] overflow-hidden rounded-md bg-white">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
          />

          <Link
            href={`/produit/${product.id}`}
            className="absolute inset-0 z-[5] transition-opacity duration-500 md:group-hover:pointer-events-none md:group-hover:opacity-0"
            aria-label={`Voir ${product.name}`}
          >
            <span className="sr-only">Voir la fiche produit</span>
          </Link>

          {(product.badge || showNewBadge) && (
            <span className="absolute left-3 top-3 z-30 max-w-[calc(100%-5rem)] bg-white px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-black shadow-sm">
              {showNewBadge && !product.badge ? "Nouvelle Co." : product.badge}
            </span>
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            className={wishlistButtonClass}
            aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "h-[18px] w-[18px] transition-colors duration-300",
                inWishlist ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white",
              )}
            />
          </button>

          {/* Actions overlay: desktop uniquement (mobile = clic direct sur la carte) */}
          <div className="absolute inset-0 z-20 hidden items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 md:flex md:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleQuickView}
              className="rounded-full bg-white p-3 text-black shadow-lg transition-transform duration-300 hover:scale-110"
              title="Aperçu rapide"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full bg-accent p-3 text-white shadow-lg transition-transform duration-300 hover:scale-110"
              title="Ajouter au panier"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Link
          href={`/produit/${product.id}`}
          className="flex flex-col items-center gap-1 text-center"
        >
          <h3 className="font-serif text-[1.1rem] font-medium tracking-wide text-foreground md:text-lg">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              {formatPrice(product.price)}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="ml-1 flex items-center gap-1">
                {product.colors.slice(0, 3).map((color) => {
                  const swatchStyle = getColorSwatchStyle(color, COLOR_MAP)
                  return (
                    <div
                      key={color}
                      className="h-2 w-2 rounded-full border border-black/5 shadow-sm"
                      style={{
                        ...(swatchStyle.backgroundColor ? { backgroundColor: swatchStyle.backgroundColor } : null),
                        ...(swatchStyle.backgroundImage ? { backgroundImage: swatchStyle.backgroundImage } : null),
                      }}
                      title={color}
                    />
                  )
                })}
                {product.colors.length > 3 && (
                  <span className="text-[8px] font-bold text-muted-foreground">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
