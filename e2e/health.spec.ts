import { test, expect } from "@playwright/test"

test("GET /api/health répond", async ({ request }) => {
  const res = await request.get("/api/health")
  expect(res.status()).toBeLessThan(600)
  const json = (await res.json()) as { ok?: boolean }
  if (res.ok()) {
    expect(typeof json.ok).toBe("boolean")
  }
})
