import { createPublicServerClient } from "@/lib/supabase/public-server"

/** Clés `site_settings` pour les sections d’accueil éditables. */
export const HOME_ARTISANAL_KEY = "home_artisanal" as const
export const HOME_WHY_CHOOSE_KEY = "home_why_choose" as const

export type ArtisanalHomeContent = {
  heading: string
  intro: string
  scriptSub: string
  title: string
  badge: string
  body: string
  bullets: string[]
  imageUrl: string
  floatCardTitle: string
  floatCardSubtitle: string
}

export type WhyChooseFeature = {
  icon: "sparkles" | "shield" | "truck" | "heart"
  title: string
  description: string
}

export type WhyChooseHomeContent = {
  heading: string
  intro: string
  scriptSub: string
  columnTitle: string
  quote: string
  quoteAttribution: string
  imageUrl: string
  features: WhyChooseFeature[]
}

export const DEFAULT_ARTISANAL_HOME: ArtisanalHomeContent = {
  heading: "Collection Artisanale",
  intro:
    "Le même esprit que nos collections signature : matières nobles, gestes précis, savoir-faire transmis au Sénégal.",
  scriptSub: "Savoir-faire ancestral",
  title: "Une histoire dans chaque paire",
  badge: "Excellence artisanale",
  body:
    "Chaque paire raconte une histoire. Nos artisans perpétuent un savoir-faire transmis de génération en génération, créant des pièces uniques qui célèbrent l\u2019héritage culturel africain.",
  bullets: [
    "Cuir tanné naturellement sans produits chimiques",
    "Motifs traditionnels sénégalais sculptés à la main",
    "Éditions limitées numérotées",
    "Certificat d'authenticité inclus",
  ],
  imageUrl: "/collection-artisan.jpg",
  floatCardTitle: "100% Fait Main",
  floatCardSubtitle: "Par nos artisans",
}

export const DEFAULT_WHY_CHOOSE_HOME: WhyChooseHomeContent = {
  heading: "Pourquoi Choisir MBOULANE ?",
  intro:
    "Nous croyons que chaque pas mérite le meilleur. Nos sandales allient tradition africaine et modernité pour vous offrir une expérience unique.",
  scriptSub: "Notre promesse",
  columnTitle: "Excellence & authenticité",
  quote: "L'artisanat, c'est l'âme de notre culture",
  quoteAttribution: "— Équipe MBOULANE",
  imageUrl: "/collection-artisan.jpg",
  features: [
    {
      icon: "sparkles",
      title: "Artisanat Premium",
      description:
        "Chaque sandale est fabriquée à la main par nos artisans sénégalais avec un savoir-faire transmis de génération en génération.",
    },
    {
      icon: "shield",
      title: "Cuir 100% Véritable",
      description:
        "Nous utilisons uniquement du cuir de première qualité, sélectionné avec soin pour sa durabilité et son confort.",
    },
    {
      icon: "truck",
      title: "Livraison Rapide",
      description:
        "Livraison sous 48h à Dakar et dans toutes les régions du Sénégal. Expédition internationale disponible.",
    },
    {
      icon: "heart",
      title: "Satisfaction Garantie",
      description: "Retours gratuits sous 30 jours. Votre satisfaction est notre priorité absolue.",
    },
  ],
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function parseArtisanal(raw: unknown): ArtisanalHomeContent | null {
  if (!isRecord(raw)) return null
  const bullets = raw.bullets
  if (!Array.isArray(bullets) || !bullets.every((b) => typeof b === "string")) return null
  const bulletLines = (bullets as string[]).map((b) => b.trim()).filter(Boolean)
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : null)
  const heading = str("heading")
  const intro = str("intro")
  if (!heading || !intro) return null
  return {
    heading,
    intro,
    scriptSub: str("scriptSub") ?? DEFAULT_ARTISANAL_HOME.scriptSub,
    title: str("title") ?? DEFAULT_ARTISANAL_HOME.title,
    badge: str("badge") ?? DEFAULT_ARTISANAL_HOME.badge,
    body: str("body") ?? DEFAULT_ARTISANAL_HOME.body,
    bullets: bulletLines.length > 0 ? bulletLines : DEFAULT_ARTISANAL_HOME.bullets,
    imageUrl: str("imageUrl") ?? DEFAULT_ARTISANAL_HOME.imageUrl,
    floatCardTitle: str("floatCardTitle") ?? DEFAULT_ARTISANAL_HOME.floatCardTitle,
    floatCardSubtitle: str("floatCardSubtitle") ?? DEFAULT_ARTISANAL_HOME.floatCardSubtitle,
  }
}

const ICONS = new Set(["sparkles", "shield", "truck", "heart"])

function parseWhyChoose(raw: unknown): WhyChooseHomeContent | null {
  if (!isRecord(raw)) return null
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : null)
  const heading = str("heading")
  const intro = str("intro")
  if (!heading || !intro) return null
  const feats = raw.features
  if (!Array.isArray(feats)) return null
  const features: WhyChooseFeature[] = []
  for (const f of feats) {
    if (!isRecord(f)) return null
    const icon = f.icon
    const title = typeof f.title === "string" ? f.title : ""
    const description = typeof f.description === "string" ? f.description : ""
    if (!ICONS.has(String(icon))) return null
    features.push({ icon: icon as WhyChooseFeature["icon"], title, description })
  }
  if (features.length === 0) return null
  return {
    heading,
    intro,
    scriptSub: str("scriptSub") ?? DEFAULT_WHY_CHOOSE_HOME.scriptSub,
    columnTitle: str("columnTitle") ?? DEFAULT_WHY_CHOOSE_HOME.columnTitle,
    quote: str("quote") ?? DEFAULT_WHY_CHOOSE_HOME.quote,
    quoteAttribution: str("quoteAttribution") ?? DEFAULT_WHY_CHOOSE_HOME.quoteAttribution,
    imageUrl: str("imageUrl") ?? DEFAULT_WHY_CHOOSE_HOME.imageUrl,
    features,
  }
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

export async function getArtisanalHomeContent(): Promise<ArtisanalHomeContent> {
  const raw = await fetchSettingJson(HOME_ARTISANAL_KEY)
  const parsed = parseArtisanal(raw)
  return parsed ?? DEFAULT_ARTISANAL_HOME
}

export async function getWhyChooseHomeContent(): Promise<WhyChooseHomeContent> {
  const raw = await fetchSettingJson(HOME_WHY_CHOOSE_KEY)
  const parsed = parseWhyChoose(raw)
  return parsed ?? DEFAULT_WHY_CHOOSE_HOME
}

/** Pour l’admin (client) : fusionne une valeur API partielle avec les défauts. */
export function normalizeArtisanalHome(raw: unknown): ArtisanalHomeContent {
  return parseArtisanal(raw) ?? DEFAULT_ARTISANAL_HOME
}

export function normalizeWhyChooseHome(raw: unknown): WhyChooseHomeContent {
  return parseWhyChoose(raw) ?? DEFAULT_WHY_CHOOSE_HOME
}
