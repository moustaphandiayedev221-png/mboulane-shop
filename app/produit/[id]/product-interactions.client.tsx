"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  Check as IconCheck,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, formatPrice } from "@/lib/store"
import type { Product } from "@/lib/data/products"
import { COLOR_MAP } from "@/lib/data/products"
import { getColorSwatchStyle, isWhiteSwatch } from "@/lib/colors"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"
import { getSiteBaseUrl } from "@/lib/site/base-url"

const GOLD = "#D4AF37"
const BRONZE = "#b38b6d"

const pillActive =
  "border-[#b38b6d] bg-[#FDFBF7] text-[#4a4036] shadow-[0_2px_12px_rgba(179,139,109,0.15)] ring-1 ring-[#b38b6d]/35"
const pillIdle =
  "border-[#e0d9ce] bg-white/90 text-[#6b5d4f] hover:border-[#C0A080]/55 hover:bg-white"

export function ProductInteractions({ product }: { product: Product }) {
  const canonicalProductUrl = `${getSiteBaseUrl()}/produit/${product.id}`
  const galleryImages = useMemo(() => {
    const raw = product.images.length > 0 ? product.images : [product.image]
    return Array.from(new Set(raw))
  }, [product.images, product.image])

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const { addToCart, setCartOpen, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSelectedImage(0)
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)
    setIsZoomed(false)
  }, [product.id])

  const inWishlist = mounted ? isInWishlist(product.id) : false

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % galleryImages.length)
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Veuillez sélectionner une taille et une couleur")
      return
    }
    addToCart({ product, quantity, size: selectedSize, color: selectedColor })
    toast.success(`${product.name} ajouté au panier !`)
    setCartOpen(true)
  }

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.info(`${product.name} retiré des favoris`)
    } else {
      addToWishlist(product)
      toast.success(`${product.name} ajouté aux favoris !`)
    }
  }

  const handleWhatsAppOrder = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Veuillez sélectionner une taille et une couleur")
      return
    }
    const imagePath = galleryImages[selectedImage] ?? product.image
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const imageUrl =
      origin !== ""
        ? new URL(imagePath.startsWith("/") ? imagePath : `/${imagePath}`, origin).href
        : imagePath
    const productUrl = typeof window !== "undefined" ? `${window.location.origin}/produit/${product.id}` : canonicalProductUrl

    const unitPrice = formatPrice(product.price)
    const lineTotal = formatPrice(product.price * quantity)

    const message = [
      "━━━━━━━━━━━━━━━━",
      "FICHE DE COMMANDE — MBOULANE",
      "━━━━━━━━━━━━━━━━",
      "",
      `Produit : ${product.name}`,
      `Référence : ${product.id}`,
      `Prix unitaire : ${unitPrice}`,
      `Quantité : ${quantity}`,
      `Taille : ${selectedSize}`,
      `Couleur : ${selectedColor}`,
      "",
      `Total estimé : ${lineTotal}`,
      "",
      `Image du produit : ${imageUrl}`,
      `Lien page produit : ${productUrl}`,
      "",
      "Merci de confirmer ma commande.",
    ].join("\n")

    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer")
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : canonicalProductUrl
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Lien copié !")
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="space-y-4">
        <div
          className="relative aspect-[9/10] cursor-zoom-in overflow-hidden rounded-[5px] border border-[#d8ccb8] bg-white shadow-[0_14px_44px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={galleryImages[selectedImage] || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn("object-cover transition-transform duration-500", isZoomed && "scale-150")}
            priority
          />

          {product.badge && (
            <span
              className="absolute left-5 top-5 z-10 max-w-[calc(100%-6rem)] rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/95 shadow-md"
              style={{
                borderColor: `${GOLD}cc`,
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(8px)",
              }}
            >
              {product.badge}
            </span>
          )}

          {galleryImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-[#e8e2d8] bg-[#FDFBF7]/95 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="h-4 w-4 text-[#4a4036]" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-[#e8e2d8] bg-[#FDFBF7]/95 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight className="h-4 w-4 text-[#4a4036]" />
              </Button>
            </>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a7d70]">Galerie</p>
            <div className={cn("scrollbar-none flex gap-2.5 overflow-x-auto pb-1 sm:gap-3", galleryImages.length <= 4 && "sm:flex-wrap sm:justify-center lg:justify-start")}>
              {galleryImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[5px] border-2 transition-all duration-300 sm:h-[5.25rem] sm:w-[5.25rem]",
                    selectedImage === index
                      ? "scale-[1.02] border-[#b38b6d] shadow-[0_4px_16px_rgba(179,139,109,0.25)] ring-1 ring-[#b38b6d]/35"
                      : "border-[#e8e2d8]/80 bg-white hover:border-[#C0A080]/55 hover:shadow-sm",
                  )}
                  aria-label={`Vue ${index + 1} sur ${galleryImages.length}`}
                  aria-current={selectedImage === index ? true : undefined}
                >
                  <Image src={img} alt={`${product.name} — vue ${index + 1}`} fill className="object-cover" sizes="84px" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-8">
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="font-serif text-3xl font-semibold tabular-nums text-[#4a4036] md:text-4xl">
            <span style={{ color: BRONZE }}>{formatPrice(product.price)}</span>
          </span>
          {product.originalPrice && (
            <span className="text-lg text-[#9a8b7d] line-through decoration-[#c9bfb2]/80">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="text-base font-light leading-relaxed text-[#6b5d4f] md:text-lg">{product.description}</p>

        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]">
            Couleur{" "}
            <span className="font-semibold normal-case tracking-normal text-[#3d3429]">
              · {selectedColor || "à choisir"}
            </span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color
              const isWhite = isWhiteSwatch(color, COLOR_MAP)
              const swatchStyle = getColorSwatchStyle(color, COLOR_MAP)
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                    isSelected ? "ring-2 ring-[#b38b6d] ring-offset-2 ring-offset-[#F7F3EC]" : "hover:scale-105",
                  )}
                  title={color}
                >
                  <div
                    className={cn("h-full w-full rounded-full border border-black/10 shadow-inner", isWhite && "border-[#e0d9ce]")}
                    style={{
                      ...(swatchStyle.backgroundColor ? { backgroundColor: swatchStyle.backgroundColor } : null),
                      ...(swatchStyle.backgroundImage ? { backgroundImage: swatchStyle.backgroundImage } : null),
                    }}
                  />
                  {isSelected && (
                    <div className={cn("absolute inset-0 flex items-center justify-center", isWhite ? "text-black" : "text-white")}>
                      <IconCheck className="h-3.5 w-3.5 drop-shadow-sm" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]">
              Pointure{" "}
              <span className="font-semibold normal-case tracking-normal text-[#3d3429]">
                · {selectedSize ?? "à choisir"}
              </span>
            </h3>
            <Link
              href="/guide-tailles"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b38b6d] underline-offset-4 hover:underline"
            >
              Guide des tailles
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn("min-h-12 min-w-[3rem] rounded-[5px] border px-4 text-sm font-semibold transition-all duration-300", selectedSize === size ? pillActive : pillIdle)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]">Quantité</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-[#e8e2d8] bg-[#FDFBF7]/90 p-1 shadow-inner">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold tabular-nums">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-white"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.14em]", product.inStock ? "text-emerald-700" : "text-red-600")}>
              {product.inStock ? "En stock" : "Rupture de stock"}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-14 min-w-[min(100%,14rem)] flex-1 gap-3 rounded-full text-base font-semibold shadow-[0_12px_36px_rgba(179,139,109,0.28)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag className="h-5 w-5" />
              Ajouter au panier
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-[#e0d9ce] bg-white/85 text-[#4a4036] shadow-sm transition-transform hover:scale-105 hover:bg-white"
              onClick={handleWishlist}
              aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={cn("h-5 w-5", inWishlist && "fill-[#b38b6d] text-[#b38b6d]")} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-[#e0d9ce] bg-white/85 text-[#4a4036] shadow-sm transition-transform hover:scale-105 hover:bg-white"
              onClick={handleShare}
              aria-label="Partager"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="h-14 w-full rounded-full border border-[#e8e2d8] bg-[#FDFBF7]/95 text-base font-semibold text-[#4a4036] shadow-sm transition-transform hover:scale-[1.01]"
            onClick={handleWhatsAppOrder}
            disabled={!product.inStock}
          >
            Commander via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}

