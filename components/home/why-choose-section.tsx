import Image from "next/image"
import { Sparkles, Truck, Shield, Heart, type LucideIcon } from "lucide-react"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import type { WhyChooseFeature, WhyChooseHomeContent } from "@/lib/site/home-sections"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<WhyChooseFeature["icon"], LucideIcon> = {
  sparkles: Sparkles,
  shield: Shield,
  truck: Truck,
  heart: Heart,
}

export function WhyChooseSection({ content }: { content: WhyChooseHomeContent }) {
  const features = content.features.map((f) => ({
    ...f,
    Icon: ICON_MAP[f.icon],
  }))

  return (
    <section
      className="relative overflow-x-hidden py-16 text-white md:py-24"
      style={{
        background:
          "radial-gradient(ellipse 100% 80% at 15% 50%, #1f1f1f 0%, #0c0c0c 45%, #030303 100%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title={content.heading} />

        <p className="mx-auto mb-14 max-w-2xl text-center text-sm font-light leading-relaxed text-white/55 md:mb-16 md:text-base">
          {content.intro}
        </p>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visuel atelier */}
          <div className="order-2 lg:order-1">
            <div
              className={cn(
                "group/img relative aspect-square overflow-hidden rounded-[5px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out",
                "lg:aspect-[4/5]",
                "hover:border-[#D4AF37]/25 hover:shadow-[0_24px_70px_rgba(212,175,55,0.12)]",
              )}
            >
              <Image
                src={content.imageUrl}
                alt="Artisan sénégalais travaillant le cuir"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover/img:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                <div
                  className={cn(
                    "rounded-[5px] border border-white/15 bg-white/[0.08] p-4 shadow-xl backdrop-blur-xl md:p-5",
                    "transition-all duration-300 ease-out group-hover/img:border-[#D4AF37]/30",
                  )}
                >
                  <p
                    className="font-serif text-base font-semibold leading-snug text-white md:text-lg"
                    style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
                  >
                    &ldquo;{content.quote}&rdquo;
                  </p>
                  <p
                    className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50 md:text-sm"
                  >
                    {content.quoteAttribution}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arguments */}
          <div className="order-1 space-y-8 lg:order-2 lg:space-y-9">
            <div>
              <p className="font-script text-2xl md:text-[1.65rem]" style={{ color: "#b38b6d" }}>
                {content.scriptSub}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {content.columnTitle}
              </h3>
              <div
                className="mt-4 h-px w-16 bg-gradient-to-r from-[#D4AF37] to-transparent"
                aria-hidden
              />
            </div>

            <div className="grid gap-6 md:gap-7">
              {features.map((feature) => {
                const Icon = feature.Icon
                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "group/feat flex gap-4 rounded-[5px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-all duration-300 ease-out md:gap-5 md:p-5",
                      "hover:border-[#D4AF37]/35 hover:bg-white/[0.07] hover:shadow-[0_0_32px_rgba(212,175,55,0.08)]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[5px] border border-white/10 bg-black/40 transition-all duration-300 ease-out md:h-14 md:w-14",
                        "group-hover/feat:border-[#D4AF37]/45 group-hover/feat:bg-black/60",
                      )}
                    >
                      <Icon
                        className="h-5 w-5 text-white/90 transition-colors duration-300 group-hover/feat:text-[#D4AF37] md:h-6 md:w-6"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-1.5 font-serif text-[1.05rem] font-semibold text-white md:text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/60 md:text-[0.95rem]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
