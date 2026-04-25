"use client"

import { useEffect, useMemo, useState } from "react"
import type { Product } from "@/lib/data/products"
import { createClient } from "@/lib/supabase/client"
import { BestSellersSection } from "@/components/home/bestsellers-section"
import { PremiumCollectionSection } from "@/components/home/premium-collection-section"
import { NewArrivalsSection } from "@/components/home/new-arrivals-section"
import { ArtisanalCollectionSection } from "@/components/home/artisanal-collection-section"
import type { ArtisanalHomeContent } from "@/lib/site/home-sections"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

type Props = {
  initialProducts: Product[]
  artisanalContent: ArtisanalHomeContent
}

async function fetchCatalog(): Promise<Product[]> {
  const r = await fetch("/api/catalog", { cache: "no-store" })
  if (!r.ok) throw new Error("catalog_fetch_failed")
  const data = (await r.json()) as unknown
  return Array.isArray(data) ? (data as Product[]) : []
}

export function HomeProductsLive({ initialProducts, artisanalContent }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [tick, setTick] = useState(0)

  // Évite de recréer les arrays si on refetch souvent.
  const stableProducts = useMemo(() => products, [products, tick])

  useEffect(() => {
    let cancelled = false
    void fetchCatalog()
      .then((next) => {
        if (cancelled) return
        if (next.length) {
          setProducts(next)
          setTick((t) => t + 1)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("mb:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          try {
            const next = await fetchCatalog()
            if (next.length) {
              setProducts(next)
              setTick((t) => t + 1)
            }
          } catch {
            // ignore
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  return (
    <>
      <ScrollReveal animation="slide-up" delay={100} threshold={0.1}>
        <BestSellersSection products={stableProducts} />
      </ScrollReveal>

      <ScrollReveal animation="slide-up" threshold={0.15}>
        <PremiumCollectionSection products={stableProducts} />
      </ScrollReveal>

      <ScrollReveal animation="blur-in" threshold={0.1}>
        <NewArrivalsSection products={stableProducts} />
      </ScrollReveal>

      <ScrollReveal animation="blur-in" threshold={0.15}>
        <ArtisanalCollectionSection products={stableProducts} content={artisanalContent} />
      </ScrollReveal>
    </>
  )
}

