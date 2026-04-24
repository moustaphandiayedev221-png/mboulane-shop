import { getAllowedAdminEmails } from "@/lib/admin/auth"

export function isUpstashRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim())
}

export function getCatalogApiKey(): string | undefined {
  const k = process.env.CATALOG_API_KEY?.trim()
  return k || undefined
}

export function getDeploymentWarnings(): string[] {
  const out: string[] = []
  if (process.env.NODE_ENV === "production") {
    if (getAllowedAdminEmails().length === 0) {
      out.push("ADMIN_EMAILS est vide : l’admin reste désactivé (403).")
    }
    if (!isUpstashRedisConfigured()) {
      out.push(
        "UPSTASH_REDIS_REST_URL / TOKEN absents : le rate limiting est local à chaque instance (approximatif sur Vercel).",
      )
    }
  }
  return out
}
