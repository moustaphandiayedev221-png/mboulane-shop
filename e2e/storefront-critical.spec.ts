import { test, expect } from "@playwright/test"

test("le header invite renvoie vers la connexion", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator('a[title="Connexion"]').first()).toHaveAttribute("href", "/connexion")
})

test("un client peut ajouter un produit au panier puis ouvrir le checkout", async ({ page }) => {
  await page.goto("/boutique")
  await page.getByRole("button", { name: "Affichage liste" }).click()

  await page.getByRole("button", { name: "Panier" }).first().click()

  const checkoutLink = page.locator('a[href="/checkout"]').filter({ hasText: "Commander -" })

  await expect(page.getByRole("heading", { name: "Votre Panier" })).toBeVisible()
  await expect(checkoutLink).toBeVisible()
  await expect(page.getByText(/ajouté au panier/i)).toBeHidden({ timeout: 10000 })

  await checkoutLink.click()

  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole("heading", { name: "Récapitulatif" })).toBeVisible()
})

test("le checkout affiche l'erreur backend au lieu d'échouer silencieusement", async ({ page }) => {
  await page.route("**/api/orders", async (route) => {
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({ error: "Stock insuffisant" }),
    })
  })

  await page.goto("/boutique")
  await page.getByRole("button", { name: "Affichage liste" }).click()
  await page.getByRole("button", { name: "Panier" }).first().click()
  const checkoutLink = page.locator('a[href="/checkout"]').filter({ hasText: "Commander -" })
  await expect(checkoutLink).toBeVisible()
  await expect(page.getByText(/ajouté au panier/i)).toBeHidden({ timeout: 10000 })
  await checkoutLink.click()

  await page.getByLabel("Prénom").fill("Awa")
  await page.getByLabel("Nom").fill("Diop")
  await page.getByLabel("Email").fill("awa@example.com")
  await page.getByLabel("Téléphone").fill("+221770000000")
  await page.getByRole("button", { name: /Continuer vers la livraison/ }).click()

  await page.getByLabel("Adresse complète").fill("Dakar Plateau")
  await page.getByRole("button", { name: /Passer au paiement/ }).click()

  await page.getByRole("button", { name: /Confirmer la commande/ }).click()

  await expect(page.getByText("Stock insuffisant")).toBeVisible()
})
