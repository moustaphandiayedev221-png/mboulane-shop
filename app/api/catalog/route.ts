import { NextResponse } from "next/server"
import { getProducts } from "@/lib/catalog"
import { getCatalogApiKey } from "@/lib/deployment/config"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"

/**
 * Catalogue public en JSON (recherche site, intégrations).
 * Mitigations scraping : débit par IP (Upstash si configuré), cache CDN plus court,
 * optionnellement CATALOG_API_KEY pour lever le plafond (requêtes automatisées / partenaires).
 */
export async function GET(req: Request) {
  const catalogKey = getCatalogApiKey()
  const headerKey = req.headers.get("x-catalog-key")?.trim()
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  const provided = headerKey || bearer
  const bypassRateLimit = Boolean(catalogKey && provided === catalogKey)

  if (!bypassRateLimit) {
    const ip = getClientIp(req)
    const rl = await checkRateLimitAsync({
      key: `catalog:${ip}`,
      limit: 60,
      windowMs: 15 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSec),
            "Cache-Control": "private, no-store",
          },
        },
      )
    }
  }

  const products = await getProducts()
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
      ...(bypassRateLimit ? { "x-catalog-rate-limit": "bypass" } : {}),
    },
  })
}
