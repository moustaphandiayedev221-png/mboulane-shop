import { createPublicServerClient } from "@/lib/supabase/public-server"

export const ABOUT_PAGE_KEY = "about_page" as const

export type AboutValueIcon = "heart" | "users" | "leaf" | "award"

export type AboutValueItem = {
  icon: AboutValueIcon
  title: string
  description: string
}

export type AboutTimelineItem = {
  year: string
  title: string
  description: string
}

export type AboutPageContent = {
  metaTitle: string
  metaDescription: string
  hero: {
    scriptTitle: string
    subtitle: string
    eyebrowEmoji: string
    eyebrowLabel: string
  }
  story: {
    /** URL publique (Storage Supabase ou chemin `/…` vers `public/`) */
    imageSrc: string
    /** Chemin objet Storage si l’image vient d’un upload admin ; sinon null */
    imageStoragePath?: string | null
    heading: string
    paragraphs: string[]
    ctaLabel: string
    ctaHref: string
  }
  values: {
    eyebrow: string
    heading: string
    intro: string
    items: AboutValueItem[]
  }
  timeline: {
    heading: string
    intro: string
    items: AboutTimelineItem[]
  }
  closing: {
    heading: string
    body: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel: string
    secondaryHref: string
  }
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  metaTitle: "Notre Histoire | MBOULANE SHOP",
  metaDescription:
    "Découvrez l'histoire de MBOULANE SHOP, nos artisans et notre passion pour les sandales artisanales au Sénégal.",
  hero: {
    scriptTitle: "Notre histoire",
    subtitle:
      "MBOULANE, c’est l’élégance artisanale — la même ligne graphique que notre accueil et notre boutique.",
    eyebrowEmoji: "🇸🇳",
    eyebrowLabel: "Made in Senegal",
  },
  story: {
    imageSrc: "/collection-artisan.jpg",
    imageStoragePath: null,
    heading: "Du Sénégal au monde entier",
    paragraphs: [
      "MBOULANE SHOP est né d'une conviction profonde : l'artisanat africain mérite une place sur la scène internationale. Notre fondateur, passionné par le travail du cuir depuis son enfance, a décidé de créer une marque qui honore les traditions tout en embrassant la modernité.",
      "Chaque sandale MBOULANE est le fruit d'un savoir-faire transmis de génération en génération. Nos artisans travaillent avec passion pour créer des pièces qui allient confort et élégance.",
      "Aujourd'hui, MBOULANE c'est une équipe dévouée, des milliers de clients satisfaits, et une vision claire : la référence des sandales africaines premium.",
    ],
    ctaLabel: "Découvrir nos créations",
    ctaHref: "/boutique",
  },
  values: {
    eyebrow: "Nos valeurs",
    heading: "Ce qui nous guide",
    intro: "Les principes qui donnent leur signature à chaque paire MBOULANE.",
    items: [
      {
        icon: "heart",
        title: "Passion",
        description:
          "Chaque paire de sandales est créée avec amour et dévotion pour notre métier.",
      },
      {
        icon: "users",
        title: "Communauté",
        description:
          "Nous soutenons les artisans locaux et contribuons au développement économique du Sénégal.",
      },
      {
        icon: "leaf",
        title: "Durabilité",
        description:
          "Des matériaux de qualité pour des produits durables qui respectent l'environnement.",
      },
      {
        icon: "award",
        title: "Excellence",
        description:
          "Un engagement constant envers la qualité et la satisfaction de nos clients.",
      },
    ],
  },
  timeline: {
    heading: "Notre parcours",
    intro: "Les étapes qui ont façonné MBOULANE.",
    items: [
      {
        year: "2026",
        title: "La naissance d'une idée",
        description:
          "MBOULANE naît de la volonté de moderniser l'artisanat sénégalais tout en préservant son authenticité.",
      },
      {
        year: "2026",
        title: "Premiers pas",
        description:
          "Lancement de notre première collection avec 5 modèles et une équipe de 3 artisans.",
      },
      {
        year: "2026",
        title: "Croissance",
        description:
          "Plus de 500 clients satisfaits et expansion de notre atelier avec 10 artisans qualifiés.",
      },
      {
        year: "2026",
        title: "Aujourd'hui",
        description:
          "Une marque reconnue au Sénégal et en Afrique de l'Ouest, prête à conquérir le monde.",
      },
    ],
  },
  closing: {
    heading: "Rejoignez l'aventure MBOULANE",
    body:
      "Découvrez nos sandales et soutenez l'artisanat sénégalais — la même qualité que sur notre vitrine en ligne.",
    primaryLabel: "Voir la boutique",
    primaryHref: "/boutique",
    secondaryLabel: "Nous contacter",
    secondaryHref: "/contact",
  },
}

const VALUE_ICONS = new Set<AboutValueIcon>(["heart", "users", "leaf", "award"])

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback
}

function parseValueItem(raw: unknown): AboutValueItem | null {
  if (!isRecord(raw)) return null
  const icon = raw.icon
  const title = str(raw.title, "").trim()
  const description = str(raw.description, "").trim()
  if (!title || !description) return null
  if (!VALUE_ICONS.has(icon as AboutValueIcon)) return null
  return { icon: icon as AboutValueIcon, title, description }
}

function parseTimelineItem(raw: unknown): AboutTimelineItem | null {
  if (!isRecord(raw)) return null
  const year = str(raw.year, "").trim()
  const title = str(raw.title, "").trim()
  const description = str(raw.description, "").trim()
  if (!year || !title || !description) return null
  return { year, title, description }
}

/** Fusionne une valeur API avec les défauts (formulaire admin + robustesse). */
export function normalizeAboutPage(raw: unknown): AboutPageContent {
  const base = structuredClone(DEFAULT_ABOUT_PAGE)
  if (!isRecord(raw)) return base

  base.metaTitle = str(raw.metaTitle, base.metaTitle).trim() || base.metaTitle
  base.metaDescription = str(raw.metaDescription, base.metaDescription).trim() || base.metaDescription

  const hero = raw.hero
  if (isRecord(hero)) {
    base.hero.scriptTitle = str(hero.scriptTitle, base.hero.scriptTitle).trim() || base.hero.scriptTitle
    base.hero.subtitle = str(hero.subtitle, base.hero.subtitle).trim() || base.hero.subtitle
    base.hero.eyebrowEmoji = str(hero.eyebrowEmoji, base.hero.eyebrowEmoji)
    base.hero.eyebrowLabel = str(hero.eyebrowLabel, base.hero.eyebrowLabel).trim() || base.hero.eyebrowLabel
  }

  const story = raw.story
  if (isRecord(story)) {
    base.story.imageSrc = str(story.imageSrc, base.story.imageSrc).trim() || base.story.imageSrc
    const isp = story.imageStoragePath
    base.story.imageStoragePath =
      isp === null || isp === undefined
        ? base.story.imageStoragePath ?? null
        : typeof isp === "string"
          ? isp.trim() || null
          : null
    base.story.heading = str(story.heading, base.story.heading).trim() || base.story.heading
    const paras = story.paragraphs
    if (Array.isArray(paras)) {
      const lines = paras.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean)
      if (lines.length > 0) base.story.paragraphs = lines
    }
    base.story.ctaLabel = str(story.ctaLabel, base.story.ctaLabel).trim() || base.story.ctaLabel
    base.story.ctaHref = str(story.ctaHref, base.story.ctaHref).trim() || base.story.ctaHref
  }

  const values = raw.values
  if (isRecord(values)) {
    base.values.eyebrow = str(values.eyebrow, base.values.eyebrow).trim() || base.values.eyebrow
    base.values.heading = str(values.heading, base.values.heading).trim() || base.values.heading
    base.values.intro = str(values.intro, base.values.intro).trim() || base.values.intro
    const items = values.items
    if (Array.isArray(items)) {
      const parsed = items.map(parseValueItem).filter(Boolean) as AboutValueItem[]
      if (parsed.length > 0) base.values.items = parsed
    }
  }

  const timeline = raw.timeline
  if (isRecord(timeline)) {
    base.timeline.heading = str(timeline.heading, base.timeline.heading).trim() || base.timeline.heading
    base.timeline.intro = str(timeline.intro, base.timeline.intro).trim() || base.timeline.intro
    const items = timeline.items
    if (Array.isArray(items)) {
      const parsed = items.map(parseTimelineItem).filter(Boolean) as AboutTimelineItem[]
      if (parsed.length > 0) base.timeline.items = parsed
    }
  }

  const closing = raw.closing
  if (isRecord(closing)) {
    base.closing.heading = str(closing.heading, base.closing.heading).trim() || base.closing.heading
    base.closing.body = str(closing.body, base.closing.body).trim() || base.closing.body
    base.closing.primaryLabel = str(closing.primaryLabel, base.closing.primaryLabel).trim() || base.closing.primaryLabel
    base.closing.primaryHref = str(closing.primaryHref, base.closing.primaryHref).trim() || base.closing.primaryHref
    base.closing.secondaryLabel =
      str(closing.secondaryLabel, base.closing.secondaryLabel).trim() || base.closing.secondaryLabel
    base.closing.secondaryHref =
      str(closing.secondaryHref, base.closing.secondaryHref).trim() || base.closing.secondaryHref
  }

  return base
}

async function fetchSettingJson(key: string): Promise<unknown | null> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle()
    if (error) return null
    return data?.value ?? null
  } catch {
    return null
  }
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const raw = await fetchSettingJson(ABOUT_PAGE_KEY)
  return normalizeAboutPage(raw)
}
