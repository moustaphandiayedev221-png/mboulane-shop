"use client"

import { useEffect, useMemo, useState } from "react"
import { Star, ChevronLeft, ChevronRight, Quote, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { reviews as staticReviews } from "@/lib/data/products"
import { cn } from "@/lib/utils"

const SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

const BRONZE = "#b38b6d"
const GOLD = "#D4AF37"

export function ReviewsSection({
  items = staticReviews,
}: {
  items?: typeof staticReviews
}) {
  const reviews = items
  const [isMdUp, setIsMdUp] = useState(false)
  const [mobileIndex, setMobileIndex] = useState(0)
  const [desktopStart, setDesktopStart] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const apply = () => setIsMdUp(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const desktopPages = useMemo(() => Math.max(1, reviews.length), [reviews])

  const visibleDesktop = useMemo(() => {
    return Array.from({ length: 3 }).map((_, i) => reviews[(desktopStart + i) % reviews.length])
  }, [desktopStart, reviews])

  const next = () => {
    if (isMdUp) {
      setDesktopStart((prev) => (prev + 1) % desktopPages)
      return
    }
    setMobileIndex((prev) => (prev + 1) % reviews.length)
  }

  const prev = () => {
    if (isMdUp) {
      setDesktopStart((prev) => (prev - 1 + desktopPages) % desktopPages)
      return
    }
    setMobileIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const initials = (fullName: string) => {
    const parts = fullName.replace(/\./g, "").trim().split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] ?? "M"
    const b = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (a + b).toUpperCase()
  }

  const ReviewCard = ({
    review,
    emphasis = false,
  }: {
    review: (typeof reviews)[number]
    emphasis?: boolean
  }) => {
    return (
      <div
        className={cn(
          "relative h-full rounded-2xl border bg-white/90 p-6 text-left shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 ease-out md:p-8",
          emphasis
            ? "border-[color:var(--b)] shadow-[0_16px_48px_rgba(179,139,109,0.15)] ring-1 ring-[color:var(--b)]/25 md:-translate-y-1"
            : "border-black/[0.06] hover:-translate-y-1 hover:border-[color:var(--b)]/25 hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)]",
        )}
        style={{ ["--b" as string]: BRONZE }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(700px_circle_at_15%_0%,rgba(179,139,109,0.06),transparent_55%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold tracking-widest"
              style={{
                borderColor: `${BRONZE}33`,
                backgroundColor: `${BRONZE}14`,
                color: BRONZE,
              }}
            >
              {initials(review.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold leading-tight">{review.name}</p>
                {review.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#b38b6d]" aria-label="Avis vérifié" />
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {review.location} · {review.date}
              </p>
            </div>
          </div>

          <Quote className="h-7 w-7 shrink-0 opacity-[0.35]" style={{ color: BRONZE }} />
        </div>

        <div className="relative mt-5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-muted/35",
              )}
            />
          ))}
          <span className="ml-2 tabular-nums text-xs font-semibold text-muted-foreground">
            {review.rating.toFixed(1)}/5
          </span>
        </div>

        <p className="relative mt-5 font-serif text-[15px] leading-relaxed text-foreground/90 md:text-base">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>
    )
  }

  return (
    <section className="overflow-hidden py-14 md:py-24" style={SURFACE}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title="Avis Clients" />

        <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground md:mb-14 md:text-lg">
          Ce que nos clients disent de leurs sandales MBOULANE
        </p>

        <div className="relative">
          <div className="md:hidden">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-1">
                    <ReviewCard review={review} emphasis />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden gap-7 md:grid md:grid-cols-3 lg:gap-9">
            {visibleDesktop.map((review, idx) => (
              <ReviewCard key={`${review.id}-${idx}`} review={review} emphasis={idx === 1} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-5 md:mt-12">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-[#b38b6d]/35 bg-white/80 shadow-sm transition-all duration-300 ease-out hover:border-[#b38b6d] hover:bg-[#b38b6d]/10 hover:text-[#5c4030]"
              onClick={prev}
              aria-label="Avis précédents"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2.5">
              {(isMdUp ? Array.from({ length: desktopPages }) : reviews).map((_, index) => {
                const active = isMdUp ? index === desktopStart : index === mobileIndex
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => (isMdUp ? setDesktopStart(index) : setMobileIndex(index))}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300 ease-out",
                      active ? "w-9 bg-[#b38b6d]" : "w-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/45",
                    )}
                    aria-label={
                      isMdUp
                        ? `Afficher le groupe d'avis ${index + 1}`
                        : `Aller à l'avis ${index + 1}`
                    }
                  />
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-[#b38b6d]/35 bg-white/80 shadow-sm transition-all duration-300 ease-out hover:border-[#b38b6d] hover:bg-[#b38b6d]/10 hover:text-[#5c4030]"
              onClick={next}
              aria-label="Avis suivants"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-12 border-t border-black/[0.06] pt-14 md:mt-20 md:gap-20 md:pt-16">
          {[
            { value: 4.8, suffix: "/5", label: "Note moyenne" },
            { value: 500, suffix: "+", label: "Avis vérifiés" },
            { value: 98, suffix: "%", label: "Clients satisfaits" },
          ].map((stat) => (
            <div key={stat.label} className="group text-center">
              <p
                className="font-serif text-3xl font-bold tracking-tight transition-transform duration-300 ease-out group-hover:scale-[1.03] md:text-4xl"
                style={{ color: GOLD }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
