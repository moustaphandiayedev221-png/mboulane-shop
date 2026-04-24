import { afterEach, describe, expect, it, vi } from "vitest"
import { getSiteBaseUrl } from "@/lib/site/base-url"

describe("getSiteBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("utilise NEXT_PUBLIC_SITE_URL si défini", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.com/")
    expect(getSiteBaseUrl()).toBe("https://preview.example.com")
  })

  it("retire le slash final", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "")
    vi.stubEnv("VERCEL_URL", "")
    const u = getSiteBaseUrl()
    expect(u.endsWith("/")).toBe(false)
  })
})
