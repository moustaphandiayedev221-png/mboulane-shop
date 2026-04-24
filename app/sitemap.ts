import { MetadataRoute } from "next"
import { getProductSitemapRows } from "@/lib/catalog/sitemap-meta"
import { getSiteBaseUrl } from "@/lib/site/base-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl()
  const rows = await getProductSitemapRows()
  const productUrls = rows.map((r) => {
    const last = r.updated_at ? new Date(r.updated_at) : undefined
    return {
      url: `${base}/produit/${r.id}`,
      lastModified: last,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }
  })

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/boutique`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/a-propos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/service-client`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/guide-tailles`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/livraison`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/livraison-international`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/retours`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/politique-retours-remboursements`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/paiement`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/suivi-commande`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/conditions-generales-vente`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politique-confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [
    ...staticUrls,
    ...productUrls,
  ]
}
