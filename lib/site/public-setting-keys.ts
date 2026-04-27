import { ABOUT_PAGE_KEY } from "@/lib/site/about-page"
import { CONTACT_PAGE_KEY } from "@/lib/site/contact-page"
import { HOME_ARTISANAL_KEY, HOME_REVIEWS_STATS_KEY, HOME_WHY_CHOOSE_KEY } from "@/lib/site/home-sections"

/**
 * Clés `site_settings` exposables au public (API anon + RLS).
 * Toute nouvelle clé lue côté storefront doit être ajoutée ici et dans la migration RLS.
 */
export const PUBLIC_SITE_SETTING_KEYS = [
  "hero",
  "checkout",
  "content",
  HOME_ARTISANAL_KEY,
  HOME_WHY_CHOOSE_KEY,
  HOME_REVIEWS_STATS_KEY,
  ABOUT_PAGE_KEY,
  CONTACT_PAGE_KEY,
] as const

export type PublicSiteSettingKey = (typeof PUBLIC_SITE_SETTING_KEYS)[number]

const PUBLIC_SET = new Set<string>(PUBLIC_SITE_SETTING_KEYS)

export function isPublicSiteSettingKey(key: string): key is PublicSiteSettingKey {
  return PUBLIC_SET.has(key)
}
