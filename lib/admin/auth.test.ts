import { afterEach, describe, expect, it, vi } from "vitest"
import { getAllowedAdminEmails } from "@/lib/admin/auth"

describe("getAllowedAdminEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("retourne une liste vide si ADMIN_EMAILS est absent ou vide", () => {
    vi.stubEnv("ADMIN_EMAILS", "")
    expect(getAllowedAdminEmails()).toEqual([])
  })

  it("normalise la casse et sépare par virgules", () => {
    vi.stubEnv("ADMIN_EMAILS", " Admin@Shop.com , other@EXAMPLE.org ")
    expect(getAllowedAdminEmails()).toEqual(["admin@shop.com", "other@example.org"])
  })
})
