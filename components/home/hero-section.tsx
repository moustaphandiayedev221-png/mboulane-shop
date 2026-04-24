"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MousePointer2 } from "lucide-react"
import type { HeroContent } from "@/lib/site/hero"

export function HeroSection({ hero }: { hero: HeroContent }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const title = hero.title
  const subtitle = hero.subtitle
  const ctaLabel = hero.ctaLabel
  const ctaHref = hero.ctaHref
  const bg = hero.backgroundImage ?? "/hero-mboulane.png"

  return (
    <section className="relative flex h-[550px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bg}
          alt="Sandales en cuir crème, lanière T à motifs géométriques, lumière dorée sur parquet — MBOULANE"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-4xl px-4 text-center">
        <div className="mb-6 inline-block">
          <span className="border border-white/30 bg-black/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.3em] text-white backdrop-blur-md">
            Nouvelle Collection
          </span>
        </div>

        <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
          {title.split("\n").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < title.split("\n").length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/85 md:text-base">
          {subtitle}
        </p>

        <div className="mt-10 flex justify-center md:mt-14">
          <Button
            size="lg"
            className="h-14 rounded-none bg-black px-12 text-[13px] font-medium uppercase tracking-[0.15em] text-white transition-colors duration-500 hover:bg-[#8B5E3C] hover:text-white"
            asChild
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce md:flex md:flex-col md:items-center md:gap-2">
        <div className="h-12 w-px bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
        <MousePointer2 className="h-4 w-4 text-white/70" />
      </div>
    </section>
  )
}
