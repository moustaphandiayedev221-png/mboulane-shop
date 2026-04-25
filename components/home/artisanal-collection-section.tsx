"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Hand, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/products/product-card"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { products as staticProducts } from "@/lib/data/products"
import type { Product } from "@/lib/store"
import type { ArtisanalHomeContent } from "@/lib/site/home-sections"
import { cn } from "@/lib/utils"

const SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

export function ArtisanalCollectionSection({
  products = staticProducts,
  content,
}: {
  products?: Product[]
  content: ArtisanalHomeContent
}) {
  const explicit = products.filter((p) => p.homeSection === "collection_artisanale")
  const fallback = [
    ...products.filter(
      (p) => p.category === "Artisanal & Unique" || p.badge === "Édition Limitée",
    ),
    ...products.filter(
      (p) => p.category !== "Artisanal & Unique" && p.badge !== "Édition Limitée",
    ),
  ]
  const artisanalProducts = [...explicit, ...fallback.filter((p) => !explicit.some((e) => e.id === p.id))].slice(0, 4)

  const bullets = content.bullets

  return (
    <section className="overflow-hidden py-14 md:py-24" style={SURFACE}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title={content.heading} />

        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:mb-14 md:text-base">
          {content.intro}
        </p>

        <div className="mb-16 grid items-center gap-12 md:mb-20 lg:grid-cols-2 lg:gap-16">
          {/* Visuel */}
          <div className="relative animate-fade-in">
            <div
              className={cn(
                "relative aspect-[4/5] overflow-hidden rounded-[5px] border border-black/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out",
                "hover:border-[#b38b6d]/25 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)]",
              )}
            >
              <Image
                src={content.imageUrl}
                alt="Artisan sénégalais travaillant le cuir"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>

            <div
              className={cn(
                "absolute -bottom-6 left-4 z-10 w-max max-w-[min(100%,calc(100%-2rem))] animate-slide-up",
                "rounded-[5px] border border-[#b38b6d]/35 bg-white/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:p-5",
                "md:bottom-8 md:left-auto md:right-8 md:max-w-none md:p-6",
              )}
              style={{ animationDelay: "200ms" }}
            >
              <div className="mb-2.5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b38b6d]/12 md:h-11 md:w-11">
                  <Hand className="h-5 w-5 text-[#b38b6d]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{content.floatCardTitle}</p>
                  <p className="text-xs text-muted-foreground">{content.floatCardSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b38b6d]" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Texte */}
          <div className="animate-slide-up space-y-6" style={{ animationDelay: "100ms" }}>
            <div>
              <span className="font-script text-2xl md:text-[1.75rem]" style={{ color: "#b38b6d" }}>
                {content.scriptSub}
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {content.title}
              </h3>
              <div
                className="mt-4 h-px w-14 bg-gradient-to-r from-[#D4AF37] to-transparent"
                aria-hidden
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              <Hand className="h-3.5 w-3.5 text-[#D4AF37]" />
              {content.badge}
            </span>

            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{content.body}</p>

            <ul className="space-y-3">
              {bullets.map((item, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex gap-3 rounded-[5px] border border-black/[0.06] bg-white/70 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 ease-out",
                    "hover:border-[#b38b6d]/30 hover:bg-white hover:shadow-md md:text-[0.95rem]",
                  )}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b38b6d]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="group mt-2 h-12 gap-2 rounded-full border border-[#b38b6d]/40 bg-black px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all duration-300 ease-out hover:border-[#D4AF37] hover:bg-[#1a1a1a] hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)]"
            >
              <Link href="/boutique?filter=artisanal">
                Découvrir la collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {artisanalProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} variant="luxury" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
