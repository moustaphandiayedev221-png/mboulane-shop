"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { formatPrice, useStore, type Product } from "@/lib/store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const GOLD = "#D4AF37"
const IMAGE_BG = "#f5f5f5"

function PremiumProductCard({ product, index }: { product: Product; index: number }) {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToCart,
    setCartOpen,
  } = useStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const inWishlist = mounted ? isInWishlist(product.id) : false
  const badgeLabel = product.badge ?? "Cuir Premium"

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

  const handleAddCart = (e: React.MouseEvent) => {
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

  return (
    <article
      className="group/card flex flex-col transition-all duration-300 ease-out animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[5px] border border-white/10",
          "bg-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl",
          "transition-all duration-300 ease-out",
          "hover:border-[#D4AF37]/45 hover:shadow-[0_12px_48px_rgba(212,175,55,0.18),0_0_0_1px_rgba(212,175,55,0.12)]",
        )}
      >
        <div className="relative p-3">
          {badgeLabel ? (
            <span
              className="absolute left-5 top-5 z-20 max-w-[calc(100%-5rem)] rounded-full border border-[#D4AF37]/80 bg-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/95 shadow-sm"
              style={{ borderColor: `${GOLD}cc` }}
            >
              {badgeLabel}
            </span>
          ) : null}

          <button
            type="button"
            onClick={toggleWishlist}
            className={cn(
              "absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full",
              "border border-white/15 bg-black/50 backdrop-blur-md transition-all duration-300 ease-out",
              "hover:scale-105 hover:border-[#D4AF37]/60 hover:bg-black/70 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]",
              inWishlist && "border-[#D4AF37]/70 bg-black/80 text-[#D4AF37]",
            )}
            aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "h-[18px] w-[18px] transition-colors duration-300",
                inWishlist ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white",
              )}
            />
          </button>

          <div
            className="relative aspect-[3/4] overflow-hidden rounded-[5px] transition-transform duration-300 ease-out"
            style={{ backgroundColor: IMAGE_BG }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.06]"
            />

            <Link
              href={`/produit/${product.id}`}
              className="absolute inset-0 z-[5] transition-opacity duration-300 group-hover/card:pointer-events-none group-hover/card:opacity-0"
              aria-label={`Voir ${product.name}`}
            >
              <span className="sr-only">Voir la fiche produit</span>
            </Link>

            <div
              className="pointer-events-none absolute inset-0 z-[6] opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
              }}
            />

            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 opacity-0 transition-all duration-300 ease-out group-hover/card:pointer-events-auto group-hover/card:opacity-100">
              <Button
                asChild
                size="sm"
                className="h-10 rounded-full border border-white/20 bg-white/95 px-6 text-xs font-semibold text-black shadow-lg transition-transform duration-300 ease-out hover:scale-[1.02] hover:bg-white"
              >
                <Link href={`/produit/${product.id}`}>Voir</Link>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddCart}
                className="h-10 rounded-full border border-[#D4AF37]/50 bg-black/80 px-6 text-xs font-semibold text-[#D4AF37] shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out hover:scale-[1.02] hover:bg-black hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
              >
                <ShoppingBag className="mr-2 h-3.5 w-3.5" />
                Ajouter panier
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1 px-5 pb-5 pt-2 text-center">
          <h3 className="font-serif text-lg font-semibold leading-snug text-white transition-colors duration-300 ease-out group-hover/card:text-white/90">
            <Link href={`/produit/${product.id}`} className="hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p
            className="text-base font-semibold tracking-tight md:text-lg"
            style={{ color: GOLD }}
          >
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </article>
  )
}

export function PremiumCollectionSection({
  products,
}: {
  products: Product[]
}) {
  const premiumProducts = products
    .filter((p) => p.category === "Premium" || p.price >= 38000)
    .slice(0, 4)

  return (
    <section
      className="relative overflow-hidden border-y border-white/5 py-16 text-white md:py-24"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, #252525 0%, #0f0f0f 42%, #050505 100%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title="Premium & Luxe" />

        <p className="mx-auto mb-12 max-w-xl text-center text-sm font-light leading-relaxed text-white/50 md:mb-14 md:text-base">
          Une sélection rigoureuse de nos créations les plus prestigieuses — même exigence
          que nos collections signature.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-4 lg:gap-10">
          {premiumProducts.map((product, index) => (
            <PremiumProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="mt-14 border-b border-white/10 pb-6 text-center md:mt-16">
          <Button
            asChild
            className="group/btn h-12 gap-3 rounded-full border border-[#D4AF37]/40 bg-white px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 ease-out hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_28px_rgba(212,175,55,0.35)]"
          >
            <Link href="/boutique?filter=premium">
              Toute la collection Luxe
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
