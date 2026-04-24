"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel } from "@/components/layout/luxury-page"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Heart, Sparkles } from "lucide-react"

const BRONZE = "#b38b6d"

export default function WishlistPage() {
  const { wishlist } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Liste de souhaits" }]}
        scriptTitle="Liste de souhaits"
        subtitle={
          wishlist.length > 0
            ? `${wishlist.length} article${wishlist.length > 1 ? "s" : ""} sauvegardé${wishlist.length > 1 ? "s" : ""} — retrouvez-les quand vous le souhaitez.`
            : "Vos coups de cœur MBOULANE, réunis au même endroit."
        }
        eyebrow={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e0d9ce] bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5d4f] shadow-sm">
            <Sparkles className="h-3 w-3" style={{ color: BRONZE }} aria-hidden />
            Favoris
          </span>
        }
      />

      <section className="pb-16 pt-4 md:pb-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {wishlist.map((item) => (
                <ProductCard key={item.product.id} product={item.product} variant="luxury" />
              ))}
            </div>
          ) : (
            <LuxuryPanel className="mx-auto max-w-lg py-16 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-[#d8ccb8]" strokeWidth={1.25} />
              <p className="mb-8 font-light text-[#6b5d4f]">
                Vous n&apos;avez pas encore ajouté de produits à votre liste de souhaits.
              </p>
              <Button className="rounded-full shadow-[0_12px_36px_rgba(179,139,109,0.28)]" asChild>
                <Link href="/boutique">Découvrir la boutique</Link>
              </Button>
            </LuxuryPanel>
          )}
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
