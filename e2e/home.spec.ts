import { test, expect } from "@playwright/test"

test("la page d’accueil affiche la marque", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("navigation")).toBeVisible()
  await expect(page.getByText(/MBOULANE/i).first()).toBeVisible()
})
