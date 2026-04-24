/**
 * URL canonique du site (OG, sitemap, metadataBase).
 * En preview / staging : définir NEXT_PUBLIC_SITE_URL (ex. https://xxx.vercel.app).
 */
export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://mboulaneshop.com"
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`
  return withProto.replace(/\/$/, "")
}
