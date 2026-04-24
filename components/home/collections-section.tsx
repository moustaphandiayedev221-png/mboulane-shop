import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LuxuryScriptHeading } from "@/components/home/luxury-script-heading"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import {
  HOME_COLLECTION_LABELS,
  HOME_COLLECTION_LOCAL_IMAGES,
  HOME_COLLECTION_SUBTITLES,
  type HomeCollectionLabel,
} from "@/lib/catalog/collection-labels"

/** Ornement : lignes fines + losange (comme sur la maquette boutique luxe) */
function GoldFlourish({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2",
        compact ? "py-0.5" : "py-1.5",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "h-px flex-1 bg-gradient-to-r from-transparent to-[#C0A080]/75",
          compact ? "max-w-[2rem] sm:max-w-[2.75rem]" : "max-w-[3rem] sm:max-w-[4.5rem]",
        )}
      />
      <span className="h-1.5 w-1.5 shrink-0 rotate-45 border border-[#B8956E] bg-[#FDFBF7]" />
      <span
        className={cn(
          "h-px flex-1 bg-gradient-to-l from-transparent to-[#C0A080]/75",
          compact ? "max-w-[2rem] sm:max-w-[2.75rem]" : "max-w-[3rem] sm:max-w-[4.5rem]",
        )}
      />
    </div>
  )
}

type CategoryRow = {
  id: number
  label: string
  sort_order: number
  image: string | null
  subtitle: string | null
}

export async function CollectionsSection() {
  let raw: CategoryRow[] = []
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("categories")
      .select("id,label,sort_order,image,subtitle")
      .order("sort_order", { ascending: true })

    raw = Array.isArray(data) ? (data as unknown as CategoryRow[]) : []
  } catch {
    raw = []
  }

  /** Toujours 4 cartes maquette ; sous-titre = base sinon texte par défaut. */
  const rows: CategoryRow[] = HOME_COLLECTION_LABELS.map((canonical, index) => {
    const normalized = (s: string) => s.replace(/\s+/g, " ").trim()
    const row = raw.find((c) => normalized(c.label) === normalized(canonical))
    const fallbackSub = HOME_COLLECTION_SUBTITLES[canonical]
    if (row) {
      return {
        ...row,
        label: canonical,
        subtitle: row.subtitle?.trim() || fallbackSub,
      }
    }
    return {
      id: -(index + 1),
      label: canonical,
      sort_order: index,
      image: null,
      subtitle: fallbackSub,
    }
  })

  return (
    <section
      className="py-14 md:py-24"
      style={{
        backgroundColor: "#F7F3EC",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(192, 160, 128, 0.09) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <LuxuryScriptHeading title="Nos Collections" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-6">
          {rows.map((c) => {
            const canonical = c.label as HomeCollectionLabel
            const href = `/boutique?category=${encodeURIComponent(canonical)}`
            const imgSrc =
              (c.image && c.image.trim()) ||
              HOME_COLLECTION_LOCAL_IMAGES[canonical] ||
              "/placeholder.svg"
            const subtitle = (c.subtitle && c.subtitle.trim()) || HOME_COLLECTION_SUBTITLES[canonical] || ""
            return (
              <Link
                key={c.id}
                href={href}
                className="group flex flex-col border border-[#d8ccb8] bg-[#FDFBF7] p-4 pb-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#C0A080]/65 hover:shadow-[0_18px_40px_rgba(0,0,0,0.07)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0A080]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
              >
                <div className="flex flex-col px-1 text-center">
                  <GoldFlourish compact />
                  <h3 className="font-serif text-base font-semibold tracking-wide text-[#B8956E] sm:text-[1.05rem]">
                    {canonical}
                  </h3>
                  <GoldFlourish compact />
                </div>

                <div className="relative mt-4 w-full px-1">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ebe6dc]">
                    <div className="absolute inset-0 grid grid-cols-1 grid-rows-1">
                      <div className="relative col-start-1 row-start-1 min-h-0 min-w-0">
                        <Image
                          src={imgSrc}
                          alt={canonical}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                      <div
                        className="pointer-events-none col-start-1 row-start-1 z-[1] bg-black/10"
                        aria-hidden
                      />
                      <div className="pointer-events-none col-start-1 row-start-1 z-[2] flex flex-col justify-end bg-gradient-to-t from-black/65 via-black/30 to-transparent px-2 pb-3.5 pt-20">
                        <p className="font-script text-center text-[clamp(1.4rem,4.2vw,2.25rem)] font-normal leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
