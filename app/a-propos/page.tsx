import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LuxuryMain, LuxuryHero, LuxuryPanel, LuxurySectionBleed } from "@/components/layout/luxury-page"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Users, Leaf, Award, Sparkles, type LucideIcon } from "lucide-react"
import type { Metadata } from "next"
import { type AboutValueIcon, getAboutPageContent } from "@/lib/site/about-page"

const BRONZE = "#b38b6d"

const VALUE_ICONS: Record<AboutValueIcon, LucideIcon> = {
  heart: Heart,
  users: Users,
  leaf: Leaf,
  award: Award,
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutPageContent()
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  }
}

export default async function AboutPage() {
  const content = await getAboutPageContent()

  return (
    <LuxuryMain>
      <Header />

      <LuxuryHero
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "À propos" }]}
        scriptTitle={content.hero.scriptTitle}
        subtitle={content.hero.subtitle}
        eyebrow={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e0d9ce] bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5d4f] shadow-sm">
            <span className="text-base" aria-hidden>
              {content.hero.eyebrowEmoji || "🇸🇳"}
            </span>
            <span style={{ color: BRONZE }}>{content.hero.eyebrowLabel}</span>
          </span>
        }
      />

      <section id="histoire" className="py-14 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-[#d8ccb8] shadow-[0_14px_44px_rgba(0,0,0,0.06)]">
              <Image
                src={content.story.imageSrc || "/collection-artisan.jpg"}
                alt="Artisanat MBOULANE"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight text-[#3d3429] md:text-4xl">
                {content.story.heading}
              </h2>
              <div className="space-y-4 font-light leading-relaxed text-[#6b5d4f]">
                {content.story.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Button className="mt-8 gap-2 rounded-full shadow-[0_12px_36px_rgba(179,139,109,0.28)]" asChild>
                <Link href={content.story.ctaHref}>
                  {content.story.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LuxurySectionBleed variant="cream">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7d70]">
            <Sparkles className="h-3.5 w-3.5" style={{ color: BRONZE }} aria-hidden />
            {content.values.eyebrow}
          </span>
          <h2 className="mx-auto mb-4 max-w-2xl font-serif text-3xl font-semibold text-[#3d3429] md:text-4xl">
            {content.values.heading}
          </h2>
          <div className="mx-auto mb-8 h-px max-w-[10rem] bg-gradient-to-r from-transparent via-[#b38b6d]/70 to-transparent" />
          <p className="mx-auto max-w-2xl font-light text-[#6b5d4f]">{content.values.intro}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.values.items.map((value, idx) => {
            const IconComp = VALUE_ICONS[value.icon] ?? Heart
            return (
              <LuxuryPanel key={`about-value-${idx}`} className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#e8e2d8]"
                  style={{ background: `${BRONZE}14` }}
                >
                  <IconComp className="h-7 w-7" style={{ color: BRONZE }} />
                </div>
                <h3 className="mb-2 font-semibold text-[#3d3429]">{value.title}</h3>
                <p className="text-sm font-light leading-relaxed text-[#6b5d4f]">{value.description}</p>
              </LuxuryPanel>
            )
          })}
        </div>
      </LuxurySectionBleed>

      <section id="artisanat" className="border-t border-[#e5dfd4]/90 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-semibold text-[#3d3429] md:text-4xl">
              {content.timeline.heading}
            </h2>
            <p className="mx-auto max-w-2xl font-light text-[#6b5d4f]">{content.timeline.intro}</p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <div className="absolute bottom-0 left-8 top-0 w-[2px] bg-gradient-to-b from-transparent via-[#d8ccb8]/90 to-transparent md:left-1/2 md:-translate-x-px" />

              <div className="space-y-16">
                {content.timeline.items.map((item, index) => (
                  <div
                    key={`about-tl-${index}`}
                    className={`relative flex items-center gap-8 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                  >
                    <div className="absolute left-8 flex h-5 w-5 -translate-x-1/2 items-center justify-center md:left-1/2">
                      <div className="absolute inset-0 scale-150 animate-ping rounded-full bg-[#b38b6d]/20" />
                      <div className="relative h-4 w-4 rounded-full border-4 border-[#F7F3EC] bg-[#b38b6d]" />
                    </div>

                    <div className={`flex-1 pl-16 md:pl-0 ${index % 2 === 1 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                      <LuxuryPanel className="group transition-all duration-500 hover:border-[#b38b6d]/45 hover:shadow-[0_16px_48px_rgba(179,139,109,0.12)]">
                        <span className="mb-4 inline-block rounded-full border border-[#e0d9ce] bg-[#FDFBF7] px-4 py-1 text-sm font-bold text-[#b38b6d] shadow-sm transition-transform group-hover:scale-105">
                          {item.year}
                        </span>
                        <h3 className="mb-3 font-serif text-xl font-semibold text-[#3d3429] md:text-2xl">{item.title}</h3>
                        <p className="font-light leading-relaxed text-[#6b5d4f]">{item.description}</p>
                      </LuxuryPanel>
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5dfd4]/90 bg-gradient-to-br from-[#2c2621] via-[#241f1b] to-[#1a1614] py-16 text-[#F7F3EC] md:py-24">
        <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-serif text-3xl font-semibold md:text-4xl">{content.closing.heading}</h2>
          <p className="mx-auto mb-10 max-w-2xl font-light leading-relaxed text-[#e8e0d8]/85">{content.closing.body}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="rounded-full bg-[#F7F3EC] font-semibold text-[#3d3429] hover:bg-white" asChild>
              <Link href={content.closing.primaryHref}>{content.closing.primaryLabel}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[#b38b6d]/50 bg-transparent font-semibold text-[#F7F3EC] hover:bg-white/10"
              asChild
            >
              <Link href={content.closing.secondaryHref}>{content.closing.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </LuxuryMain>
  )
}
