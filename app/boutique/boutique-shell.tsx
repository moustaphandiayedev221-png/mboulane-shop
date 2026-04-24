"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { formatPrice, type Product } from "@/lib/store"
import {
  ChevronDown,
  ChevronUp,
  Grip,
  List,
  ChevronRight,
  SearchX,
  RotateCcw,
  Sparkles,
  Tag,
  Gem,
  Hammer,
  Percent,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sortOptions = [
  { label: "Populaire", value: "popular" },
  { label: "Nouveautés", value: "newest" },
  { label: "Prix croissant", value: "price-asc" },
  { label: "Prix décroissant", value: "price-desc" },
]

const availableSizes = [37, 38, 39, 40, 41, 42, 43, 44, 45]

const SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

const GOLD = "#D4AF37"
const BRONZE = "#b38b6d"

function ShopContent({
  products,
  categories,
}: {
  products: Product[]
  categories: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuickFilter = searchParams.get("filter")
  const initialPopular = searchParams.get("popular")

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialQuickFilter === "artisanal") return "Tous"
    return searchParams.get("category") || "Tous"
  })
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get("price")) || 90000)
  const [selectedSizes, setSelectedSizes] = useState<number[]>(
    searchParams.get("sizes") ? searchParams.get("sizes")?.split(",").map(Number) || [] : [],
  )

  const [popularFilter, setPopularFilter] = useState<string | null>(() => {
    if (initialQuickFilter === "bestseller") return "Best Seller"
    if (initialQuickFilter === "nouveau") return "New Arrival"
    if (initialQuickFilter === "limited") return "Limited Edition"
    return initialPopular
  })

  const [sortBy, setSortBy] = useState(() => {
    if (initialQuickFilter === "nouveau") return "newest"
    return searchParams.get("sort") || "popular"
  })
  const [isLuxeOnly, setIsLuxeOnly] = useState<boolean>(initialQuickFilter === "premium")
  const [isPromoOnly, setIsPromoOnly] = useState<boolean>(initialQuickFilter === "promo")
  const [isArtisanalOnly, setIsArtisanalOnly] = useState<boolean>(initialQuickFilter === "artisanal")

  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory !== "Tous") params.set("category", selectedCategory)
    if (maxPrice !== 90000) params.set("price", maxPrice.toString())
    if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","))

    const quickFilter =
      isLuxeOnly
        ? "premium"
        : isPromoOnly
          ? "promo"
          : isArtisanalOnly
            ? "artisanal"
            : popularFilter === "Best Seller"
              ? "bestseller"
              : popularFilter === "New Arrival"
                ? "nouveau"
                : popularFilter === "Limited Edition"
                  ? "limited"
                  : null

    if (quickFilter) {
      params.set("filter", quickFilter)
    } else if (popularFilter) {
      params.set("popular", popularFilter)
    }

    if (sortBy !== "popular") params.set("sort", sortBy)

    const query = params.toString()
    const url = `/boutique${query ? `?${query}` : ""}`
    router.replace(url, { scroll: false })
    setVisibleCount(6)
  }, [
    selectedCategory,
    maxPrice,
    selectedSizes,
    popularFilter,
    sortBy,
    isLuxeOnly,
    isPromoOnly,
    isArtisanalOnly,
    router,
  ])

  const [showSort, setShowSort] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [categoryOpen, setCategoryOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [sizeOpen, setSizeOpen] = useState(true)
  const [popularOpen, setPopularOpen] = useState(true)

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    if (!mobileFiltersOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileFiltersOpen])

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (selectedCategory !== "Tous") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (isLuxeOnly) {
      filtered = filtered.filter(
        (p) => p.category === "Premium" || p.price >= 48000,
      )
    }

    if (isPromoOnly) {
      filtered = filtered.filter((p) => p.badge === "Promo" || typeof p.originalPrice === "number")
    }

    if (isArtisanalOnly) {
      filtered = filtered.filter(
        (p) => p.category === "Artisanal & Unique" || p.badge === "Édition Limitée",
      )
    }

    filtered = filtered.filter((p) => p.price <= maxPrice)

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((size) => selectedSizes.includes(Number(size))),
      )
    }

    if (popularFilter === "Best Seller") {
      filtered = filtered.filter((p) => p.rating >= 4.8)
    } else if (popularFilter === "Limited Edition") {
      filtered = filtered.filter((p) => p.badge === "Édition Limitée")
    } else if (popularFilter === "New Arrival") {
      filtered = filtered.filter((p) => p.badge === "Nouveau")
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, _b) => (a.badge === "Nouveau" ? -1 : 1))
        break
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      default:
        filtered.sort((a, b) => b.reviews - a.reviews)
    }

    return filtered
  }, [
    products,
    selectedCategory,
    maxPrice,
    selectedSizes,
    popularFilter,
    sortBy,
    isLuxeOnly,
    isPromoOnly,
    isArtisanalOnly,
  ])

  const pillActive =
    "border-[#b38b6d] bg-[#FDFBF7] text-[#4a4036] shadow-[0_2px_12px_rgba(179,139,109,0.15)] ring-1 ring-[#b38b6d]/35"
  const pillIdle =
    "border-[#e0d9ce] bg-white/90 text-[#6b5d4f] hover:border-[#C0A080]/55 hover:bg-white"

  const resetFilters = () => {
    setSelectedCategory("Tous")
    setMaxPrice(90000)
    setSelectedSizes([])
    setPopularFilter(null)
    setIsLuxeOnly(false)
    setIsPromoOnly(false)
    setIsArtisanalOnly(false)
  }

  const FiltersCard = ({ variant }: { variant: "desktop" | "mobile" }) => (
    <div
      className={cn(
        "rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/98 shadow-[0_14px_44px_rgba(0,0,0,0.06)] backdrop-blur-sm",
        variant === "desktop" ? "p-6 md:p-7" : "p-6",
      )}
    >
      <div className="mb-6 flex items-center gap-2 border-b border-[#ebe5dc] pb-4">
        <Sparkles className="h-4 w-4 text-[#b38b6d]" aria-hidden />
        <h2 className="font-serif text-lg font-semibold tracking-tight text-[#3d3429]">Filtrer</h2>
        {variant === "mobile" ? (
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e2d8] bg-white/90 text-[#4a4036] transition-colors hover:bg-[#F7F3EC]"
            aria-label="Fermer les filtres"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-left font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          Catégorie
          {categoryOpen ? (
            <ChevronUp className="h-4 w-4 text-[#b38b6d]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#b38b6d]" />
          )}
        </button>
        {categoryOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("Tous")}
              className={cn(
                "rounded-[5px] border px-3 py-2 text-[12px] font-medium transition-all duration-300",
                selectedCategory === "Tous" ? pillActive : pillIdle,
              )}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-[5px] border px-3 py-2 text-[12px] font-medium transition-all duration-300",
                  selectedCategory === cat ? pillActive : pillIdle,
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

      <div className="mb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-left font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]"
          onClick={() => setPriceOpen(!priceOpen)}
        >
          Prix max.
          {priceOpen ? (
            <ChevronUp className="h-4 w-4 text-[#b38b6d]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#b38b6d]" />
          )}
        </button>
        {priceOpen && (
          <div className="mt-4">
            <input
              type="range"
              min={10000}
              max={150000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#ebe6dc] accent-[#b38b6d]"
            />
            <div className="mt-3 flex justify-between font-sans text-[11px] font-medium text-[#8a7d70]">
              <span>10 000 FCFA</span>
              <span className="font-semibold tabular-nums text-[#4a4036]">{formatPrice(maxPrice)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

      <div className="mb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-left font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]"
          onClick={() => setSizeOpen(!sizeOpen)}
        >
          Pointure
          {sizeOpen ? (
            <ChevronUp className="h-4 w-4 text-[#b38b6d]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#b38b6d]" />
          )}
        </button>
        {sizeOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  "min-w-[2.5rem] rounded-[5px] border px-2.5 py-1.5 text-center text-[11px] font-semibold transition-all duration-300",
                  selectedSizes.includes(size) ? pillActive : pillIdle,
                )}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#d8ccb8]/80 to-transparent" />

      <div className="mb-2">
        <button
          type="button"
          className="flex w-full items-center justify-between py-1 text-left font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b5d4f]"
          onClick={() => setPopularOpen(!popularOpen)}
        >
          Tendances
          {popularOpen ? (
            <ChevronUp className="h-4 w-4 text-[#b38b6d]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#b38b6d]" />
          )}
        </button>
        {popularOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { key: "Best Seller", fr: "Best-seller" },
              { key: "Limited Edition", fr: "Édition limitée" },
              { key: "New Arrival", fr: "Nouveautés" },
            ].map(({ key, fr }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const next = popularFilter === key ? null : key
                  setPopularFilter(next)
                  if (next) {
                    setIsLuxeOnly(false)
                    setIsPromoOnly(false)
                    setIsArtisanalOnly(false)
                  }
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-300",
                  popularFilter === key ? pillActive : pillIdle,
                )}
              >
                <Tag className="mr-1.5 inline h-3 w-3 opacity-70" aria-hidden />
                {fr}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-[5px] border border-[#e8e2d8] bg-[#F7F3EC]/80 p-4">
        <p className="mb-3 font-serif text-sm font-semibold text-[#3d3429]">
          –10 % sur votre 1<sup>re</sup> commande
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="email"
            placeholder="Votre email"
            className="h-10 w-full min-w-0 flex-1 rounded-[5px] border border-[#d8ccb8] bg-white/95 px-3 text-sm text-[#2c2419] placeholder:text-[#9a8b7a] outline-none focus:border-[#b38b6d]/55 focus:ring-1 focus:ring-[#b38b6d]/25"
          />
          <button
            type="button"
            className="h-10 shrink-0 whitespace-nowrap rounded-[5px] border border-[#D4AF37]/40 bg-[#2a2520] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#F7F3EC] transition-colors hover:bg-[#b38b6d]"
          >
            S&apos;inscrire
          </button>
        </div>
      </div>

      {variant === "mobile" ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-full border border-[#e0d9ce] bg-white/90 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4a4036] transition-colors hover:bg-[#F7F3EC]"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="h-11 rounded-full bg-[#2a2520] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F7F3EC] shadow-[0_12px_36px_rgba(179,139,109,0.18)] transition-colors hover:bg-[#b38b6d]"
          >
            Voir les modèles
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <main className="min-h-screen overflow-x-hidden" style={SURFACE}>
      <Header />

      {/* Intro */}
      <section className="border-b border-[#e5dfd4]/90 pt-20 pb-10 md:pt-24 md:pb-14">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7d70]">
            <Link href="/" className="transition-colors hover:text-[#b38b6d]">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
            <span className="font-semibold text-[#4a4036]">Boutique</span>
          </nav>

          <LuxuryScriptHeading title="La Boutique" />

          <p className="mx-auto max-w-2xl text-center text-sm font-light leading-relaxed text-[#6b5d4f] md:text-base">
            Parcourez nos sandales et créations artisanales — la même exigence luxe que sur notre accueil,
            avec des filtres pensés pour vous guider vers la paire idéale.
          </p>

          {/* Accès rapides Luxe / Promo / Artisanal */}
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                const next = !isLuxeOnly
                setIsLuxeOnly(next)
                if (next) {
                  setIsPromoOnly(false)
                  setIsArtisanalOnly(false)
                  setPopularFilter(null)
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300",
                isLuxeOnly ? pillActive : pillIdle,
              )}
            >
              <Gem className="h-3.5 w-3.5 opacity-90" style={{ color: isLuxeOnly ? GOLD : BRONZE }} aria-hidden />
              Luxe &amp; Premium
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !isPromoOnly
                setIsPromoOnly(next)
                if (next) {
                  setIsLuxeOnly(false)
                  setIsArtisanalOnly(false)
                  setPopularFilter(null)
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300",
                isPromoOnly ? pillActive : pillIdle,
              )}
            >
              <Percent className="h-3.5 w-3.5 opacity-90" style={{ color: isPromoOnly ? GOLD : BRONZE }} aria-hidden />
              Promotions
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !isArtisanalOnly
                setIsArtisanalOnly(next)
                if (next) {
                  setIsLuxeOnly(false)
                  setIsPromoOnly(false)
                  setPopularFilter(null)
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300",
                isArtisanalOnly ? pillActive : pillIdle,
              )}
            >
              <Hammer className="h-3.5 w-3.5 opacity-90" style={{ color: isArtisanalOnly ? GOLD : BRONZE }} aria-hidden />
              Artisanal
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-12">
            {/* Filtres (desktop) */}
            <div className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-24">
                <FiltersCard variant="desktop" />
              </div>
            </div>

            {/* Drawer filtres (mobile) */}
            {mobileFiltersOpen ? (
              <div className="fixed inset-0 z-[120] lg:hidden">
                <button
                  type="button"
                  className="absolute inset-0 bg-black/35"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Fermer les filtres"
                />
                <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-auto rounded-t-[18px] border border-[#d8ccb8] bg-[#F7F3EC] p-4 shadow-[0_-24px_60px_rgba(0,0,0,0.20)]">
                  <FiltersCard variant="mobile" />
                </div>
              </div>
            ) : null}

            {/* Grille produits */}
            <div className="lg:col-span-3">
              <div className="mb-8 flex flex-col gap-4 border-b border-[#e5dfd4] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-sm text-[#6b5d4f]">
                  <span className="font-semibold tabular-nums text-[#3d3429]">{filteredProducts.length}</span>{" "}
                  modèle{filteredProducts.length > 1 ? "s" : ""}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8ccb8] bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4a4036] shadow-sm transition-all duration-300 hover:border-[#b38b6d]/45 hover:bg-[#FDFBF7] lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-[#b38b6d]" aria-hidden />
                    Filtrer
                  </button>
                  <div className="flex items-center gap-1 rounded-[5px] border border-[#d8ccb8] bg-white/90 p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "rounded-[4px] p-2 transition-all",
                        viewMode === "grid"
                          ? "bg-[#2a2520] text-[#F7F3EC] shadow-sm"
                          : "text-[#8a7d70] hover:text-[#3d3429]",
                      )}
                      aria-label="Affichage grille"
                      aria-pressed={viewMode === "grid"}
                    >
                      <Grip className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "rounded-[4px] p-2 transition-all",
                        viewMode === "list"
                          ? "bg-[#2a2520] text-[#F7F3EC] shadow-sm"
                          : "text-[#8a7d70] hover:text-[#3d3429]",
                      )}
                      aria-label="Affichage liste"
                      aria-pressed={viewMode === "list"}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative flex items-center gap-2">
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a7d70] sm:inline">
                      Trier
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSort(!showSort)}
                      className="flex min-w-[10rem] items-center justify-between gap-2 rounded-[5px] border border-[#d8ccb8] bg-white/95 px-3 py-2 text-left text-[13px] font-medium text-[#3d3429] shadow-sm transition-colors hover:border-[#b38b6d]/45"
                    >
                      {sortOptions.find((opt) => opt.value === sortBy)?.label ?? "Populaire"}
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                    </button>
                    {showSort && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default bg-transparent"
                          aria-label="Fermer"
                          onClick={() => setShowSort(false)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7] py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSortBy(option.value)
                                setShowSort(false)
                              }}
                              className={cn(
                                "w-full px-4 py-2.5 text-left text-[13px] transition-colors",
                                sortBy === option.value
                                  ? "bg-[#b38b6d]/12 font-semibold text-[#5c4030]"
                                  : "text-[#6b5d4f] hover:bg-white",
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isLuxeOnly && (
                <div className="mb-8 flex flex-col gap-3 rounded-[5px] border border-[#D4AF37]/35 bg-gradient-to-r from-[#FDFBF7] to-[#f5efe6] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white/90">
                      <Gem className="h-5 w-5" style={{ color: GOLD }} aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#3d3429]">
                        Collection Luxe activée
                      </h3>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-[#6b5d4f]">
                        Modèles Premium, Élite et sélection prestige uniquement.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLuxeOnly(false)}
                    className="shrink-0 self-start text-[11px] font-bold uppercase tracking-[0.16em] text-[#b38b6d] underline-offset-4 hover:underline sm:self-center"
                  >
                    Tout voir
                  </button>
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <>
                  <div
                    className={cn(
                      "grid gap-6 sm:gap-7",
                      viewMode === "list"
                        ? "grid-cols-1"
                        : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
                    )}
                  >
                    {filteredProducts.slice(0, visibleCount).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="luxury"
                        layout={viewMode === "list" ? "list" : "grid"}
                      />
                    ))}
                  </div>
                  {visibleCount < filteredProducts.length && (
                    <div className="mt-14 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + 6)}
                        className="rounded-full border border-[#D4AF37]/45 bg-[#2a2520] px-10 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F7F3EC] shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-[#b38b6d] hover:text-white"
                      >
                        Charger plus
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[5px] border-2 border-dashed border-[#d8ccb8] bg-[#FDFBF7]/60 px-6 py-20 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#e8e2d8] bg-white shadow-sm">
                    <SearchX className="h-8 w-8 text-[#c4b8a8]" aria-hidden />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#3d3429]">
                    Aucun résultat
                  </h3>
                  <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#6b5d4f]">
                    Ajustez les filtres ou élargissez votre recherche pour découvrir d&apos;autres modèles
                    MBOULANE.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#b38b6d]/45 bg-white px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4a4036] shadow-sm transition-all hover:bg-[#FDFBF7]"
                  >
                    Réinitialiser les filtres
                    <RotateCcw className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export function BoutiqueShell({
  initialProducts,
  categories,
}: {
  initialProducts: Product[]
  categories: string[]
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={SURFACE}>
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d8ccb8] border-t-[#b38b6d]" />
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[#8a7d70]">
              Chargement…
            </p>
          </div>
        </div>
      }
    >
      <ShopContent products={initialProducts} categories={categories} />
    </Suspense>
  )
}
