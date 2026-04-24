import Link from "next/link"
import { Fragment } from "react"
import { ChevronRight } from "lucide-react"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { cn } from "@/lib/utils"

/** Fond crème pointillé — aligné boutique / fiche produit */
export const LUXURY_SURFACE = {
  backgroundColor: "#F7F3EC",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
} as const

export type LuxuryBreadcrumbItem = { label: string; href?: string }

export function LuxuryMain({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn("min-h-screen overflow-x-hidden", className)}
      style={LUXURY_SURFACE}
    >
      {children}
    </main>
  )
}

interface LuxuryHeroProps {
  breadcrumbs?: LuxuryBreadcrumbItem[]
  scriptTitle: string
  subtitle?: string
  eyebrow?: React.ReactNode
  /** Si false, le titre script n’est pas utilisé (ex. page avec titre alternatif plus bas) */
  showScriptHeading?: boolean
  className?: string
}

export function LuxuryHero({
  breadcrumbs,
  scriptTitle,
  subtitle,
  eyebrow,
  showScriptHeading = true,
  className,
}: LuxuryHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-[#e5dfd4]/90 pt-20 pb-10 md:pt-24 md:pb-14",
        className,
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7d70]">
            {breadcrumbs.map((item, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <Fragment key={`${item.label}-${i}`}>
                  {i > 0 ? (
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                  ) : null}
                  {!isLast && item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-[#b38b6d]">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="max-w-[min(100%,32rem)] truncate font-semibold text-[#4a4036]">
                      {item.label}
                    </span>
                  )}
                </Fragment>
              )
            })}
          </nav>
        ) : null}

        {eyebrow ? <div className="mb-6 flex justify-center">{eyebrow}</div> : null}

        {showScriptHeading ? <LuxuryScriptHeading title={scriptTitle} /> : null}

        {subtitle ? (
          <p className="mx-auto max-w-2xl text-center text-sm font-light leading-relaxed text-[#6b5d4f] md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  )
}

/** Carte type « filtre boutique » pour contenus texte / formulaires */
export function LuxuryPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[5px] border border-[#d8ccb8] bg-[#FDFBF7]/98 p-6 shadow-[0_14px_44px_rgba(0,0,0,0.06)] backdrop-blur-sm md:p-8",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Bandeau section interne (alternance fond) */
export function LuxurySectionBleed({
  children,
  variant = "surface",
  className,
}: {
  children: React.ReactNode
  variant?: "surface" | "cream"
  className?: string
}) {
  return (
    <section
      className={cn(
        "border-t border-[#e5dfd4]/90 py-14 md:py-20",
        variant === "cream" && "bg-white/75 backdrop-blur-[2px]",
        className,
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
