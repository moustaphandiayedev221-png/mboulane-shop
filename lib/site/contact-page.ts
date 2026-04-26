import { createPublicServerClient } from "@/lib/supabase/public-server"

export const CONTACT_PAGE_KEY = "contact_page" as const

export type ContactInfoIcon = "mapPin" | "phone" | "mail" | "clock"

export type ContactInfoItem = {
  icon: ContactInfoIcon
  title: string
  content: string
  detail: string
}

export type ContactPageContent = {
  hero: {
    scriptTitle: string
    subtitle: string
    eyebrowLabel: string
  }
  contactInfoHeading: string
  items: ContactInfoItem[]
  whatsapp: {
    enabled: boolean
    heading: string
    body: string
    phoneE164: string
    buttonLabel: string
  }
}

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  hero: {
    scriptTitle: "Contact",
    subtitle:
      "Une question, une suggestion ou besoin d’aide ? Notre équipe vous accompagne avec la même exigence que sur notre boutique.",
    eyebrowLabel: "Parlons ensemble",
  },
  contactInfoHeading: "Nos coordonnées",
  items: [
    { icon: "mapPin", title: "Adresse", content: "Dakar, Sénégal", detail: "Quartier Plateau" },
    { icon: "phone", title: "Téléphone", content: "+221 77 923 93 05", detail: "Lun–Sam : 9h–19h" },
    { icon: "mail", title: "Email", content: "mboulaneshop@gmail.com", detail: "Réponse sous 1 à 2 jours ouvrables" },
    { icon: "clock", title: "Horaires", content: "Lun – Sam : 9h – 19h", detail: "Dimanche : fermé" },
  ],
  whatsapp: {
    enabled: true,
    heading: "WhatsApp",
    body: "Pour une réponse plus rapide, écrivez-nous directement sur WhatsApp.",
    phoneE164: "+221779239305",
    buttonLabel: "Discuter sur WhatsApp",
  },
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback
}

const ICON_SET = new Set<ContactInfoIcon>(["mapPin", "phone", "mail", "clock"])

function parseItem(raw: unknown): ContactInfoItem | null {
  if (!isRecord(raw)) return null
  const icon = raw.icon
  const title = str(raw.title, "").trim()
  const content = str(raw.content, "").trim()
  const detail = str(raw.detail, "").trim()
  if (!title || !content) return null
  if (!ICON_SET.has(icon as ContactInfoIcon)) return null
  return { icon: icon as ContactInfoIcon, title, content, detail }
}

export function normalizeContactPage(raw: unknown): ContactPageContent {
  const base = structuredClone(DEFAULT_CONTACT_PAGE)
  if (!isRecord(raw)) return base

  const hero = raw.hero
  if (isRecord(hero)) {
    base.hero.scriptTitle = str(hero.scriptTitle, base.hero.scriptTitle).trim() || base.hero.scriptTitle
    base.hero.subtitle = str(hero.subtitle, base.hero.subtitle).trim() || base.hero.subtitle
    base.hero.eyebrowLabel = str(hero.eyebrowLabel, base.hero.eyebrowLabel).trim() || base.hero.eyebrowLabel
  }

  base.contactInfoHeading =
    str(raw.contactInfoHeading, base.contactInfoHeading).trim() || base.contactInfoHeading

  const items = raw.items
  if (Array.isArray(items)) {
    const parsed = items.map(parseItem).filter(Boolean) as ContactInfoItem[]
    if (parsed.length > 0) base.items = parsed
  }

  const whatsapp = raw.whatsapp
  if (isRecord(whatsapp)) {
    const enabled = whatsapp.enabled
    base.whatsapp.enabled = typeof enabled === "boolean" ? enabled : base.whatsapp.enabled
    base.whatsapp.heading = str(whatsapp.heading, base.whatsapp.heading).trim() || base.whatsapp.heading
    base.whatsapp.body = str(whatsapp.body, base.whatsapp.body).trim() || base.whatsapp.body
    base.whatsapp.phoneE164 = str(whatsapp.phoneE164, base.whatsapp.phoneE164).trim() || base.whatsapp.phoneE164
    base.whatsapp.buttonLabel =
      str(whatsapp.buttonLabel, base.whatsapp.buttonLabel).trim() || base.whatsapp.buttonLabel
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

export async function getContactPageContent(): Promise<ContactPageContent> {
  const raw = await fetchSettingJson(CONTACT_PAGE_KEY)
  return normalizeContactPage(raw)
}

