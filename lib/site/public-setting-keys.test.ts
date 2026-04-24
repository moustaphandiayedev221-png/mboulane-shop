import { describe, expect, it } from "vitest"
import { isPublicSiteSettingKey, PUBLIC_SITE_SETTING_KEYS } from "@/lib/site/public-setting-keys"

describe("public-setting-keys", () => {
  it("refuse les clés non allowlistées", () => {
    expect(isPublicSiteSettingKey("secret_partner_api")).toBe(false)
    expect(isPublicSiteSettingKey("../admin")).toBe(false)
  })

  it("accepte les clés vitrine connues", () => {
    for (const k of PUBLIC_SITE_SETTING_KEYS) {
      expect(isPublicSiteSettingKey(k)).toBe(true)
    }
  })
})
