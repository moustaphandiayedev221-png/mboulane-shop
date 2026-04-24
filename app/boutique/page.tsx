import { getProducts, getCategoryLabels } from "@/lib/catalog"
import { BoutiqueShell } from "./boutique-shell"

export default async function BoutiquePage() {
  const [initialProducts, categories] = await Promise.all([
    getProducts(),
    getCategoryLabels(),
  ])
  return <BoutiqueShell initialProducts={initialProducts} categories={categories} />
}
