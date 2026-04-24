import { afterEach, describe, expect, it, vi } from "vitest"
import { getCatalogApiKey, isUpstashRedisConfigured } from "@/lib/deployment/config"

describe("deployment config helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("isUpstashRedisConfigured exige les deux variables", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "")
    expect(isUpstashRedisConfigured()).toBe(false)

    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io")
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok")
    expect(isUpstashRedisConfigured()).toBe(true)
  })

  it("getCatalogApiKey retourne undefined si absent", () => {
    vi.stubEnv("CATALOG_API_KEY", "")
    expect(getCatalogApiKey()).toBeUndefined()

    vi.stubEnv("CATALOG_API_KEY", "secret")
    expect(getCatalogApiKey()).toBe("secret")
  })
})
