/**
 * Limitation de débit côté serveur.
 *
 * Sans Upstash (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`), le compteur est en mémoire
 * par instance Node : sur Vercel (plusieurs instances), la limite effective est plus souple que
 * le chiffre annoncé par endpoint — configurez Upstash en production pour un plafond global fiable.
 */
type Bucket = { count: number; resetAt: number }

const RATE_BUCKETS_KEY = "__mb_rateLimitBuckets" as const

function buckets(): Map<string, Bucket> {
  const g = globalThis as typeof globalThis & {
    [RATE_BUCKETS_KEY]?: Map<string, Bucket>
  }
  if (!g[RATE_BUCKETS_KEY]) g[RATE_BUCKETS_KEY] = new Map()
  return g[RATE_BUCKETS_KEY]!
}

export function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for")
  if (xfwd) return xfwd.split(",")[0]!.trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

export function checkRateLimit(opts: {
  key: string
  limit: number
  windowMs: number
}): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const map = buckets()
  const prev = map.get(opts.key)
  if (!prev || now >= prev.resetAt) {
    map.set(opts.key, { count: 1, resetAt: now + opts.windowMs })
    return { allowed: true, retryAfterSec: 0 }
  }
  if (prev.count >= opts.limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((prev.resetAt - now) / 1000)) }
  }
  prev.count += 1
  map.set(opts.key, prev)
  return { allowed: true, retryAfterSec: 0 }
}

/**
 * Si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sont définis, compteur partagé (multi-instance).
 * Sinon même logique que {@link checkRateLimit} (mémoire process).
 */
export async function checkRateLimitAsync(opts: {
  key: string
  limit: number
  windowMs: number
}): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return checkRateLimit(opts)

  try {
    const { Redis } = await import("@upstash/redis")
    const redis = new Redis({ url, token })
    const key = `mb:rl:${opts.key}`
    const seconds = Math.max(1, Math.ceil(opts.windowMs / 1000))
    const n = await redis.incr(key)
    if (n === 1) await redis.expire(key, seconds)
    if (n > opts.limit) {
      const ttl = await redis.ttl(key)
      return { allowed: false, retryAfterSec: ttl > 0 ? ttl : seconds }
    }
    return { allowed: true, retryAfterSec: 0 }
  } catch {
    return checkRateLimit(opts)
  }
}

