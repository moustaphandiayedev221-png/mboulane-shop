"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/products/product-card"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { useStore, formatPrice } from "@/lib/store"
import type { Product } from "@/lib/data/products"
import { COLOR_MAP } from "@/lib/data/products"
import { getColorSwatchStyle, isWhiteSwatch } from "@/lib/colors"
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check as IconCheck,
  Share2,
  Facebook,
  Twitter,
  Link2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getSiteBaseUrl } from "@/lib/site/base-url"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

const SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

const GOLD = "#D4AF37"
const BRONZE = "#b38b6d"

interface ProductDetailProps {
  product: Product
  allProducts: Product[]
}

export function ProductDetail({ product, allProducts }: ProductDetailProps) {
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
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([])

  useEffect(() => {
    setSelectedImage(0)
  }, [product.id])

  useEffect(() => {
    setMounted(true)

    try {
      const stored = localStorage.getItem("recentlyViewed")
      let ids: string[] = stored ? JSON.parse(stored) : []
      if (ids[0] !== product.id) {
        ids = ids.filter((id) => id !== product.id)
        ids.unshift(product.id)
        if (ids.length > 5) ids = ids.slice(0, 5)
        localStorage.setItem("recentlyViewed", JSON.stringify(ids))
      }
      setRecentlyViewedIds(ids.filter((id) => id !== product.id).slice(0, 4))
    } catch {
      /* ignore */
    }
  }, [product.id])

  const inWishlist = mounted ? isInWishlist(product.id) : false

  const pillActive =
    "border-[#b38b6d] bg-[#FDFBF7] text-[#4a4036] shadow-[0_2px_12px_rgba(179,139,109,0.15)] ring-1 ring-[#b38b6d]/35"
  const pillIdle =
    "border-[#e0d9ce] bg-white/90 text-[#6b5d4f] hover:border-[#C0A080]/55 hover:bg-white"

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Veuillez sélectionner une taille et une couleur")
      return
    }

    addToCart({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor,
    })
    toast.success(`${product.name} ajouté au panier !`)
    setCartOpen(true)
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
    const productUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/produit/${product.id}`
        : canonicalProductUrl

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

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast.info(`${product.name} retiré des favoris`)
    } else {
      addToWishlist(product)
      toast.success(`${product.name} ajouté aux favoris !`)
    }
  }

  const categoryProducts = allProducts.filter((p) => p.id !== product.id && p.category === product.category)
  const badgeProducts = allProducts.filter(
    (p) => p.id !== product.id && p.badge === product.badge && p.category !== product.category,
  )
  const otherProducts = allProducts.filter(
    (p) => p.id !== product.id && p.category !== product.category && p.badge !== product.badge,
  )

  const relatedProducts = [...categoryProducts, ...badgeProducts, ...otherProducts].slice(0, 4)

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <main className="min-h-screen overflow-x-hidden" style={SURFACE}>
      <Header />

      {/* Fil d'Ariane */}
      <div className="border-b border-[#e5dfd4]/90 pt-20 pb-8 md:pt-24 md:pb-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7d70]">
            <Link href="/" className="transition-colors hover:text-[#b38b6d]">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
            <Link href="/boutique" className="transition-colors hover:text-[#b38b6d]">
              Boutique
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
            <span className="max-w-[min(100%,28rem)] truncate font-semibold text-[#4a4036]" title={product.name}>
              {product.name}
            </span>
          </nav>

          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e0d9ce] bg-white/90 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5d4f] shadow-sm">
              <Sparkles className="h-3 w-3" style={{ color: BRONZE }} aria-hidden />
              Pièce sélectionnée
            </span>
            <p className="max-w-xl text-sm font-light leading-relaxed text-[#6b5d4f]">
              Finitions artisanales, matières nobles — la même signature luxe que sur notre accueil.
            </p>
          </div>
        </div>
      </div>

      {/* Contenu produit */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Galerie */}
            <div className="space-y-4">
              <div
                className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[5px] border border-[#d8ccb8] bg-white shadow-[0_14px_44px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={galleryImages[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className={cn(
                    isZoomed ? "object-cover scale-150 cursor-zoom-out" : "object-contain cursor-zoom-in",
                    "transition-transform duration-500",
                  )}
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

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a7d70]">Galerie</p>
                <div
                  className={cn(
                    "scrollbar-none flex gap-2.5 overflow-x-auto pb-1 sm:gap-3",
                    galleryImages.length <= 4 && "sm:flex-wrap sm:justify-center lg:justify-start",
                  )}
                >
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
            </div>

            {/* Infos */}
            <div className="flex flex-col space-y-8">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "inline-flex rounded-[5px] border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    pillIdle,
                  )}
                >
                  {product.category}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-4 w-4",
                        s <= Math.floor(product.rating) ? "fill-[#b38b6d] text-[#b38b6d]" : "text-[#e0d9ce]",
                      )}
                    />
                  ))}
                  <span className="ml-2 tabular-nums font-semibold text-[#4a4036]">{product.rating}</span>
                </div>
              </div>

              <div>
                <h1 className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-[#3d3429] md:text-[2.75rem] md:leading-[1.1]">
                  {product.name}
                </h1>
                <div className="mx-auto mt-6 h-px max-w-[12rem] bg-gradient-to-r from-transparent via-[#b38b6d]/70 to-transparent md:mx-0" />
              </div>

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

              {/* Couleurs */}
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
                          isSelected
                            ? "ring-2 ring-[#b38b6d] ring-offset-2 ring-offset-[#F7F3EC]"
                            : "hover:scale-105",
                        )}
                        title={color}
                      >
                        <div
                          className={cn(
                            "h-full w-full rounded-full border border-black/10 shadow-inner",
                            isWhite && "border-[#e0d9ce]",
                          )}
                          style={{
                            ...(swatchStyle.backgroundColor ? { backgroundColor: swatchStyle.backgroundColor } : null),
                            ...(swatchStyle.backgroundImage
                              ? { backgroundImage: swatchStyle.backgroundImage }
                              : null),
                          }}
                        />
                        {isSelected && (
                          <div
                            className={cn(
                              "absolute inset-0 flex items-center justify-center",
                              isWhite ? "text-black" : "text-white",
                            )}
                          >
                            <IconCheck className="h-3.5 w-3.5 drop-shadow-sm" />
                          </div>
                        )}
                        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-[#e8e2d8] bg-[#FDFBF7] px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          {color}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tailles */}
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
                      className={cn(
                        "min-h-12 min-w-[3rem] rounded-[5px] border px-4 text-sm font-semibold transition-all duration-300",
                        selectedSize === size ? pillActive : pillIdle,
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantité */}
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
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-[0.14em]",
                      product.inStock ? "text-emerald-700" : "text-red-600",
                    )}
                  >
                    {product.inStock ? "En stock" : "Rupture de stock"}
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                    onClick={handleWishlist}
                    className={cn(
                      "h-14 w-14 shrink-0 rounded-full border-2 transition-all hover:scale-105",
                      inWishlist
                        ? "border-[#D4AF37] bg-[#FDFBF7] text-[#b8860b] shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                        : "border-[#e0d9ce] bg-white/90 hover:border-[#b38b6d]/50",
                    )}
                    title="Ajouter aux favoris"
                  >
                    <Heart className={cn("h-6 w-6", inWishlist && "fill-current")} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={handleWhatsAppOrder}
                    disabled={!product.inStock}
                    className="h-14 min-w-[min(100%,14rem)] flex-1 gap-3 rounded-full border-2 border-[#25D366]/40 bg-[#25D366]/[0.08] text-[15px] font-semibold text-[#128C7E] shadow-[0_8px_28px_rgba(37,211,102,0.18)] transition-all hover:scale-[1.01] hover:border-[#25D366]/70 hover:bg-[#25D366]/15 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 shrink-0 text-[#25D366]"
                      aria-hidden
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Commander sur WhatsApp
                  </Button>
                  <div className="group/share relative">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 w-14 shrink-0 rounded-full border-2 border-[#e0d9ce] bg-white/90 transition-all hover:scale-105 hover:border-[#b38b6d]/45"
                      title="Partager"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 flex flex-col gap-2 rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/98 p-2 opacity-0 shadow-[0_14px_44px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 group-hover/share:pointer-events-auto group-hover/share:opacity-100">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalProductUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 transition-colors hover:bg-[#b38b6d]/10"
                      >
                        <Facebook className="h-4 w-4 text-[#4a4036]" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalProductUrl)}&text=${encodeURIComponent(`Découvrez ${product.name} sur Mboulane Shop`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 transition-colors hover:bg-[#b38b6d]/10"
                      >
                        <Twitter className="h-4 w-4 text-[#4a4036]" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(canonicalProductUrl)
                          toast.success("Lien copié !")
                        }}
                        className="rounded-lg p-2 transition-colors hover:bg-[#b38b6d]/10"
                      >
                        <Link2 className="h-4 w-4 text-[#4a4036]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Réassurance */}
              <div className="space-y-4 rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/95 p-6 shadow-[0_10px_36px_rgba(0,0,0,0.05)] backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                    style={{ background: `${BRONZE}14` }}
                  >
                    <Truck className="h-5 w-5" style={{ color: BRONZE }} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a4036]">
                      Livraison express
                    </h4>
                    <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                      Sous 24–48 h à Dakar, gratuite dès 50 000 FCFA
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e2d8]"
                    style={{ background: `${BRONZE}14` }}
                  >
                    <Shield className="h-5 w-5" style={{ color: BRONZE }} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a4036]">
                      Paiement sécurisé
                    </h4>
                    <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">
                      Mobile money (Wave, Orange Money) ; carte bancaire sur demande selon disponibilité.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-[#e5dfd4]/90 py-16 md:py-24">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <LuxuryScriptHeading title="Vous aimerez aussi" />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="luxury" />
              ))}
            </div>
          </div>
        </section>
      )}

      {recentlyViewedProducts.length > 0 && (
        <section className="border-t border-[#e5dfd4]/90 bg-white/75 py-16 backdrop-blur-[2px] md:py-20">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <LuxuryScriptHeading title="Récemment vus" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="luxury" />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
