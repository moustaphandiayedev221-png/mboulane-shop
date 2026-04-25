"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/products/product-card"
import { LuxuryProductGridSection } from "@/components/home/luxury-product-grid-section"
import { products as staticProducts } from "@/lib/data/products"
import type { Product } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function BestSellersSection({
  products = staticProducts,
}: {
  products?: Product[]
}) {
  const explicit = products.filter((p) => p.homeSection === "best_sellers")
  const fallback = products.filter((p) => p.badge === "Best Seller" || p.rating >= 4.8)
  const bestSellers = [...explicit, ...fallback.filter((p) => !explicit.some((e) => e.id === p.id))].slice(0, 8)

  return (
    <LuxuryProductGridSection
      title="Best Sellers"
      footer={
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-full border-[#d8ccb8] bg-white px-8 text-sm font-medium text-foreground shadow-sm hover:border-[#C0A080]/60 hover:bg-[#FDFBF7]"
          asChild
        >
          <Link href="/boutique">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
        {bestSellers.map((product, index) => (
          <div
            key={product.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ProductCard product={product} variant="luxury" />
          </div>
        ))}
      </div>
    </LuxuryProductGridSection>
  )
}
