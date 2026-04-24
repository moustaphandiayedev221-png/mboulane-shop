import { createPublicServerClient } from "@/lib/supabase/public-server"

export type HeroContent = {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  backgroundImage?: string | null
  backgroundImageStoragePath?: string | null
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  title: "L'élégance africaine à vos pieds",
  subtitle: "Sandales premium en cuir, fabriquées avec passion au Sénégal.",
  ctaLabel: "Découvrir",
  ctaHref: "/boutique",
  backgroundImage: "/hero-mboulane.png",
  backgroundImageStoragePath: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function normalizeHeroContent(raw: unknown): HeroContent {
  if (!isRecord(raw)) return DEFAULT_HERO_CONTENT

  return {
    title:
      typeof raw.title === "string" && raw.title.trim().length > 0
        ? raw.title
        : DEFAULT_HERO_CONTENT.title,
    subtitle:
      typeof raw.subtitle === "string" && raw.subtitle.trim().length > 0
        ? raw.subtitle
        : DEFAULT_HERO_CONTENT.subtitle,
    ctaLabel:
      typeof raw.ctaLabel === "string" && raw.ctaLabel.trim().length > 0
        ? raw.ctaLabel
        : DEFAULT_HERO_CONTENT.ctaLabel,
    ctaHref:
      typeof raw.ctaHref === "string" && raw.ctaHref.trim().length > 0
        ? raw.ctaHref
        : DEFAULT_HERO_CONTENT.ctaHref,
    backgroundImage:
      raw.backgroundImage === null
        ? DEFAULT_HERO_CONTENT.backgroundImage
        : typeof raw.backgroundImage === "string" && raw.backgroundImage.trim().length > 0
          ? raw.backgroundImage
          : DEFAULT_HERO_CONTENT.backgroundImage,
    backgroundImageStoragePath:
      raw.backgroundImageStoragePath === null
        ? null
        : typeof raw.backgroundImageStoragePath === "string" && raw.backgroundImageStoragePath.trim().length > 0
          ? raw.backgroundImageStoragePath
          : null,
  }
}

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero")
      .maybeSingle()

    if (error) return DEFAULT_HERO_CONTENT
    return normalizeHeroContent(data?.value ?? null)
  } catch {
    return DEFAULT_HERO_CONTENT
  }
}
